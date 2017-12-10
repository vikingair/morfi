// @flow

import { FormUtil, __forEach } from './Form-classes';
import { formData, formValidation, invalidFormData } from '../../test/form-data';

describe('FormUtil', () => {
    it('updates a single value', () => {
        const result: typeof formData = {
            values: {
                name: 'George',
                age: 81,
                size: 170,
                nickname: 'KeNNy',
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
            values: { num: 3 },
        });
        expect(FormUtil.completeFieldValidation(invalidFormData.values.nickname, formValidation.nickname)).toEqual({
            id: 'validation.characters.exactly.x',
            values: { num: 5 },
        });
    });
    it('validates a single field with a single validator', () => {
        expect(FormUtil.validateField(formData.values.age, formValidation.age.onChange)).toBe(undefined);
        expect(FormUtil.validateField(invalidFormData.values.age, formValidation.age.onChange)).toEqual({
            id: 'validation.characters.atMost.x',
            values: { num: 3 },
        });
        expect(FormUtil.validateField(invalidFormData.values.nickname, undefined)).toBe(undefined);
    });
    it('validates all fields', () => {
        expect(FormUtil.validateAll(formData, formValidation).errors).toEqual({});
        const validated = FormUtil.validateAll(invalidFormData, formValidation);
        expect(validated.values).toEqual(invalidFormData.values);
        expect(validated.errors).toEqual({
            age: {
                id: 'validation.characters.atMost.x',
                values: { num: 3 },
            },
            name: {
                id: 'validation.characters.atMost.x',
                values: { num: 10 },
            },
            nickname: {
                id: 'validation.characters.exactly.x',
                values: { num: 5 },
            },
            size: { id: 'validation.value.incompatible' },
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
        __forEach({ attr1: 'someString', attr2: 123, hasOwnProperty: () => false }, (key, value) =>
            results.push([key, value])
        );
        expect(results.length).toBe(0);
    });
});
