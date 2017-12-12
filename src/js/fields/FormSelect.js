/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import type { _ErrorMessage } from '../form/Form-classes';
import { _Field as Field } from '../form/Field';
import { Error, Label, onActionWrap } from './Basic';

export type SelectOption = {| label: string, value: string |};

type SelectProps = {
    value?: string,
    label?: string,
    error?: _ErrorMessage,
    required?: boolean,
    className?: string,
    onChange?: string => void,
    onBlur?: string => void,
    options: Array<SelectOption>,
    disabled?: boolean,
};

const Option = ({ option }: { option: SelectOption }) => <option value={option.value}>{option.label}</option>;

const Select = ({ value, label, error, required, className, onChange, onBlur, options, disabled }: SelectProps) => {
    return (
        <div className={className}>
            {label && <Label {...{ label, required }} />}
            <select
                className="form-control"
                disabled={disabled}
                onChange={onActionWrap(onChange)}
                onBlur={onActionWrap(onBlur)}
                value={value}>
                {options.map((option: SelectOption, index: number) => <Option option={option} key={index} />)}
            </select>
            {error && <Error error={error} />}
        </div>
    );
};

type FormSelectProps = {|
    name: string,
    value?: string,
    error?: _ErrorMessage,
    label?: string,
    className?: string,
    options: Array<SelectOption>,
    disabled?: boolean,
|};

export const _FormSelect = ({
    name,
    value,
    error,
    options,
    label,
    className = 'form-group',
    disabled,
}: FormSelectProps) => (
    <Field name={name}>
        {({ onChange, onBlur, required }) => (
            <Select {...{ error, value, required, onBlur, onChange, label, className, disabled, options }} />
        )}
    </Field>
);
