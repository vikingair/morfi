/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import type { ErrorMessage } from '../form';
import messages from '../../messages';

export const __ = ({ id, values }: ErrorMessage): string => {
    let result = messages[id];
    if (result && values) {
        result = Object.keys(values).reduce(
            (red: string, key: string) => red.replace(`{${key}}`, String(values[key])),
            result
        );
    }
    return result;
};

export const Label = ({ label, required = false }: { label: string, required?: boolean }) => {
    return <label className="control-label">{label + (required ? ' *' : '')}</label>;
};

export const DisplayError = ({ error }: { error: ErrorMessage }) => {
    return <span className="invalid-feedback">{__(error)}</span>;
};

type EventHandler = (SyntheticInputEvent<*>) => void;

export const onActionWrap = (cb?: any => void, preventDefault: boolean = true): EventHandler => {
    return event => {
        if (preventDefault) {
            event.preventDefault();
        }
        if (cb) {
            cb(event.target.value);
        }
    };
};
