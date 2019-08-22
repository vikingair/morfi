// @flow

import React from 'react';
import { AsyncValidationSample } from '../docs_src/ui/samples/async/AsyncValidationSample';
import { morfiMount } from '../morfi-test-utils/src/';

describe('AsyncValidationSample', () => {
    it('behaves like expected', async () => {
        const { update, isRequired, getErrorId, nextTick, getError, blur } = morfiMount(<AsyncValidationSample />);

        expect(isRequired('userName')).toBe(true);
        expect(isRequired('realName')).toBe(false);

        update('realName', 'Tester');
        expect(getErrorId('realName')).toBe(undefined);

        update('realName', 'Tester @ga!n');
        expect(getErrorId('realName')).toBe('AsyncValidationSample.realName.validation.requirements');

        update('userName', 'Tom');
        expect(getErrorId('userName')).toBe(undefined);

        blur();
        await nextTick();
        expect(getError('userName')).toEqual({
            id: 'AsyncValidationSample.userName.already.registered',
            values: { userName: 'Tom' },
        });

        update('userName', 'otherName');
        expect(getErrorId('userName')).toBe(undefined);

        blur();
        await nextTick();
        expect(getErrorId('userName')).toBe(undefined);
    });

    it('validates the user name on submit', async () => {
        const { update, getError, submit } = morfiMount(<AsyncValidationSample />);

        update('userName', 'Tom');

        await submit();

        expect(getError('userName')).toEqual({
            id: 'AsyncValidationSample.userName.already.registered',
            values: { userName: 'Tom' },
        });
    });

    it('maps the server error to the field', async () => {
        const { update, getErrorId, submit, getValue } = morfiMount(<AsyncValidationSample />);

        update('userName', 'Mike');
        update('alias', 'Foo');

        await submit();

        expect(getValue('userName')).toBe('Mike');
        expect(getErrorId('userName')).toBe('AsyncValidationSample.userName.submit.failed');
    });

    it('resets inputs after submitting succeeded', async () => {
        const { update, submit, getValue } = morfiMount(<AsyncValidationSample />);

        update('userName', 'Hammer');
        update('alias', 'Foo');
        update('realName', 'Some One');

        await submit();

        expect(getValue('userName')).toBe('');
        expect(getValue('alias')).toBe('');
        expect(getValue('realName')).toBe('');
    });

    it('triggers no further changes if component would unmount', async () => {
        const { update, submit, unmount } = morfiMount(<AsyncValidationSample />);

        update('userName', 'Hammer');
        update('alias', 'Foo');
        update('realName', 'Some One');

        await submit(unmount);
    });

    it('displays no errors if async validation results does not belong to entered input', async () => {
        const { update, nextTick, getValue, getErrorId } = morfiMount(<AsyncValidationSample />);

        update('alias', 'Tom');
        expect(getValue('alias')).toBe('Tom');
        expect(getErrorId('alias')).toBe(undefined);

        // do not wait
        update('alias', 'Tommy');
        expect(getValue('alias')).toBe('Tommy');

        await nextTick();

        expect(getErrorId('alias')).toBe(undefined);
    });
});
