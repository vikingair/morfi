// @flow

import React from 'react';
import { Error, Label, onActionWrap } from './Basic';
import { Field } from '../form';
import type { _ErrorMessage } from '../form/Form-classes';

type InputProps = {
    value?: string,
    label?: string,
    error?: _ErrorMessage,
    required?: boolean,
    className?: string,
    onChange?: string => void,
    onBlur?: string => void,
    autoFocus?: boolean,
    disabled?: boolean,
};

export const Input = ({
    value = '',
    label,
    error,
    required,
    className,
    onChange,
    onBlur,
    autoFocus,
    disabled,
}: InputProps) => {
    return (
        <div className={(className || '') + (error ? ' has-error' : '')}>
            {label && <Label {...{ label, required }} />}
            <input
                type="text"
                onChange={onActionWrap(onChange)}
                onBlur={onActionWrap(onBlur)}
                className="form-control"
                {...{ value, autoFocus, disabled }}
            />
            {error && <Error error={error} />}
        </div>
    );
};

type FormInputProps = {
    name: string,
    value?: string,
    error?: _ErrorMessage,
    label?: string,
    className?: string,
    disabled?: boolean,
    autoFocus?: boolean,
};

export const _FormInput = ({
    name,
    value,
    error,
    label,
    className = 'form-group',
    disabled,
    autoFocus,
}: FormInputProps) => (
    <Field name={name}>
        {({ onChange, onBlur, required }) => (
            <Input {...{ error, value, required, onBlur, onChange, label, className, disabled, autoFocus }} />
        )}
    </Field>
);
