import React, { useCallback, useState } from 'react';
import { DisplayError, Label, onActionWrap } from './Basic';
import { Eye } from '../icons/Eye';
import { Spinner } from '../icons/Spinner';
import { FieldControls, FormField, Morfi } from 'morfi';

type AllowedTypes = 'text' | 'password';

type CommonInputProps = {
    label?: string;
    className?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    type?: AllowedTypes;
    placeholder?: string;
    loading?: boolean;
};

type InputProps = FieldControls<string> & CommonInputProps;

export const Input: React.FC<InputProps> = ({
    value = '',
    label,
    error,
    required,
    className = 'form-group',
    onChange,
    onBlur,
    autoFocus,
    disabled,
    type = 'text',
    placeholder,
    loading,
}) => {
    const [showPw, setShowPw] = useState(false);
    const toggleShowPw = useCallback(() => setShowPw((s) => !s), []);
    const usedType = type !== 'password' ? type : showPw ? 'text' : 'password';

    return (
        <div className={className}>
            {label && <Label {...{ label, required }} />}
            <input
                onChange={onActionWrap(onChange)}
                onBlur={onActionWrap(onBlur)}
                disabled={disabled}
                className={'form-control' + (error ? ' is-invalid' : '')}
                type={usedType}
                {...{ placeholder, value, autoFocus }}
            />
            {type === 'password' && (
                <span onClick={toggleShowPw}>
                    <Eye stroked={showPw} />
                </span>
            )}
            {loading && <Spinner />}
            {error && <DisplayError error={error} />}
        </div>
    );
};

type FormInputProps = { field: FormField<string> } & CommonInputProps;

export const FormInput: React.FC<FormInputProps> = ({ field, ...rest }) => {
    const fieldProps = Morfi.useField(field);
    return <Input {...fieldProps} {...rest} />;
};
