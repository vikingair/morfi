
import { FC, ReactNode } from 'react';

export type ErrorMessage = { id: string, values?: { [key: string]: ReactNode } };
type MaybeError = ErrorMessage | void;
export type Validator<F> = (value?: F) => MaybeError | Promise<MaybeError>;

export type ValidationType = 'onChange' | 'onBlur' | 'onSubmit';
type FieldValidation<F> = Partial<{ [key in ValidationType]: Validator<F> }>;

export type FormValidation<V> = Partial<{ [key in keyof V]: FieldValidation<key>}>;
export type FormErrors<V> = Partial<{ [key in keyof V]: ErrorMessage }>;
export type FormData<V> = { values: V, errors: FormErrors<V>, submitting?: boolean };
type FormProps<V> = {
    className?: string,
    validation: FormValidation<V>,
    data: FormData<V>,
    children: ReactNode,
    onChange: (data: FormData<V>) => void,
    onSubmit: (values: V) => void | Promise<void>,
    onSubmitFailed?: (error: Error, data: FormData<V>) => void,
    onSubmitFinished?: (data: FormData<V>) => void,
};
export type iForm<V> = FC<FormProps<V>>;
export type FieldProps<F> = {
    onChange: (value: F) => void,
    onBlur: (value: F) => void,
    required: boolean,
    value: F,
    error?: ErrorMessage,
};
export type FieldChildren<F> = FC<FieldProps<F>>;
type iFieldProps<F> = { children: FieldChildren<F> };
export type iField<F> = FC<iFieldProps<F>>;
export type FormFields<V> = { [key in keyof V]: iField<V[key]> };
export type FormContext<V> = { Form: iForm<V>, Fields: FormFields<V> };

export class MorfiError extends Error {}
type MorfiCreate = <V>(initial: V) => FormContext<V>;
type MorfiHasErrors = <V>(data: FormData<V>) => boolean;
type MorfiIsValidationError = (error: any) => boolean;
type IMorfi = {
    create: MorfiCreate,
    hasErrors: MorfiHasErrors,
    isValidationError: MorfiIsValidationError
};

export const Morfi: IMorfi;
