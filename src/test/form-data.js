// @flow
import type { FormValidation, _FormData } from '../js/form/Form-classes';
import { Validators } from '../js/validators/validators';

type formValues = { name: string, age: number, size: number, nickname?: string };

export const formValidation: FormValidation<formValues> = {
    name: { onChange: Validators.string({ min: 2, max: 10 }) },
    age: { onChange: Validators.number({ minLength: 1, maxLength: 3 }) },
    nickname: { onBlur: Validators.string({ min: 5, max: 5 }) },
};
export const formData: _FormData<formValues> = {
    values: {
        name: 'Kenny',
        age: 81,
        size: 170,
        nickname: 'KeNNy',
    },
    errors: {},
};
export const invalidFormData: _FormData<formValues> = {
    values: {
        name: 'Kenny - The King',
        age: 9999,
        size: 170,
    },
    errors: { size: { id: 'validation.value.incompatible' } },
};
