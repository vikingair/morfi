/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import { Error, Label, onActionWrap } from './Basic';
import { Field } from '../form';
import type { _ErrorMessage } from '../form/Form-classes';

type NumberInputProps = {
    value?: number,
    label?: string,
    error?: _ErrorMessage,
    required?: boolean,
    className?: string,
    onChange?: number => void,
    onBlur?: number => void,
    autoFocus?: boolean,
    disabled?: boolean,
};

export const NumberInput = ({
    value = 0,
    label,
    error,
    required,
    className,
    onChange,
    onBlur,
    autoFocus,
    disabled,
}: NumberInputProps) => {
    return (
        <div className={(className || '') + (error ? ' has-error' : '')}>
            {label && <Label {...{ label, required }} />}
            <input
                type="number"
                onChange={onActionWrap(onChange)}
                onBlur={onActionWrap(onBlur)}
                className="form-control"
                {...{ value, autoFocus, disabled }}
            />
            {error && <Error error={error} />}
        </div>
    );
};

type FormNumberInputProps = {|
    name: string,
    value?: number,
    error?: _ErrorMessage,
    label?: string,
    className?: string,
    disabled?: boolean,
    autoFocus?: boolean,
|};

export const _FormNumberInput = ({
    name,
    value,
    error,
    label,
    className = 'form-group',
    disabled,
    autoFocus,
}: FormNumberInputProps) => (
    <Field name={name}>
        {({ onChange, onBlur, required }) => (
            <NumberInput {...{ error, value, required, onBlur, onChange, label, className, disabled, autoFocus }} />
        )}
    </Field>
);
