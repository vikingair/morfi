// @flow

import React from 'react';
import { AsyncValidationSample } from '../docs_src/ui/samples/async/AsyncValidationSample';
import { morfiMount } from '../morfi-test-utils/src/';

describe('AsyncValidationSample', () => {
    it('behaves like expected', async () => {
        const { update, isRequired, getErrorId, nextTick, getError, blur, instance } = morfiMount(
            <AsyncValidationSample />
        );

        instance.update();
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
        const { update, nextTick, getError, submit } = morfiMount(<AsyncValidationSample />);

        update('userName', 'Tom');

        submit();

        await nextTick();
        expect(getError('userName')).toEqual({
            id: 'AsyncValidationSample.userName.already.registered',
            values: { userName: 'Tom' },
        });
    });

    it('maps the server error to the field', async () => {
        const { update, nextTick, getErrorId, submit, getValue } = morfiMount(<AsyncValidationSample />);

        update('userName', 'Mike');
        update('alias', 'Foo');

        submit();

        await nextTick();
        expect(getValue('userName')).toBe('Mike');
        expect(getErrorId('userName')).toBe('AsyncValidationSample.userName.submit.failed');
    });

    it('resets inputs after submitting succeeded', async () => {
        const { update, nextTick, submit, getValue } = morfiMount(<AsyncValidationSample />);

        update('userName', 'Hammer');
        update('alias', 'Foo');
        update('realName', 'Some One');

        submit();

        await nextTick();

        expect(getValue('userName')).toBe('');
        expect(getValue('alias')).toBe('');
        expect(getValue('realName')).toBe('');
    });

    it('triggers no further changes if component would unmount', async () => {
        const { update, nextTick, submit, unmount } = morfiMount(<AsyncValidationSample />);

        update('userName', 'Hammer');
        update('alias', 'Foo');
        update('realName', 'Some One');

        submit();

        unmount();

        await nextTick();
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
