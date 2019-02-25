/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';

// first all used flow types that are relevant for the package user
export type ErrorMessage = { id: string, values?: { [string]: mixed } };
type MaybeError = ErrorMessage | void;
export type Validator<F> = (F | void) => MaybeError | Promise<MaybeError>;
export type ValidationType = 'onChange' | 'onBlur' | 'onSubmit';
type FieldValidation<F> = $Shape<{| [ValidationType]: Validator<F> |}>;
export type FormValidation<V> = $Shape<$ObjMap<V, <F>(F) => FieldValidation<F>>>;
export type FormErrors<V> = $Shape<$ObjMap<V, () => ErrorMessage>>;
export type FormData<V> = {| values: V, errors: FormErrors<V>, submitting?: boolean |};
type FormProps<V: Object> = {|
    className?: string,
    validation: FormValidation<V>,
    data: FormData<V>,
    children: React$Node,
    onChange: (FormData<V>) => void,
    onSubmit: V => void | Promise<void>,
    onSubmitFailed?: (Error, FormData<V>) => void,
    onSubmitFinished?: (FormData<V>) => void,
|};
export type iForm<V: Object> = React$ComponentType<FormProps<V>>;
export type FieldProps<F> = {|
    onChange: F => void,
    onBlur: F => void,
    required: boolean,
    value: F,
    error?: MaybeError,
|};
export type FieldChildren<F> = (FieldProps<F>) => React$Node;
type iFieldProps<F> = {| children: FieldChildren<F> |};
export type iField<F> = React$StatelessFunctionalComponent<iFieldProps<F>>;
export type TypeToField = <F>(F) => iField<F>;
export type FormFields<V: Object> = $ObjMap<V, TypeToField>;
export type FormContext<V: Object> = {| Form: iForm<V>, Fields: FormFields<V> |};

// now all flow types that only used internally
type _FieldUpdater<V> = (name: $Keys<V>, value: any, type: ValidationType) => void;
type _FieldRequiredGetter<V> = (name: $Keys<V>) => boolean;

export const ValidationTypes: ValidationType[] = ['onChange', 'onBlur', 'onSubmit'];
// no explicit promise detection, because we want to be able to use all other
// promise frameworks (even if flow disallows this)
// also promise.toString() === '[object Promise]' might not work on all browsers
const isPromise = (obj: any /* V | Promise<V> */): boolean => Boolean(obj && typeof obj.then === 'function');

const validateField = <F>(field: F | void, validator?: Validator<F>): MaybeError | Promise<MaybeError> => {
    return validator && validator(field);
};

const completeFieldValidation = <F>(
    field: F | void,
    validators: FieldValidation<F>
): MaybeError | Promise<MaybeError> => {
    const promises = [];
    let syncError;
    ValidationTypes.forEach(validationType => {
        if (!syncError) {
            const error = validateField(field, validators[validationType]);
            if (error) {
                if (isPromise(error)) {
                    // there might come an error, we have to await
                    promises.push(error);
                } else {
                    // errors from sync validations will be favoured
                    syncError = error;
                }
            }
        }
    });
    if (syncError) {
        return syncError;
    }
    if (promises.length > 0) {
        return new Promise(resolve => {
            Promise.all(promises).then((results: any /* MaybeError[] */) => {
                resolve(results.find(Boolean));
            });
        });
    }
};

const copyData = <V: Object>(data: FormData<V>): FormData<V> => {
    // older flow versions (e.g. 0.54.0) can not handle destructuring of generics correctly
    return { values: { ...(data.values: any) }, errors: { ...data.errors }, submitting: data.submitting };
};

export class MorfiError extends Error {
    constructor(m: string, ...params: Array<any>) {
        super(m, ...params);
        Error.captureStackTrace && Error.captureStackTrace(this, MorfiError);
        this.name = 'MorfiError';
    }
}

export const FormUtil = {
    isPromise,

    setSubmitting: <V: *>(oldData: FormData<V>, submitting: boolean): FormData<V> => {
        const result: FormData<V> = copyData(oldData);
        result.submitting = submitting;
        return result;
    },
    update: <V: *>(oldData: FormData<V>, fieldId: $Keys<V>, value: any, error?: ErrorMessage): FormData<V> => {
        const result: FormData<V> = copyData(oldData);
        result.values[fieldId] = value;
        result.errors[fieldId] = error;
        return result;
    },
    validateField,
    completeFieldValidation,
    validateAll: <V: *>(data: FormData<V>, validation: FormValidation<V>): FormData<V> | Promise<FormData<V>> => {
        const copy: FormData<V> = copyData(data);
        const promises = [];

        Object.keys(validation).forEach((fieldId: string) => {
            const error = completeFieldValidation(data.values[fieldId], validation[fieldId]);
            if (error) {
                if (isPromise(error)) {
                    promises.push(
                        (error: any).then(err => {
                            if (err) {
                                copy.errors[fieldId] = err;
                            }
                        })
                    );
                } else {
                    copy.errors[fieldId] = (error: any);
                }
            }
        });

        // if we have still async validations in the pipeline, we have to wait
        // for all to get resolved
        if (promises.length > 0) {
            return new Promise(resolve => {
                Promise.all(promises).then(() => resolve(copy));
            });
        }

        // no async validations, so we can handle this validation synchronous
        return copy;
    },
    hasErrors: <V: Object>(data: FormData<V>): boolean =>
        Object.keys(data.errors).filter((key: string) => data.errors[key] !== undefined).length > 0,
    isRequired: <F>(validators?: FieldValidation<F>): boolean => {
        // will return always true if there are triggered async validations.
        // the user should make sure to always handle undefined synchronous,
        // to avoid side effects on rendering
        return !!validators && Boolean(completeFieldValidation(undefined, validators));
    },
    isValidationError(err: any): boolean {
        return err instanceof Error && err.name === 'MorfiError';
    },
};

type _FormProps<V> = {| ...FormProps<V>, FC: any |};
class Form<V: Object> extends Component<_FormProps<V>> {
    update: _FieldUpdater<V> = (name: string, value, type: ValidationType): void => {
        const { data, validation } = this.props;
        const validators = validation[name];
        const validator = validators ? validators[type] : undefined;
        const error = FormUtil.validateField(value, validator);

        if (FormUtil.isPromise(error)) {
            if (data.values[name] !== value) {
                // new value -> clear the previous error and update immediately
                this._onFieldChangeAfterValidation(name, value, undefined);
            }
            (error: any).then(e => {
                if (this.props.data.values[name] === value) {
                    // error corresponds to current value
                    this._onFieldChangeAfterValidation(name, value, e);
                }
            });
        } else {
            this._onFieldChangeAfterValidation(name, value, (error: any));
        }
    };

    _onFieldChangeAfterValidation = (name: $Keys<V>, nextValue: any, nextError?: ErrorMessage) => {
        const { data } = this.props;
        // if the value did not change AND
        // we had already an error or our validator did not return any error
        // -> we return undefined to avoid a store update
        if (data.values[name] !== nextValue || (nextError && !data.errors[name])) {
            this._onChange(FormUtil.update(data, name, nextValue, nextError));
        }
    };
    required: _FieldRequiredGetter<V> = (name: string) => FormUtil.isRequired(this.props.validation[name]);
    _onSubmit = (event: SyntheticEvent<*>): void => {
        event.preventDefault();
        const data = this.props.data;
        this._onChange(FormUtil.setSubmitting(data, true));
        const validated = FormUtil.validateAll(data, this.props.validation);
        if (FormUtil.isPromise(validated)) {
            (validated: any).then(validatedData => {
                this._onSubmitAfterValidation(validatedData);
            });
        } else {
            this._onSubmitAfterValidation((validated: any));
        }
    };
    _onSubmitAfterValidation = (data: any /* _FormData<V> */): void => {
        if (!FormUtil.hasErrors(data)) {
            const maybePromise = this.props.onSubmit(data.values);
            if (FormUtil.isPromise(maybePromise)) {
                (maybePromise: any).then(this._finishSubmit).catch((e: Error) => {
                    const nextData = FormUtil.setSubmitting(this.props.data, false);
                    this._onChange(nextData);
                    // pass the encountered uncatched error to onSubmitFailed
                    this._onSubmitFailed(e, nextData);
                });
            } else {
                this._finishSubmit();
            }
        } else {
            data.submitting = false;
            this._onChange(data);
            this._onSubmitFailed(new MorfiError('validation failed'), data);
        }
    };
    _finishSubmit = (): void => {
        const nextData = FormUtil.setSubmitting(this.props.data, false);
        this._onChange(nextData);
        this._onSubmitFinished(nextData);
    };
    _onChange = (data: any /* _FormData<V> */): void => {
        if (this.m) this.props.onChange(data);
    };
    _onSubmitFailed = (e: Error /* thrown object */, data: any /* _FormData<V> */): void => {
        const { onSubmitFailed } = this.props;
        if (this.m && onSubmitFailed) onSubmitFailed(e, data);
    };
    _onSubmitFinished = (data: any /* _FormData<V> */): void => {
        const { onSubmitFinished } = this.props;
        if (this.m && onSubmitFinished) onSubmitFinished(data);
    };

    componentWillUnmount(): void {
        this.m = false;
    }

    m = true;

    render(): React$Node {
        const { className, children, data, FC } = this.props;
        return (
            <form className={className} onSubmit={this._onSubmit}>
                <FC.Provider value={{ data, update: this.update, required: this.required }}>{children}</FC.Provider>
            </form>
        );
    }
}

type _iFieldProps<F> = {|
    value: F,
    error: MaybeError,
    name: string,
    update: (string, F, ValidationType) => void,
    required: string => boolean,
    ...iFieldProps<F>,
|};
const Field = <F>({ value, error, name, children, update, required }: _iFieldProps<F>): any => {
    return children({
        onChange: v => update(name, v, 'onChange'),
        onBlur: v => update(name, v, 'onBlur'),
        value,
        error,
        required: required(name),
    });
};

const makeField = <V: Object, F>(name: $Keys<V>, FC: any): iField<F> => {
    const FieldUpdater = (p: iFieldProps<F>) => (
        <FC.Consumer>
            {({ data, update, required }) => (
                <Field
                    children={p.children}
                    name={name}
                    update={update}
                    required={required}
                    value={data.values[name]}
                    error={data.errors[name]}
                />
            )}
        </FC.Consumer>
    );
    return FieldUpdater; // name for react dev tool
};

const makeForm = <V: Object>(FC: any): iForm<V> => {
    const FormUpdater = (p: FormProps<V>) => <Form {...p} FC={FC} />;
    return FormUpdater; // name for react dev tool
};

const create = <V: Object>(initial: V): FormContext<V> => {
    const FC = React.createContext({ data: { values: initial, errors: {} } });
    const Form = makeForm(FC);
    const Fields: any = Object.keys(initial).reduce((r: Object, name: string) => {
        r[name] = makeField(name, FC);
        return r;
    }, {});
    return { Form, Fields };
};

export const Morfi = { create, hasErrors: FormUtil.hasErrors, isValidationError: FormUtil.isValidationError };
