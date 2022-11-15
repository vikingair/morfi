import React from 'react';
import type { ErrorMessage } from 'morfi';
import messages from '../../messages.json';
import { Spinner } from '../icons/Spinner';

export const __ = (msgOrID: ErrorMessage): string => {
    const id = typeof msgOrID === 'string' ? msgOrID : msgOrID.id;
    const values = typeof msgOrID === 'string' ? undefined : msgOrID.values;
    let result = (messages as Record<string, undefined | string>)[id];
    if (result && values) {
        result = Object.keys(values).reduce(
            (red: string, key: string) => red.replace(`{${key}}`, String(values[key])),
            result
        );
    }
    return result!;
};

export const Label = ({ label, required = false }: { label: string; required?: boolean }) => (
    <label className="control-label">{label + (required ? ' *' : '')}</label>
);

export const DisplayError = ({ error }: { error: ErrorMessage }) => (
    <span className="invalid-feedback">{__(error)}</span>
);

export const onActionWrap =
    (cb?: (arg: any) => void, preventDefault = true): React.EventHandler<any> =>
    (event) => {
        if (preventDefault) {
            event.preventDefault();
        }
        if (cb) {
            cb(event.target.value);
        }
    };

type ButtonProps = {
    children: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    type?: 'submit' | 'button';
    onClick?: () => void;
};

export const Button: React.FC<ButtonProps> = ({ children, loading, ...rest }) => (
    <button {...rest}>
        {loading && <Spinner />}
        {children}
    </button>
);
