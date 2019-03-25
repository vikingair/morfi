/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { Validators } from '../docs_src/ui/validators/validators';

describe('Validator.string', () => {
    it('does not process falsy values to the validator on optionalOf-variant', () => {
        const validator = Validators.optionalOf(Validators.string({ min: 3, max: 10 }));
        expect(validator(undefined)).toBe(undefined);
        expect(validator('')).toBe(undefined);
        expect(validator('some non empty string')).toEqual({
            id: 'validation.characters.atMost.x',
            values: { num: 10, s: 's' },
        });
    });

    it('validates strings correctly', () => {
        const validator = Validators.string({});
        expect(validator(undefined)).toBe(undefined);
        expect(validator('')).toBe(undefined);
        expect(validator('some non empty string')).toBe(undefined);
    });

    it('validates string min length correctly', () => {
        const validator = Validators.string({ min: 3 });
        const expectedError = { id: 'validation.characters.atLeast.x', values: { num: 3, s: 's' } };
        expect(validator('')).toEqual(expectedError);
        expect(validator('1')).toEqual(expectedError);
        expect(validator('12')).toEqual(expectedError);
        expect(validator('Yes')).toBe(undefined);
        expect(validator('some longer string')).toBe(undefined);
    });

    it('validates string max length correctly', () => {
        const validator = Validators.string({ max: 4 });
        const expectedError = { id: 'validation.characters.atMost.x', values: { num: 4, s: 's' } };
        expect(validator(undefined)).toBe(undefined);
        expect(validator('')).toBe(undefined);
        expect(validator('1')).toBe(undefined);
        expect(validator('12')).toBe(undefined);
        expect(validator('123')).toBe(undefined);
        expect(validator('1234')).toBe(undefined);
        expect(validator('12345')).toEqual(expectedError);
        expect(validator('some longer string')).toEqual(expectedError);
    });
});

describe('Validator.number', () => {
    it('validates numbers correctly', () => {
        const validator = Validators.number({});
        expect(validator(undefined)).toBe(undefined);
        expect(validator(12)).toBe(undefined);
    });

    it('validates number min length correctly', () => {
        const validator = Validators.number({ minLength: 3 });
        const expectedError = { id: 'validation.characters.atLeast.x', values: { num: 3, s: 's' } };
        expect(validator(1)).toEqual(expectedError);
        expect(validator(12)).toEqual(expectedError);
        expect(validator(123)).toBe(undefined);
        expect(validator(1234567890)).toBe(undefined);
    });

    it('validates string max length correctly', () => {
        const validator = Validators.number({ maxLength: 4 });
        const expectedError = { id: 'validation.characters.atMost.x', values: { num: 4, s: 's' } };
        expect(validator(undefined)).toBe(undefined);
        expect(validator(1)).toBe(undefined);
        expect(validator(12)).toBe(undefined);
        expect(validator(123)).toBe(undefined);
        expect(validator(1234)).toBe(undefined);
        expect(validator(12345)).toEqual(expectedError);
        expect(validator(1234567890)).toEqual(expectedError);
    });

    it('special behaviour for min length = 1', () => {
        const validatorMin1 = Validators.number({ minLength: 1 });
        expect(validatorMin1(undefined)).toEqual({ id: 'validation.characters.atLeast.x', values: { num: 1, s: '' } });
        expect(validatorMin1(0)).toEqual(undefined);
    });

    it('special behaviour for max length = 0', () => {
        const validatorMax1 = Validators.number({ maxLength: 0 });
        expect(validatorMax1(0)).toEqual({ id: 'validation.characters.exactly.x', values: { num: 0, s: 's' } });
        expect(validatorMax1(undefined)).toEqual(undefined);
    });
});

describe('Validator.regex', () => {
    // reg exp for two brackets enclosing only zeros and ones, e.g.: "(010)"
    const regex = /^\([01]*\)$/;
    it('validates regex correctly', () => {
        const validator = Validators.regex({ re: regex });
        expect(validator(undefined)).toEqual({ id: 'validation.value.mismatch' });
        expect(validator('does not match')).toEqual({ id: 'validation.value.mismatch' });
        expect(validator('(010101)')).toBe(undefined);
        expect(validator('(0101012)')).toEqual({ id: 'validation.value.mismatch' });
        expect(validator('(010101) ')).toEqual({ id: 'validation.value.mismatch' });
    });

    it('returns the given message on validation error', () => {
        const validator = Validators.regex({ re: regex, message: { id: 'test.message' } });
        expect(validator('')).toEqual({ id: 'test.message' });
    });
});

describe('Validator.email', () => {
    it('validates email correctly', () => {
        const validator = Validators.email;
        expect(validator(undefined)).toEqual({ id: 'validation.email.requirements' });
        expect(validator('some?non@sense')).toEqual({ id: 'validation.email.requirements' });
        expect(validator('1.matching-mail@address.com')).toBe(undefined);
        expect(validator('non-matching_address.com')).toEqual({ id: 'validation.email.requirements' });
        expect(validator('non-mail@address.')).toEqual({ id: 'validation.email.requirements' });
    });
});
