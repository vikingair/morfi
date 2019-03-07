// @flow

import React from 'react';
import { ValidationSample } from './ValidationSample';
import { Select } from '../../fields/FormSelect';
import { morfiMount } from '../../../../test/morfi-test-util';

describe('ValidationSample', () => {
    it('validates onChange', () => {
        const { getState, update, getError } = morfiMount(<ValidationSample />);

        update('email', 'nomail.com');
        expect(getState('email')).toEqual({ value: 'nomail.com', error: { id: 'validation.email.requirements' } });

        update('email', 'some@mail.com');
        expect(getError('email')).toBe(undefined);

        update('pw', '1234567');
        expect(getError('pw')).toEqual({ id: 'validation.pw.requirements' });

        update('pw', '12345678');
        expect(getError('pw')).toBe(undefined);
    });

    it('validates onBlur', () => {
        const { update, getErrorId, getValue, blur, instance } = morfiMount(<ValidationSample />);

        instance
            .find(Select)
            .props()
            .onChange('onBlur');

        update('email', 'nomail.com');
        expect(getValue('email')).toBe('nomail.com');
        expect(getErrorId('email')).toBe(undefined);

        // now blur
        blur();
        expect(getErrorId('email')).toBe('validation.email.requirements');

        update('pw', '1234567');
        expect(getErrorId('pw')).toBe(undefined);

        // focus another input triggers the blur
        update('email', 'foo@bar.com');
        expect(getErrorId('pw')).toBe('validation.pw.requirements');
        expect(getErrorId('email')).toBe(undefined);
    });

    it('validates onSubmit', () => {
        const { update, getErrorId, focus, instance, submit } = morfiMount(<ValidationSample />);

        instance
            .find(Select)
            .props()
            .onChange('onSubmit');

        update('email', 'nomail.com');
        focus('pw');
        expect(getErrorId('email')).toBe(undefined);
        expect(getErrorId('pw')).toBe(undefined);

        submit();

        expect(getErrorId('email')).toBe('validation.email.requirements');
        expect(getErrorId('pw')).toBe('validation.pw.requirements');

        update('email', 'foo@bar.com');
        update('pw', '12345678');

        submit();

        expect(getErrorId('email')).toBe(undefined);
        expect(getErrorId('pw')).toBe(undefined);
    });
});
