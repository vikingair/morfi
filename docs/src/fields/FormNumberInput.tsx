import React from 'react';
import { DisplayError, Label, onActionWrap } from './Basic';
import { Morfi, FieldControls, FormField } from 'morfi';

type CommonNumberInputProps = {
    label?: string;
    className?: string;
    autoFocus?: boolean;
    disabled?: boolean;
};

type NumberInputProps = FieldControls<number | undefined> & CommonNumberInputProps;

export const NumberInput = ({
    value,
    label,
    error,
    required,
    className = 'form-group',
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

type FormNumberInputProps = { field: FormField<number | undefined> } & CommonNumberInputProps;

export const FormNumberInput = ({ field, ...rest }: FormNumberInputProps) => {
    const fieldProps = Morfi.useField(field);
    return <NumberInput {...fieldProps} {...rest} />;
};
