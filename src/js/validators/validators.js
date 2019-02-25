/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import type { ErrorMessage, Validator } from '../form';

const stringValidator = ({ min = 0, max = -1 }: { min?: number, max?: number }): Validator<string> => {
    const exactMessage =
        min === max
            ? { id: 'validation.characters.exactly.x', values: { num: min, s: min === 1 ? '' : 's' } }
            : undefined;
    const atMostMessage = exactMessage || {
        id: 'validation.characters.atMost.x',
        values: { num: max, s: max === 1 ? '' : 's' },
    };
    const atLeastMessage = exactMessage || {
        id: 'validation.characters.atLeast.x',
        values: { num: min, s: min === 1 ? '' : 's' },
    };
    return v => {
        const val = v === undefined ? '' : v;
        if (max >= 0 && val.length > max) {
            return atMostMessage;
        }
        if (val.length < min) {
            return atLeastMessage;
        }
    };
};

const regexValidator = ({ re, message }: { re: RegExp, message?: ErrorMessage }): Validator<string> => {
    return v => {
        const val = v === undefined ? '' : v;
        if (!re.test(val)) {
            return message || { id: 'validation.value.mismatch' };
        }
    };
};

const __regexNumberValidator = regexValidator({ re: /^\d*$/, message: { id: 'validation.value.onlyNumbers' } });

const numberValidator = ({
    minLength = 0,
    maxLength = -1,
}: {
    minLength?: number,
    maxLength?: number,
}): Validator<number> => {
    const strValidator = stringValidator({ min: minLength, max: maxLength });
    return val => {
        const str = val === undefined ? undefined : String(val);
        const error = strValidator(str);
        return error || __regexNumberValidator(str);
    };
};

const optionalOf = <T>(validator: Validator<T>): Validator<T> => {
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
    email: regexValidator({
        re: /^[a-zA-Z0-9.-]+@[a-zA-Z0-9]+\.[a-z]+$/,
        message: { id: 'validation.email.requirements' },
    }),
    optionalOf,
};
