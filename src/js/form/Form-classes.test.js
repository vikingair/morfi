/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { FormUtil, forEach } from './Form-classes';
import { formData, formValidation, invalidFormData } from '../../test/form-data';
import { Validators } from '../validators/validators';

describe('FormUtil', () => {
    it('updates a single value', () => {
        const result: typeof formData = {
            values: {
                name: 'George',
                age: 81,
                size: 170,
                nickname: 'KeNNy',
                email: 'kenny@testweb.de',
            },
            errors: {
                name: { id: 'test.error' },
            },
        };
        const oldValue = formData.values['name'];
        expect(FormUtil.update(formData, 'name', ('George': typeof oldValue), { id: 'test.error' })).toEqual(result);
    });
    it('updates a not filled field (but this is actually not supported by flow)', () => {
        const result: any = {
            values: {
                name: 'Kenny',
                age: 81,
                size: 170,
                nickname: 'KeNNy',
                email: 'kenny@testweb.de',
                some: true,
            },
            errors: {},
        };
        expect(FormUtil.update(formData, ('some': any), (true: any))).toEqual(result);
    });
    it('validates a single field', () => {
        expect(FormUtil.completeFieldValidation(formData.values.age, formValidation.age)).toBe(undefined);
        expect(FormUtil.completeFieldValidation(invalidFormData.values.age, formValidation.age)).toEqual({
            id: 'validation.characters.atMost.x',
            values: { num: 3, s: 's' },
        });
        expect(FormUtil.completeFieldValidation(invalidFormData.values.nickname, formValidation.nickname)).toEqual({
            id: 'validation.characters.exactly.x',
            values: { num: 5, s: 's' },
        });
    });
    it('validates a single field with a single validator', () => {
        expect(FormUtil.validateField(formData.values.age, formValidation.age.onChange)).toBe(undefined);
        expect(FormUtil.validateField(invalidFormData.values.age, formValidation.age.onChange)).toEqual({
            id: 'validation.characters.atMost.x',
            values: { num: 3, s: 's' },
        });
        expect(FormUtil.validateField(invalidFormData.values.nickname, undefined)).toBe(undefined);
    });
    it('validates all fields', () => {
        expect((FormUtil.validateAll(formData, formValidation): any).errors).toEqual({});
        const validated: any = FormUtil.validateAll(invalidFormData, formValidation);
        expect(validated.values).toEqual(invalidFormData.values);
        expect(validated.errors).toEqual({
            age: {
                id: 'validation.characters.atMost.x',
                values: { num: 3, s: 's' },
            },
            name: {
                id: 'validation.characters.atMost.x',
                values: { num: 10, s: 's' },
            },
            nickname: {
                id: 'validation.characters.exactly.x',
                values: { num: 5, s: 's' },
            },
            size: { id: 'validation.value.incompatible' },
            email: { id: 'validation.email.requirements' },
        });
    });

    it('validates async all fields', async () => {
        let num = 0;
        const asyncValidatorWithError = () => Promise.resolve({ id: 'error-' + num++ });
        const asyncValidator = () => Promise.resolve(undefined);
        expect(
            (await FormUtil.validateAll(formData, {
                name: {
                    onChange: asyncValidatorWithError, // validation with error-0 will be triggered <- returned
                    onBlur: asyncValidatorWithError, // validation with error-1 will be triggered
                    onSubmit: asyncValidatorWithError, // validation with error-2 will be triggered
                },
                age: {
                    onChange: asyncValidatorWithError, // validation with error-3 will be triggered
                    onBlur: Validators.number({ maxLength: 1 }), // sync errors are favoured
                    onSubmit: asyncValidatorWithError,
                },
                size: {
                    onBlur: Validators.number({}), // considering the async error, if this validation succeeds
                    onSubmit: asyncValidatorWithError, // validation with error-4 will be triggered <- returned
                },
                nickname: {
                    onChange: asyncValidator,
                    onBlur: asyncValidator,
                    onSubmit: asyncValidator,
                },
            }): any).errors
        ).toEqual({
            age: { id: 'validation.characters.atMost.x', values: { num: 1, s: '' } },
            name: { id: 'error-0' },
            size: { id: 'error-4' },
        });
    });

    it('recognizes if errors exist', () => {
        expect(FormUtil.hasErrors(formData)).toBe(false);
        expect(FormUtil.hasErrors(invalidFormData)).toBe(true);
    });
    it('recognizes required fields', () => {
        expect(FormUtil.isRequired(formValidation.name)).toBe(true);
        expect(FormUtil.isRequired(formValidation.age)).toBe(true);
        expect(FormUtil.isRequired(formValidation.size)).toBe(false);
        expect(FormUtil.isRequired(formValidation.nickname)).toBe(true);
        // and one accessed which would be forbidden for flow
        expect(FormUtil.isRequired(formValidation[('unknown': any)])).toBe(false);
    });
    it('foreach ignores not own properties on objects', () => {
        const results = [];
        forEach({ attr1: 'someString', attr2: 123, hasOwnProperty: () => false }, (key, value) =>
            results.push([key, value])
        );
        expect(results.length).toBe(0);
    });
});
