/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

export type _ErrorMessage = { id: string, values?: { [string]: mixed } };
type MaybeError = _ErrorMessage | void;
export type _Validator = any => MaybeError | Promise<MaybeError>;

export type ValidationType = 'onChange' | 'onBlur' | 'onSubmit';
export const ValidationTypes: { [ValidationType]: ValidationType } = {
    onChange: 'onChange',
    onBlur: 'onBlur',
    onSubmit: 'onSubmit',
};

type FieldValidation = { [ValidationType]: _Validator | void };
export type _FormValidation<V> = { [$Keys<V>]: FieldValidation };
export type _FormData<V: *> = { values: V, errors: { [$Keys<V>]: void | _ErrorMessage }, submitting?: boolean };

// no explicit promise detection, because we want to be able to use all other
// promise frameworks (even if flow disallows this)
// also promise.toString() === '[object Promise]' might not work on all browsers
const isPromise = (obj: any /* V | Promise<V> */): boolean => Boolean(obj && typeof obj.then === 'function');

const find = (objOrArray: any, predicate: (any, any) => any): any => {
    for (let key: any in objOrArray) {
        // flow does not support the for-in-notation correctly for now
        if (objOrArray.hasOwnProperty(key)) {
            const value = objOrArray[key];
            if (predicate(value, key)) {
                return value;
            }
        }
    }
};

const findFirstTruthy = (objOrArray: any): any => find(objOrArray, v => v);

export const forEach = (objOrArray: any, handler: (any, any) => any): void => {
    find(objOrArray, (val, key) => {
        handler(val, key);
    });
};

const validateField = <F>(field: F, validator?: _Validator): MaybeError | Promise<MaybeError> => {
    return validator && validator(field);
};

const completeFieldValidation = <F>(field: F, validators: FieldValidation): MaybeError | Promise<MaybeError> => {
    const promises = [];
    let syncError;
    find(ValidationTypes, validationType => {
        const error = validateField(field, validators[validationType]);
        if (error) {
            if (isPromise(error)) {
                // there might come an error, we have to await
                promises.push(error);
            } else {
                // errors from sync validations will be favoured
                syncError = error;
                return true;
            }
        }
    });
    if (syncError) {
        return syncError;
    }
    if (promises.length > 0) {
        return new Promise(resolve => {
            Promise.all(promises).then((results: any /* MaybeError[] */) => {
                resolve(findFirstTruthy(results));
            });
        });
    }
};

const copyData = <V>(data: _FormData<V>): _FormData<V> => {
    // older flow versions (e.g. 0.54.0) can not handle destructuring of generics correctly
    return { values: { ...(data.values: any) }, errors: { ...data.errors }, submitting: data.submitting };
};

export const ReactPropTypesAny = () => null;

export const FormUtil = {
    isPromise,

    setSubmitting: <V: *>(oldData: _FormData<V>, submitting: boolean): _FormData<V> => {
        const result: _FormData<V> = copyData(oldData);
        result.submitting = submitting;
        return result;
    },
    update: <V: *>(oldData: _FormData<V>, fieldId: $Keys<V>, value: any, error?: _ErrorMessage): _FormData<V> => {
        const result: _FormData<V> = copyData(oldData);
        result.values[fieldId] = value;
        result.errors[fieldId] = error;
        return result;
    },
    validateField,
    completeFieldValidation,
    validateAll: <V: *>(data: _FormData<V>, validation: _FormValidation<V>): _FormData<V> | Promise<_FormData<V>> => {
        const copy: _FormData<V> = copyData(data);
        const promises = [];

        forEach(validation, (validators: FieldValidation, fieldId: string): void => {
            const error = completeFieldValidation(data.values[fieldId], validators);
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
    hasErrors: <V>(data: _FormData<V>): boolean => {
        return Boolean(findFirstTruthy(data.errors));
    },
    isRequired(validators: FieldValidation = {}): boolean {
        // will return always true if there are triggered async validations.
        // the user should make sure to always handle undefined synchronous,
        // to avoid side effects on rendering
        return Boolean(completeFieldValidation(undefined, validators));
    },
};
