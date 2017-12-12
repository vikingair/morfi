/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import type { ErrorMessage, Validator } from '../form';

const stringValidator = ({ min = 0, max = -1 }: { min?: number, max?: number }): Validator => {
    const exactMessage = min === max ? { id: 'validation.characters.exactly.x', values: { num: min } } : undefined;
    const atMostMessage = exactMessage || { id: 'validation.characters.atMost.x', values: { num: max } };
    const atLeastMessage = exactMessage || { id: 'validation.characters.atLeast.x', values: { num: min } };
    return v => {
        const val = v === undefined ? '' : v;
        if (typeof val !== 'string') {
            return { id: 'validation.value.incompatible' };
        }
        if (max >= 0 && val.length > max) {
            return atMostMessage;
        }
        if (val.length < min) {
            return atLeastMessage;
        }
    };
};

const regexValidator = ({ re, message }: { re: RegExp, message?: ErrorMessage }): Validator => {
    return v => {
        const val = v === undefined ? '' : v;
        if (typeof val !== 'string') {
            return { id: 'validation.value.incompatible' };
        }
        if (!re.test(val)) {
            return message || { id: 'validation.value.mismatch' };
        }
    };
};

const __regexNumberValidator = regexValidator({ re: /^\d*$/, message: { id: 'validation.value.onlyNumbers' } });

const numberValidator = ({ minLength = 0, maxLength = -1 }: { minLength?: number, maxLength?: number }): Validator => {
    const strValidator = stringValidator({ min: minLength, max: maxLength });
    return val => {
        const str = typeof val === 'number' ? String(val) : val;
        const error = strValidator(str);
        return error || __regexNumberValidator(str);
    };
};

const optionalOf = (validator: Validator): Validator => {
    return val => {
        if (val) {
            return validator(val);
        }
    };
};

export const Validators = {
    string: stringValidator,
    regex: regexValidator,
    number: numberValidator,
    optionalOf,
};
