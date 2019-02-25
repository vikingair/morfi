// @flow

import React from 'react';
import { AsyncValidationSample } from './AsyncValidationSample';
import { morfiMount } from '../../../test/morfi-test-util';

describe('AsyncValidationSample', () => {
    it('behaves like expected', async () => {
        const { updateValue, isRequired, getErrorId, nextTick, getError, blur, instance } = morfiMount(
            <AsyncValidationSample />
        );

        instance.update();
        expect(isRequired('userName')).toBe(true);
        expect(isRequired('realName')).toBe(false);

        updateValue('realName', 'Tester');
        expect(getErrorId('realName')).toBe(undefined);

        updateValue('realName', 'Tester @ga!n');
        expect(getErrorId('realName')).toBe('AsyncValidationSample.realName.validation.requirements');

        updateValue('userName', 'Tom');
        expect(getErrorId('userName')).toBe(undefined);

        blur();
        await nextTick();
        expect(getError('userName')).toEqual({
            id: 'AsyncValidationSample.userName.already.registered',
            values: { userName: 'Tom' },
        });

        updateValue('userName', 'otherName');
        expect(getErrorId('userName')).toBe(undefined);

        blur();
        await nextTick();
        expect(getErrorId('userName')).toBe(undefined);
    });

    it('validates the user name on submit', async () => {
        const { updateValue, nextTick, getError, submit } = morfiMount(<AsyncValidationSample />);

        updateValue('userName', 'Tom');

        submit();

        await nextTick();
        expect(getError('userName')).toEqual({
            id: 'AsyncValidationSample.userName.already.registered',
            values: { userName: 'Tom' },
        });
    });

    it('maps the server error to the field', async () => {
        const { updateValue, nextTick, getErrorId, submit, getValue } = morfiMount(<AsyncValidationSample />);

        updateValue('userName', 'Mike');
        updateValue('alias', 'Foo');

        submit();

        await nextTick();
        expect(getValue('userName')).toBe('Mike');
        expect(getErrorId('userName')).toBe('AsyncValidationSample.userName.submit.failed');
    });

    it('resets inputs after submitting succeeded', async () => {
        const { updateValue, nextTick, submit, getValue } = morfiMount(<AsyncValidationSample />);

        updateValue('userName', 'Hammer');
        updateValue('alias', 'Foo');
        updateValue('realName', 'Some One');

        submit();

        await nextTick();

        expect(getValue('userName')).toBe('');
        expect(getValue('alias')).toBe('');
        expect(getValue('realName')).toBe('');
    });

    it('triggers no further changes if component would unmount', async () => {
        const { updateValue, nextTick, submit, unmount } = morfiMount(<AsyncValidationSample />);

        updateValue('userName', 'Hammer');
        updateValue('alias', 'Foo');
        updateValue('realName', 'Some One');

        submit();

        unmount();

        await nextTick();
    });

    it('displays no errors if async validation results does not belong to entered input', async () => {
        const { updateValue, nextTick, getValue, getErrorId } = morfiMount(<AsyncValidationSample />);

        updateValue('alias', 'Tom');
        expect(getValue('alias')).toBe('Tom');
        expect(getErrorId('alias')).toBe(undefined);

        // do not wait
        updateValue('alias', 'Tommy');
        expect(getValue('alias')).toBe('Tommy');

        await nextTick();

        expect(getErrorId('alias')).toBe(undefined);
    });
});
