/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import { Error, Label, onActionWrap } from './Basic';
import { Field } from '../form';
import type { _ErrorMessage } from '../form/Form-classes';
import { Spinner } from '../components/Spinner';

type AllowedTypes = 'text' | 'password';

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
    type?: AllowedTypes,
    placeholder?: string,
    pending?: boolean,
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
    type = 'text',
    placeholder,
    pending,
}: InputProps) => {
    return (
        <div className={className}>
            {label && <Label {...{ label, required }} />}
            <input
                onChange={onActionWrap(onChange)}
                onBlur={onActionWrap(onBlur)}
                disabled={disabled || pending}
                className={'form-control' + (error ? ' is-invalid' : '')}
                {...{ type, placeholder, value, autoFocus }}
            />
            {pending && <Spinner />}
            {error && <Error error={error} />}
        </div>
    );
};

type FormInputProps = {|
    name: string,
    value?: string,
    error?: _ErrorMessage,
    label?: string,
    className?: string,
    disabled?: boolean,
    autoFocus?: boolean,
    type?: AllowedTypes,
    placeholder?: string,
    pending?: boolean,
|};

export const _FormInput = ({
    name,
    value,
    error,
    label,
    className = 'form-group',
    disabled,
    autoFocus,
    type,
    placeholder,
    pending,
}: FormInputProps) => (
    <Field name={name}>
        {({ onChange, onBlur, required }) => (
            <Input
                {...{
                    error,
                    value,
                    required,
                    onBlur,
                    onChange,
                    label,
                    className,
                    disabled,
                    autoFocus,
                    type,
                    placeholder,
                    pending,
                }}
            />
        )}
    </Field>
);
