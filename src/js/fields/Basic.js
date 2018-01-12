/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import type { _ErrorMessage } from '../form/Form-classes';
import messages from '../../messages';

export const __ = (m: _ErrorMessage): string => {
    let result = messages[m.id];
    const values = m.values;
    if (result && values) {
        for (const key in values) {
            if (values.hasOwnProperty(key)) {
                result = result.replace(`{${key}}`, values[key]);
            }
        }
    }
    return result;
};

export const Label = ({ label, required = false }: { label: string, required?: boolean }) => {
    return <label className="control-label">{label + (required ? ' *' : '')}</label>;
};

export const Error = ({ error }: { error: _ErrorMessage }) => {
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
