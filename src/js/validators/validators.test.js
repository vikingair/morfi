// @flow

import { Validators } from './validators';

describe('Validator.string', () => {
    it('does not process falsy values to the validator on optionalOf-variant', () => {
        const validator = Validators.optionalOf(Validators.string({ min: 3, max: 10 }));
        expect(validator(undefined)).toBe(undefined);
        expect(validator(null)).toBe(undefined);
        expect(validator(12)).toEqual({ id: 'validation.value.incompatible' });
        expect(validator(true)).toEqual({ id: 'validation.value.incompatible' });
        expect(validator('')).toBe(undefined);
        expect(validator('some non empty string')).toEqual({
            id: 'validation.characters.atMost.x',
            values: { num: 10 },
        });
    });

    it('validates strings correctly', () => {
        const validator = Validators.string({});
        expect(validator(undefined)).toBe(undefined);
        expect(validator(null)).toEqual({ id: 'validation.value.incompatible' });
        expect(validator(12)).toEqual({ id: 'validation.value.incompatible' });
        expect(validator(true)).toEqual({ id: 'validation.value.incompatible' });
        expect(validator('')).toBe(undefined);
        expect(validator('some non empty string')).toBe(undefined);
    });

    it('validates string min length correctly', () => {
        const validator = Validators.string({ min: 3 });
        const expectedError = { id: 'validation.characters.atLeast.x', values: { num: 3 } };
        expect(validator('')).toEqual(expectedError);
        expect(validator('1')).toEqual(expectedError);
        expect(validator('12')).toEqual(expectedError);
        expect(validator('Yes')).toBe(undefined);
        expect(validator('some longer string')).toBe(undefined);
    });

    it('validates string max length correctly', () => {
        const validator = Validators.string({ max: 4 });
        const expectedError = { id: 'validation.characters.atMost.x', values: { num: 4 } };
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
        expect(validator(null)).toEqual({ id: 'validation.value.incompatible' });
        expect(validator(true)).toEqual({ id: 'validation.value.incompatible' });
        expect(validator('123A')).toEqual({ id: 'validation.value.onlyNumbers' });
        expect(validator(12)).toBe(undefined);
        expect(validator('12')).toBe(undefined);
        expect(validator('')).toBe(undefined); // because of Number('') === 0, we want to explicitly allow empty string
    });

    it('validates number min length correctly', () => {
        const validator = Validators.number({ minLength: 3 });
        const expectedError = { id: 'validation.characters.atLeast.x', values: { num: 3 } };
        expect(validator('')).toEqual(expectedError);
        expect(validator(1)).toEqual(expectedError);
        expect(validator(12)).toEqual(expectedError);
        expect(validator(123)).toBe(undefined);
        expect(validator(1234567890)).toBe(undefined);
    });

    it('validates string max length correctly', () => {
        const validator = Validators.number({ maxLength: 4 });
        const expectedError = { id: 'validation.characters.atMost.x', values: { num: 4 } };
        expect(validator(undefined)).toBe(undefined);
        expect(validator('')).toBe(undefined);
        expect(validator(1)).toBe(undefined);
        expect(validator(12)).toBe(undefined);
        expect(validator(123)).toBe(undefined);
        expect(validator(1234)).toBe(undefined);
        expect(validator(12345)).toEqual(expectedError);
        expect(validator(1234567890)).toEqual(expectedError);
    });

    it('special behaviour for min length = 1', () => {
        const validatorMin1 = Validators.number({ minLength: 1 });
        expect(validatorMin1('')).toEqual({ id: 'validation.characters.atLeast.x', values: { num: 1 } });
        expect(validatorMin1(0)).toEqual(undefined);
    });

    it('special behaviour for max length = 0', () => {
        const validatorMax1 = Validators.number({ maxLength: 0 });
        expect(validatorMax1(0)).toEqual({ id: 'validation.characters.exactly.x', values: { num: 0 } });
        expect(validatorMax1('')).toEqual(undefined);
    });
});

describe('Validator.regex', () => {
    // reg exp for two brackets enclosing only zeros and ones, e.g.: "(010)"
    const regex = /^\([01]*\)$/;
    it('validates regex correctly', () => {
        const validator = Validators.regex({ re: regex });
        expect(validator(undefined)).toEqual({ id: 'validation.value.mismatch' });
        expect(validator(null)).toEqual({ id: 'validation.value.incompatible' });
        expect(validator(true)).toEqual({ id: 'validation.value.incompatible' });
        expect(validator(12)).toEqual({ id: 'validation.value.incompatible' });
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
