/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import { DisplayError, Label, onActionWrap } from './Basic';
import type { FieldProps, iField } from '../../../src';

type CommonNumberInputProps = {|
    label?: string,
    className?: string,
    autoFocus?: boolean,
    disabled?: boolean,
|};

type NumberInputProps = {| ...FieldProps<number | void>, ...CommonNumberInputProps |};

export const NumberInput = ({
    value,
    label,
    error,
    required,
    className,
    onChange,
    onBlur,
    autoFocus,
    disabled,
}: NumberInputProps) => {
    const onChangeWrapped = (v: string) => {
        onChange(v === '' ? undefined : Number(v));
    };
    return (
        <div className={className}>
            {label && <Label {...{ label, required }} />}
            <input
                type="number"
                value={value === undefined ? '' : String(value)}
                onChange={onActionWrap(onChangeWrapped)}
                onBlur={onActionWrap(onBlur)}
                className={'form-control' + (error ? ' is-invalid' : '')}
                {...{ autoFocus, disabled }}
            />
            {error && <DisplayError error={error} />}
        </div>
    );
};

type FormNumberInputProps = {| Field: iField<number | void>, ...CommonNumberInputProps |};

export const FormNumberInput = ({ Field, ...rest }: FormNumberInputProps) => (
    <Field>{fieldProps => <NumberInput {...fieldProps} {...rest} />}</Field>
);
