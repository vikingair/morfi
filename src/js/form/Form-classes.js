/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

export type _ErrorMessage = { id: string, values?: { [string]: mixed } };
export type _Validator = any => _ErrorMessage | void;

export type ValidationType = 'onChange' | 'onBlur';
export const ValidationTypes: { [ValidationType]: ValidationType } = {
    onChange: 'onChange',
    onBlur: 'onBlur',
};

type FieldValidation = { [ValidationType]: _Validator | void };
export type FormValidation<V> = { [$Keys<V>]: FieldValidation };
export type _FormData<V: *> = { values: V, errors: { [$Keys<V>]: void | _ErrorMessage } };

export const __forEach = (obj: any, handler: (any, any) => any | void): any | void => {
    for (let key: any in obj) {
        // flow does not support the for-in-notation correctly for now
        if (obj.hasOwnProperty(key)) {
            const result = handler(obj[key], key);
            if (result !== undefined) {
                return result;
            }
        }
    }
};

const validateField = <F>(field: F, validator?: _Validator): _ErrorMessage | void => {
    if (validator) {
        const error = validator(field);
        if (error) {
            return error;
        }
    }
};

const completeFieldValidation = <F>(field: F, validators: FieldValidation): _ErrorMessage | void => {
    return __forEach(ValidationTypes, validationType => validateField(field, validators[validationType]));
};

export const ReactPropTypesAny = () => null;

export const FormUtil = {
    update: <V: *>(oldData: _FormData<V>, fieldId: $Keys<V>, value: any, error?: _ErrorMessage): _FormData<V> => {
        const result = { values: { ...oldData.values }, errors: { ...oldData.errors } };
        result.values[fieldId] = value;
        result.errors[fieldId] = error;
        return result;
    },
    validateField,
    completeFieldValidation,
    validateAll: <V: *>(data: _FormData<V>, validation: FormValidation<V>): _FormData<V> => {
        const copy = { values: { ...data.values }, errors: { ...data.errors } };

        __forEach(validation, (validators: FieldValidation, fieldId: string): void => {
            copy.errors[fieldId] = completeFieldValidation(data.values[fieldId], validators);
        });

        return copy;
    },
    hasErrors: <V>(data: _FormData<V>): boolean => {
        return Boolean(
            __forEach(data.errors, (error?: _ErrorMessage) => {
                if (error) {
                    return true;
                }
            })
        );
    },
    isRequired(validators: FieldValidation = {}): boolean {
        return Boolean(completeFieldValidation(undefined, validators));
    },
};
