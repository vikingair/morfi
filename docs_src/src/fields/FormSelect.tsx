import React from 'react';
import { Morfi, ErrorMessage, FormField } from '../../../src';
import { EventUtil } from './event-util';
import { DisplayError, Label } from './Basic';

export type SelectOption<T> = { label: string; value: T };

type CommonSelectProps<T> = {
    serialize?: (value: T) => string;
    label?: string;
    required?: boolean;
    className?: string;
    options: ReadonlyArray<SelectOption<T>>;
    disabled?: boolean;
};

type SelectProps<T> = {
    value: T;
    error?: ErrorMessage;
    required?: boolean;
    onChange?: (value: T) => void;
    onBlur?: (value: T) => void;
} & CommonSelectProps<T>;

/**
 * ATTENTION: Since react v16.6 you have to supply strings or numbers within <option> tags.
 *            So you should not use any placeholders inside the messages you use as
 *            label for the select options.
 */
const Option = ({ label, value }: { label: string; value: string }) => <option value={value}>{label}</option>;

const _identity = (v: unknown): unknown => v;

const getOptionValues = <T,>(options: ReadonlyArray<SelectOption<T>>, serialize?: (value: T) => string): string[] =>
    options
        .map((o) => o.value)
        .map(serialize || _identity)
        .map((v, i) => (v === undefined ? '' : typeof v === 'string' ? v : String(i)));

export const Select = <T,>({
    value,
    serialize,
    label,
    error,
    required = false,
    className = 'form-group',
    onChange,
    onBlur,
    options,
    disabled,
}: SelectProps<T>) => {
    const optionValues = getOptionValues(options, serialize);
    const handlerRemapped = (handler?: (value: T) => void) => (optionValue: string) =>
        handler && handler(options[optionValues.indexOf(optionValue)].value);
    const currentIndex = options.indexOf(options.find((option) => option.value === value)!);

    return (
        <div className={className}>
            {label && <Label {...{ label, required }} />}
            <select
                className={'form-control custom-select' + (error ? ' is-invalid' : '')}
                disabled={disabled}
                onChange={EventUtil.inputHandler(handlerRemapped(onChange))}
                onBlur={EventUtil.inputHandler(handlerRemapped(onBlur))}
                value={optionValues[currentIndex]}>
                {options.map((option: SelectOption<T>, index: number) => (
                    <Option label={option.label} value={optionValues[index]} key={index} />
                ))}
            </select>
            {error && <DisplayError error={error} />}
        </div>
    );
};

type FormSelectProps<T> = { field: FormField<T> } & CommonSelectProps<T>;

export const FormSelect = <T,>({ field, ...rest }: FormSelectProps<T>) => {
    const fieldProps = Morfi.useField(field);
    return <Select {...fieldProps} {...rest} />;
};
