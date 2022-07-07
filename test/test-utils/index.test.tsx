import { describe, it, expect, beforeEach } from 'vitest';
import { Spy } from 'spy4js';
import React, { useState } from 'react';
import { FormValidation, Morfi } from '../../src/';
import { Index } from '../../src/test-utils';
import { act, render } from '@testing-library/react';

type FormValues = { age: number; name: string; displayName?: string };
const initialValues: FormValues = { age: 0, name: '' };

const DummyValidations: FormValidation<FormValues> = {
    age: { onSubmit: (value) => (value ? (value < 0 || value > 99 ? 'Invalid age' : undefined) : 'Age required') },
    name: { onBlur: (value) => (value ? undefined : 'Name required') },
    displayName: { onChange: (value) => (value?.includes(' ') ? 'No whitespace in displayName allowed' : undefined) },
};

const onSubmit = Spy('onSubmit');
const onSubmitFinished = Spy('onSubmitFinished');
const onSubmitFailed = Spy('onSubmitFailed');

const DummyForm: React.FC<{ version?: number; validation?: FormValidation<FormValues> }> = ({
    version,
    validation = DummyValidations,
}) => {
    const { fields, Form } = Morfi.useForm<FormValues>();
    const [data, setData] = useState(() => Morfi.initialData(initialValues));

    return (
        <Form
            data={data}
            version={version}
            onChange={setData}
            onSubmit={onSubmit}
            validation={validation}
            onSubmitFinished={onSubmitFinished}
            onSubmitFailed={onSubmitFailed}>
            <Index.Field field={fields.name} />
            <Index.Field field={fields.displayName} />
            <Index.Field field={fields.age} />
            <button
                className={data.isSubmitting ? 'loading' : undefined}
                type="submit"
                disabled={Morfi.notSubmittable(data)}
            />
        </Form>
    );
};

const DummyMorfiTestUtilForm: React.FC<{ version?: number; validation?: FormValidation<FormValues> }> = ({
    version,
    validation = DummyValidations,
}) => (
    <Index.Form
        initialData={initialValues}
        onSubmit={onSubmit}
        version={version}
        validation={validation}
        onSubmitFinished={onSubmitFinished}
        onSubmitFailed={onSubmitFailed}>
        {(fields) => (
            <>
                <Index.Field field={fields.name} />
                <Index.Field field={fields.displayName} />
                <Index.Field field={fields.age} />
            </>
        )}
    </Index.Form>
);

describe('MorfiTestUtils', () => {
    beforeEach(() => {
        // this is actually optional since all fields will be unregistered between the tests
        Index.clearFields();
    });

    it('handles the form correctly', async () => {
        // when
        const { container, rerender } = render(<DummyForm />);

        // then
        const submitButton = container.querySelector('button')!;
        expect(submitButton.className).toBe(''); // not loading
        expect(submitButton.disabled).toBe(true); // no dirty fields
        expect(Object.keys(Index.fields).length).toBe(3);
        // first input
        expect(Index.fields.name.required).toBe(true);
        expect(Index.fields.name.value).toBe('');
        // second input
        expect(Index.fields.displayName.required).toBe(false);
        expect(Index.fields.displayName.value).toBe(undefined);
        // third input
        expect(Index.fields.age.required).toBe(true);
        expect(Index.fields.age.value).toBe(0);

        expect(Index.hasErrors()).toBe(false);

        // when - using the "name" input with onBlur validation
        Index.fields.name.change('');
        expect(Index.hasErrors()).toBe(false);
        expect(Index.fields.name.dirty).toBe(false);
        Index.fields.name.blur();
        expect(Index.fields.name.error).toBe('Name required');
        Index.fields.name.change('Test Name');
        expect(Index.fields.name.dirty).toBe(true);
        expect(submitButton.disabled).toBe(false);
        expect(Index.hasErrors()).toBe(false);
        Index.fields.name.blur();
        expect(Index.hasErrors()).toBe(false);

        // when - using the "displayName" input with onChange validation
        Index.fields.displayName.change('Test Name');
        expect(Index.fields.displayName.dirty).toBe(true);
        expect(Index.fields.displayName.error).toBe('No whitespace in displayName allowed');
        expect(Index.hasErrors()).toBe(true);
        expect(submitButton.disabled).toBe(true); // has errors
        Index.fields.displayName.change(undefined);
        expect(Index.fields.displayName.value).toBe(undefined);
        expect(Index.fields.displayName.dirty).toBe(false);
        expect(Index.hasErrors()).toBe(false);
        Index.fields.displayName.change('Test-DisplayName');
        expect(Index.fields.displayName.dirty).toBe(true);
        expect(Index.hasErrors()).toBe(false);

        // when - using the "age" input with onSubmit validation
        Index.fields.age.change(100);
        expect(Index.fields.age.value).toBe(100);
        expect(Index.fields.age.dirty).toBe(true);
        expect(Index.hasErrors()).toBe(false);
        await Index.submit();
        expect(Index.fields.age.error).toBe('Invalid age');
        onSubmit.wasNotCalled();
        onSubmitFinished.wasNotCalled();
        onSubmitFailed.wasCalledWith(Spy.COMPARE(Morfi.isValidationError), {
            dirty: { age: true, displayName: true, name: true },
            errors: { age: 'Invalid age', displayName: undefined, name: undefined },
            hasErrors: true,
            isDirty: true,
            isSubmitting: false,
            values: { age: 100, displayName: 'Test-DisplayName', name: 'Test Name' },
        });

        // when - submitting with backend error
        let reject = (_err: Error) => {};
        onSubmit.returns(
            new Promise((_, rej) => {
                reject = rej;
            })
        );
        Index.fields.age.change(99);
        await Index.submit(container.querySelector('form')!);

        // then
        onSubmitFailed.wasNotCalled(); // not yet
        onSubmitFinished.wasNotCalled();
        onSubmit.wasCalledWith({ age: 99, displayName: 'Test-DisplayName', name: 'Test Name' });
        expect(submitButton.className).toBe('loading');
        expect(submitButton.disabled).toBe(true); // isSubmitting

        // when - waiting for rejection
        const specialBackendErr = new Error('special backend error');
        reject(specialBackendErr);
        await act(global.nextTick);

        // then
        onSubmitFailed.wasCalledWith(
            Spy.COMPARE((err) => !Morfi.isValidationError(err) && err === specialBackendErr),
            {
                dirty: { age: true, displayName: true, name: true },
                errors: { age: undefined, displayName: undefined, name: undefined },
                hasErrors: false,
                isDirty: true,
                isSubmitting: false,
                values: { age: 99, displayName: 'Test-DisplayName', name: 'Test Name' },
            }
        );

        // when - submitting successfully
        onSubmit.resolves();
        await Index.submit();

        // then
        onSubmitFailed.wasNotCalled();
        onSubmit.wasCalledWith({ age: 99, displayName: 'Test-DisplayName', name: 'Test Name' });
        onSubmitFinished.wasCalledWith({
            dirty: { age: undefined, displayName: undefined, name: undefined },
            errors: { age: undefined, displayName: undefined, name: undefined },
            hasErrors: false,
            isDirty: false,
            isSubmitting: false,
            values: { age: 99, displayName: 'Test-DisplayName', name: 'Test Name' },
        });

        // when - making the form dirty again
        Index.fields.age.change(50);

        // then
        expect(Index.fields.age.dirty).toBe(true);

        // when - changing the form version
        rerender(<DummyForm version={42} />);

        // then
        expect(Index.fields.age.dirty).toBe(false);
    });

    it('handles async form validations', async () => {
        // given
        const validation = {
            ...DummyValidations,
            name: {
                onChange: (v?: string) => {
                    if (!v) return 'Name required';
                    return Promise.resolve(v.length < 3 ? 'Could not find such short names' : undefined);
                },
            },
        };
        render(<DummyMorfiTestUtilForm validation={validation} />);

        // when - entering a short name
        Index.fields.name.change('Bo');

        // then
        expect(Index.fields.name.required).toBe(true);
        expect(Index.fields.name.dirty).toBe(true);
        expect(Index.hasErrors()).toBe(false);

        // when - waiting for the async validation
        await act(global.nextTick);

        // then
        expect(Index.fields.name.error).toBe('Could not find such short names');

        // when - entering a sufficiently long name
        Index.fields.name.change('Bob');

        // then
        expect(Index.hasErrors()).toBe(false); // clears the error synchronously

        // when - waiting for the async validation
        await act(global.nextTick);

        // then
        expect(Index.hasErrors()).toBe(false);

        // when - submitting with async validation
        await Index.submit();

        // then
        onSubmitFinished.wasNotCalled();
        onSubmit.wasNotCalled();
        onSubmitFailed.wasCalledWith(Spy.COMPARE(Morfi.isValidationError), {
            dirty: { name: true },
            errors: { age: 'Age required', name: undefined },
            hasErrors: true,
            isDirty: true,
            isSubmitting: false,
            values: { age: 0, name: 'Bob' },
        });
    });
});
