// @flow

import React from 'react';
import FirstSample from './FirstSample';
import { morfiMount } from '../../../test/morfi-test-util';
import PersonTable from './PersonTable';

describe('FirstSample', () => {
    it('displays required fields', () => {
        const { isRequired } = morfiMount(<FirstSample />);

        expect(isRequired('firstName')).toBe(true);
        expect(isRequired('lastName')).toBe(true);
        expect(isRequired('age')).toBe(true);
        expect(isRequired('gender')).toBe(false);
    });

    it('updates custom values', () => {
        const { updateValue, getValue, getError } = morfiMount(<FirstSample />);

        expect(getValue('gender')).toBe('M');
        updateValue('gender', 'F');
        expect(getValue('gender')).toBe('F');

        // no validation does exist, so no error will be displayed
        expect(getError('gender')).toBe(undefined);
    });

    it('handles synchronous submits', () => {
        const { submit, updateValue, instance } = morfiMount(<FirstSample />);

        expect(instance.find(PersonTable).props().persons.length).toBe(0);

        updateValue('lastName', 'Bush');
        submit();

        const { persons } = instance.find(PersonTable).props();
        expect(persons.length).toBe(1);

        expect(persons[0]).toEqual({ age: 1, firstName: 'Nick', gender: 'M', lastName: 'Bush' });
    });
});
