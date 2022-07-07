import React, {
    RefAttributes,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';

export type ErrorMessage = string | { id: string; values?: { [key: string]: React.ReactNode } };
type MaybeError = ErrorMessage | undefined;
export type FormErrors = { [name: FormField<any>]: ErrorMessage | undefined };
export type Validator<F> = (value?: F) => MaybeError | Promise<MaybeError>;
export type ValidationType = 'onChange' | 'onBlur' | 'onSubmit';
export type FieldValidation<F> = { [t in ValidationType]?: Validator<F> };
export type FormValidation<V> = {
    [name in keyof V]?: V[name] extends object
        ? FormValidation<V[name]> & FieldValidation<V[name]>
        : FieldValidation<V[name]>;
};
export type FormDirty = { [name: FormField<any>]: boolean };
// draw back by using "symbol" as part of the type: for nested objects accessing the "description" property can lead
// to losing type safety, because "description" is a reserved property for symbols and results into type collision.
export type FormField<F> = { __TYPE__: F } & symbol;
export type FormFields<V> = V extends object
    ? Required<{ [name in keyof V]: FormFields<V[name]> }> & FormField<V>
    : FormField<V>;
export type FormData<V> = {
    values: V;
    errors: FormErrors;
    hasErrors: boolean;
    dirty: FormDirty;
    isDirty: boolean;
    isSubmitting: boolean;
};

export type FormProps<V> = {
    className?: string;
    validation?: FormValidation<V>;
    data: FormData<V>;
    version?: number;
    children: React.ReactNode;
    onChange: (data: FormData<V>) => void;
    onSubmit?: (values: V) => void | Promise<any>;
    onSubmitFailed?: (err: Error, data: FormData<V>) => void;
    onSubmitFinished?: (data: FormData<V>) => void;
};
export type FormRef<V> = {
    submit: () => void;
    updateInitialData: (mapper: (data: V) => V) => void;
};

type Updater<V> = <F extends keyof V, VT extends ValidationType>(
    key: FormField<any>,
    valType: VT,
    value: VT extends 'onChange' ? V[F] : undefined
) => void;

export class MorfiError extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = this.constructor.name;
    }
    /* c8 ignore next */
}

type MorfiContext<V> = {
    data: FormData<V>;
    update: Updater<V>;
    isRequired: (key: FormField<any>) => boolean;
    clearErrors: (key: FormField<any>) => void;
};

const morfiContext = React.createContext<MorfiContext<any>>(null as any);

// no explicit promise detection, because we want to be able to use all other
// promise frameworks (even if flow disallows this)
// also promise.toString() === '[object Promise]' might not work on all browsers
const isPromise = (obj: any): boolean => Boolean(obj && typeof obj.then === 'function');

// this determines also the order in which the validations will be applied
const ValidationTypes: ValidationType[] = ['onChange', 'onBlur', 'onSubmit'];
const completeFieldValidation = <F,>(
    validators?: FieldValidation<F>,
    field?: F
): void | MaybeError | Promise<MaybeError> => {
    if (!validators) return;
    const promises: Promise<MaybeError>[] = [];
    let syncError: MaybeError;
    ValidationTypes.forEach((validationType) => {
        const validator = validators[validationType];
        if (validator && !syncError) {
            const error = validator(field);
            if (error) {
                if (isPromise(error)) {
                    // there might come an error, we have to await
                    promises.push(error as Promise<MaybeError>);
                } else {
                    // errors from sync validations will be favoured
                    syncError = error as MaybeError;
                }
            }
        }
    });
    if (syncError) {
        return syncError;
    }
    if (promises.length > 0) {
        return new Promise((resolve) => {
            Promise.all(promises).then((results: MaybeError[]) => {
                resolve(results.find(Boolean));
            });
        });
    }
};

const getByFormField = (fieldId: FormField<any> | string, nested?: Record<string, any>): any => {
    // if provided the "fields" returned by "Morfi.useForm" directly, this has a global meaning
    const name = fieldId.toString();
    if (!name) return nested;
    const fieldIdParts = name.split('.');
    return fieldIdParts.reduce((data, part) => data?.[part] as any, nested);
};

const dotPrefix = (name: string, prefix = ''): string => (prefix && prefix + '.') + name;

/**
 * Given a validation this function returns an object containing the field validations by field keys.
 */
const getAllValidators = <V,>(validation: FormValidation<V>, prefix?: string): Record<string, FieldValidation<any>> =>
    Object.entries(validation).reduce((red, [name, val]) => {
        const dottedPrefix = dotPrefix(name, prefix);
        if (!val) return red;
        const { onChange, onBlur, onSubmit, ...rest } = val as FieldValidation<any>;
        return {
            ...red,
            [dottedPrefix]: { onChange, onBlur, onSubmit },
            ...getAllValidators(rest, dottedPrefix),
        };
    }, {} as Record<string, any>);

const validateAll = <V,>(data: FormData<V>, validation: FormValidation<V>): FormData<V> | Promise<FormData<V>> => {
    const copy: FormData<V> = deepCopyData(data);
    const promises: Promise<void>[] = [];
    const allValidators = getAllValidators(validation);

    Object.entries(allValidators).forEach(([fieldId, validator]) => {
        const error = completeFieldValidation(validator, getByFormField(fieldId, data.values));
        if (error) {
            if (isPromise(error)) {
                promises.push(
                    (error as Promise<MaybeError>).then((err) => {
                        copy.errors[fieldId as any] = err;
                    })
                );
            } else {
                copy.errors[fieldId as any] = error as MaybeError;
            }
        }
    });

    // if we have still async validations in the pipeline, we have to wait
    // for all to get resolved
    if (promises.length > 0) {
        return new Promise((resolve) => {
            Promise.all(promises).then(() => resolve(_nextData(copy)));
        });
    }

    // no async validations, so we can handle this validation synchronous
    return _nextData(copy);
};

const deepUpdateValue = (
    values: FormData<any>['values'],
    fieldKey: FormField<any>,
    value: any
): FormData<any>['values'] => {
    const fieldIdParts = fieldKey.toString().split('.');
    const result = { ...values };
    let cur = result;
    fieldIdParts.forEach((part, index) => {
        if (index === fieldIdParts.length - 1) {
            cur[part] = value;
        } else {
            cur[part] = { ...cur[part] };
            cur = cur[part];
        }
    });
    return result;
};

const updateField = <V, FK extends keyof V>(
    oldData: FormData<V>,
    fieldKey: FormField<FK>,
    value: V[FK],
    dirty: boolean,
    error?: ErrorMessage
): FormData<V> => {
    const result: FormData<V> = deepCopyData(oldData);
    result.values = deepUpdateValue(result.values, fieldKey, value);
    result.dirty[fieldKey] = dirty;
    result.errors[fieldKey] = error;
    return _nextData(result);
};

// in order to mutate no references on old data objects, we need to create deep copies
const deepCopyData = <V,>(data: FormData<V>): FormData<V> => ({
    ...data,
    values: { ...data.values },
    errors: { ...data.errors },
    dirty: { ...data.dirty },
});

const _hasErrors = <T,>(data: FormData<T>): boolean => Object.values(data.errors).some((e) => e !== undefined);
const _nextData = <T,>(data: FormData<T>): FormData<T> => ({
    ...data,
    hasErrors: _hasErrors(data),
    isDirty: Object.values(data.dirty).some(Boolean),
});

type PropsRef<V> = React.MutableRefObject<Omit<FormProps<V>, 'children' | 'clasName'>>;
const useFormCallbacks = <V,>(
    propsRef: PropsRef<V>
): Required<Pick<FormProps<V>, 'onChange' | 'onSubmitFinished' | 'onSubmitFailed'>> => {
    const isMounted = useRef(true);
    useEffect(
        () => () => {
            isMounted.current = false;
        },
        []
    );

    const onChange = useCallback((data: FormData<V>) => {
        if (isMounted.current) propsRef.current.onChange(data);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const onSubmitFailed = useCallback((err: Error, data: FormData<V>) => {
        if (isMounted.current)
            Promise.resolve().then(() => {
                // we need to invoke this in the next tick, because of React18 automatic batching of updates
                propsRef.current.onSubmitFailed?.(err, data);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const onSubmitFinished = useCallback((data: FormData<V>) => {
        if (isMounted.current)
            Promise.resolve().then(() => {
                // we need to invoke this in the next tick, because of React18 automatic batching of updates
                propsRef.current.onSubmitFinished?.(data);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { onChange, onSubmitFinished, onSubmitFailed };
};

const useFormUpdater = <V,>(
    propsRef: PropsRef<V>,
    initialRef: React.MutableRefObject<V>,
    onChange: FormProps<V>['onChange']
): React.MutableRefObject<Updater<V>> => {
    const _onFieldChangeAfterValidation = useCallback(
        <FK extends keyof V>(fieldKey: FormField<FK>, nextValue: V[FK], nextError?: ErrorMessage) => {
            const { data } = propsRef.current;
            // if the value did not change AND
            // we had already an error or our validator did not return any error
            // -> we return undefined to avoid a store update
            if (getByFormField(fieldKey, data.values) !== nextValue || (nextError && !data.errors[fieldKey])) {
                onChange(
                    updateField<V, FK>(
                        data,
                        fieldKey,
                        nextValue,
                        nextValue !== getByFormField(fieldKey, initialRef.current),
                        nextError
                    )
                );
            }
        },
        [onChange] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const updateCB = useCallback<Updater<V>>(
        (fieldKey, type, val) => {
            const { data, validation } = propsRef.current;
            const value =
                type === 'onChange' ? (val as NonNullable<typeof val>) : getByFormField(fieldKey, data.values);
            const error = getByFormField(fieldKey, validation)?.[type]?.(value);

            if (isPromise(error)) {
                if (getByFormField(fieldKey, data.values) !== value) {
                    // new value -> clear the previous error and update immediately
                    _onFieldChangeAfterValidation(fieldKey, value, undefined);
                }
                (error as Promise<MaybeError>).then((e) => {
                    // async: get latest value again
                    if (getByFormField(fieldKey, propsRef.current.data.values) === value) {
                        // error corresponds to current value
                        _onFieldChangeAfterValidation(fieldKey, value, e);
                    }
                });
            } else {
                _onFieldChangeAfterValidation(fieldKey, value, error as MaybeError);
            }
        },
        [_onFieldChangeAfterValidation] // eslint-disable-line react-hooks/exhaustive-deps
    );
    const update = useRef<Updater<V>>(updateCB);
    update.current = updateCB;
    return update;
};

const useFormSubmit = <V,>(
    propsRef: PropsRef<V>,
    onChange: FormProps<V>['onChange'],
    resetInitialRef: (values: V) => void,
    onSubmitFinished: NonNullable<FormProps<V>['onSubmitFinished']>,
    onSubmitFailed: NonNullable<FormProps<V>['onSubmitFailed']>
): ((e?: React.FormEvent<HTMLFormElement>) => void) => {
    const _finishSubmit = useCallback((): void => {
        const nextData: FormData<V> = _nextData({ ...propsRef.current.data, isSubmitting: false, dirty: {} });
        resetInitialRef(nextData.values);
        onChange(nextData);
        onSubmitFinished(nextData);
    }, [onChange, onSubmitFinished]); // eslint-disable-line react-hooks/exhaustive-deps

    const _onSubmitAfterValidation = useCallback(
        (data: FormData<V>): void => {
            if (!data.hasErrors) {
                (new Promise((r) => r(propsRef.current.onSubmit?.(data.values))) as Promise<any>)
                    .then(_finishSubmit)
                    .catch((e: Error) => {
                        const nextData = { ...propsRef.current.data, isSubmitting: false };
                        onChange(nextData);
                        // pass the encountered uncatched error to onSubmitFailed
                        onSubmitFailed(e, nextData);
                    });
            } else {
                const nextData = { ...data, isSubmitting: false };
                onChange(nextData);
                onSubmitFailed(new MorfiError('validation failed'), nextData);
            }
        },
        [_finishSubmit, onChange, onSubmitFailed] // eslint-disable-line react-hooks/exhaustive-deps
    );

    return useCallback(
        (event?: React.FormEvent): void => {
            event?.preventDefault();
            const { data, validation } = propsRef.current;
            onChange({ ...data, isSubmitting: true });
            const validated = validation ? validateAll(data, validation) : data;
            if (isPromise(validated)) {
                (validated as Promise<FormData<V>>).then((validatedData) => {
                    _onSubmitAfterValidation(validatedData);
                });
            } else {
                _onSubmitAfterValidation(validated as FormData<V>);
            }
        },
        [_onSubmitAfterValidation, onChange] // eslint-disable-line react-hooks/exhaustive-deps
    );
};

const FormInner = <V,>(
    { className, children, version, ...props }: FormProps<V>,
    formRef: React.ForwardedRef<FormRef<V>>
) => {
    // is used for value comparison for dirty checks
    const initialRef = useRef(props.data.values);
    const resetInitialRef = useCallback((values: V) => {
        initialRef.current = values;
    }, []);

    // using props ref container to avoid unnecessary re-renders
    const propsRef = useRef(props);
    propsRef.current = props;
    const { onChange, onSubmitFinished, onSubmitFailed } = useFormCallbacks(propsRef);
    const update = useFormUpdater(propsRef, initialRef, onChange);
    const onSubmit = useFormSubmit(propsRef, onChange, resetInitialRef, onSubmitFinished, onSubmitFailed);

    const [ctx, setCtx] = useState<MorfiContext<V>>(() => ({
        data: props.data,
        update: ((...args) => update.current(...args)) as Updater<V>,
        isRequired: <F extends keyof V>(field: FormField<F>) =>
            !!completeFieldValidation(getByFormField(field, propsRef.current.validation)),
        clearErrors: <F extends keyof V>(field: FormField<F>) =>
            propsRef.current.onChange(Morfi.clearErrors(propsRef.current.data, field)),
    }));

    // update all fields if parent component provides new data
    const skipInitial = useRef(true);
    useEffect(() => {
        if (skipInitial.current) return;
        setCtx((prev) => ({ ...prev, data: props.data }));
    }, [props.data]);

    // update initial values on version change (can be used for multi submit forms)
    useEffect(() => {
        if (skipInitial.current) return;
        resetInitialRef(propsRef.current.data.values);
        onChange(_nextData({ ...propsRef.current.data, errors: {}, dirty: {} }));
    }, [version]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        skipInitial.current = false;
    }, []);

    useImperativeHandle<FormRef<V> | null, FormRef<V>>(
        formRef,
        () => ({
            submit: () => onSubmit(),
            updateInitialData: (mapper) => {
                initialRef.current = mapper(initialRef.current);
            },
        }),
        [onSubmit]
    );

    const { Provider } = morfiContext;

    return (
        <form className={className} onSubmit={onSubmit} noValidate>
            <Provider value={ctx}>{children}</Provider>
        </form>
    );
};

type FormComponent<V> = React.FC<FormProps<V> & RefAttributes<FormRef<V>>>;
const Form: FormComponent<any> = React.forwardRef(FormInner);

export type FieldControls<F> = {
    onChange: (value: F) => void;
    onBlur: () => void;
    required: boolean;
    dirty: boolean;
    value: F;
    error?: MaybeError;
    name: string;
};

const useField = <F,>(field: FormField<F>): FieldControls<F> => {
    const { update, data, isRequired } = useContext(morfiContext);
    return {
        onChange: useCallback((v) => update(field, 'onChange', v), [update, field]),
        onBlur: useCallback(() => update(field, 'onBlur', undefined), [update, field]),
        value: getByFormField(field, data.values),
        error: data.errors[field],
        dirty: !!data.dirty[field],
        required: isRequired(field),
        name: field.toString(),
    };
};

const _createFieldNameProxy = (prefix = ''): any =>
    new Proxy({} as any, {
        get(target, prop) {
            if (prop === 'toString' || typeof prop === 'symbol') return () => prefix; // if used as symbol (e.g. object key)
            // prevent creating new proxies on and on again
            if (!target[prop]) target[prop] = _createFieldNameProxy(dotPrefix(prop, prefix));
            return target[prop];
        },
    });

export type MorfiContainer<V> = {
    fields: FormFields<V>;
    Form: FormComponent<V>;
};

const useForm = <V extends Record<string, any>>(): MorfiContainer<V> =>
    useMemo(() => ({ fields: _createFieldNameProxy(), Form }), []);

const initialData = <V,>(values: V): FormData<V> => ({
    values,
    errors: {},
    hasErrors: false,
    dirty: {},
    isDirty: false,
    isSubmitting: false,
});

const notSubmittable = <V,>(
    { hasErrors, isDirty, isSubmitting }: FormData<V>,
    { skipDirty }: { skipDirty?: boolean } = {}
): boolean => hasErrors || isSubmitting || !(isDirty || skipDirty);

const isValidationError = (err: any): boolean => err instanceof MorfiError;

const clearErrors = (data: FormData<any>, field: FormFields<unknown>) => {
    const errorEntries = Object.entries(data.errors).filter(
        ([name, value]) => value && !name.startsWith(field.toString())
    );
    const errors = Object.fromEntries(errorEntries);
    return { ...data, errors, hasErrors: !!errorEntries.length };
};

const useClearErrors = () => useContext(morfiContext).clearErrors;

export const Morfi = { useForm, useField, initialData, notSubmittable, isValidationError, clearErrors, useClearErrors };
