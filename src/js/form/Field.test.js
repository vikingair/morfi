/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import { Spy } from 'spy4js';
import { mount } from 'enzyme';
import { _Field as Field } from './Field';
import { _Form as Form } from './Form';
import { formData, formValidation, invalidFormData } from '../../test/form-data';
import type { _FormData, _FormValidation } from './Form-classes';

describe('Field', () => {
    type mountFormProps = {
        data?: _FormData<any>,
        onSubmit?: Object => void,
        onSubmitFailed?: void => void,
        onSubmitFinished?: void => void,
        onChange?: (_FormData<any>) => void,
        name: $Keys<any>,
        validation?: _FormValidation<any>,
    };
    const mountForm = ({
        data = formData,
        onSubmit = () => {},
        onSubmitFailed,
        onSubmitFinished,
        onChange = () => {},
        name,
        validation = formValidation,
    }: mountFormProps) => {
        const error = data.errors[name];
        return mount(
            <Form {...{ validation, onChange, onSubmit, onSubmitFailed, onSubmitFinished, data }}>
                <Field name={name}>
                    {({ onChange, onBlur, required }) => (
                        <div className={required ? 'required' : undefined}>
                            <input
                                onChange={e => onChange(e.target.value)}
                                onBlur={e => onBlur(e.target.value)}
                                value={data.values[name]}
                            />
                            {error && <span className="error">{error.id}</span>}
                        </div>
                    )}
                </Field>
            </Form>
        );
    };

    it('renders the passed children with the given value', () => {
        const submitSpy = new Spy('submitSpy');
        const submitFailedSpy = new Spy('submitFailedSpy');
        const submitFinishedSpy = new Spy('submitFinishedSpy');
        const changeSpy = new Spy('changeSpy');
        const form = mountForm({
            onSubmit: submitSpy,
            onChange: changeSpy,
            name: 'name',
            onSubmitFailed: submitFailedSpy,
            onSubmitFinished: submitFinishedSpy,
        });

        const field = form.find(Field);
        expect(field.find('.required').length).toBe(1);
        expect(field.find('.error').length).toBe(0);
        const input = field.find('input');

        expect(input.props().onChange).toBeInstanceOf(Function);
        expect(input.props().onBlur).toBeInstanceOf(Function);
        expect(input.props().value).toBe('Kenny');

        input.simulate('change', { target: { value: 'test-name' } });
        changeSpy.wasCalledWith({
            values: { name: 'test-name', age: 81, size: 170, nickname: 'KeNNy', email: 'kenny@testweb.de' },
            errors: {},
        });

        input.simulate('blur', { target: { value: 'test-name again' } });
        changeSpy.wasCalledWith({
            values: { name: 'test-name again', age: 81, size: 170, nickname: 'KeNNy', email: 'kenny@testweb.de' },
            errors: {},
        });

        input.simulate('change', { target: { value: 'test-name too long' } });
        changeSpy.wasCalledWith({
            values: { name: 'test-name too long', age: 81, size: 170, nickname: 'KeNNy', email: 'kenny@testweb.de' },
            errors: { name: { id: 'validation.characters.atMost.x', values: { num: 10, s: 's' } } },
        });

        form.simulate('submit');
        submitSpy.wasCalledWith({ name: 'Kenny', age: 81, size: 170, nickname: 'KeNNy', email: 'kenny@testweb.de' });
        submitFailedSpy.wasNotCalled();
        submitFinishedSpy.wasCalled(1);
    });

    it('propagates new values sync and errors async', async () => {
        const changeSpy = new Spy('changeSpy');
        const data = { values: { name: 'start' }, errors: {} };
        const validation = {
            name: {
                onChange: v => {
                    if (v) {
                        return v === 'fail' ? Promise.resolve({ id: 'failure' }) : Promise.resolve();
                    }
                },
            },
        };
        const form = mountForm({ onChange: changeSpy, name: 'name', validation, data });

        const field = form.find(Field);
        expect(field.find('.required').length).toBe(0);
        expect(field.find('.error').length).toBe(0);
        const input = field.find('input');

        expect(input.props().value).toBe('start');

        // first the same not failing value
        input.simulate('change', { target: { value: 'start' } });
        changeSpy.wasNotCalled();

        await window.nextTick(); // wait one tick

        changeSpy.wasNotCalled();

        // second the failing value
        input.simulate('change', { target: { value: 'fail' } });
        changeSpy.wasCalled(1);
        changeSpy.wasCalledWith({ values: { name: 'fail' }, errors: {} });

        await window.nextTick(); // wait one tick

        changeSpy.wasCalled(2);
        changeSpy.wasCalledWith({ values: { name: 'fail' }, errors: { name: { id: 'failure' } } });

        // last the not failing different value
        changeSpy.reset();
        input.simulate('change', { target: { value: 'anything' } });
        changeSpy.wasCalled(1);
        changeSpy.wasCalledWith({ values: { name: 'anything' }, errors: {} });

        changeSpy.reset(); // we want to ensure that the onChange handler will be called with the same value
        await window.nextTick(); // wait one tick

        // since we did not propagate the change correctly, it seems like there was a value change
        changeSpy.wasCalled(1);
        changeSpy.wasCalledWith({ values: { name: 'anything' }, errors: {} });
    });

    it('does not call the submit handler if asynchronous validations failed', async () => {
        const submitSpy = new Spy('submitSpy');
        const submitFailedSpy = new Spy('submitFailedSpy');
        const submitFinishedSpy = new Spy('submitFinishedSpy');
        const changeSpy = new Spy('changeSpy');
        const data = { values: { name: 'start' }, errors: {} };
        const validation = {
            name: {
                onBlur: v => {
                    if (v) {
                        return Promise.resolve({ id: 'failure' });
                    }
                },
            },
        };

        const form = mountForm({
            data,
            validation,
            onSubmit: submitSpy,
            onChange: changeSpy,
            name: 'name',
            onSubmitFailed: submitFailedSpy,
            onSubmitFinished: submitFinishedSpy,
        });
        const field = form.find(Field);
        expect(field.find('.required').length).toBe(0);
        expect(field.find('.error').length).toBe(0);
        const input = field.find('input');

        expect(input.props().value).toBe('start');

        form.simulate('submit');
        submitSpy.wasNotCalled();
        submitFailedSpy.wasNotCalled();
        submitFinishedSpy.wasNotCalled();
        // first we are informed about submitting state
        changeSpy.wasCalled(1);
        changeSpy.wasCalledWith({ values: { name: 'start' }, errors: {}, submitting: true });

        changeSpy.reset();
        // wait as many ticks as are required for getting and forwarding all errors
        await window.nextTick();

        changeSpy.wasCalled(1);
        // finally we get the error and the submitting phase ends
        changeSpy.wasCalledWith({ values: { name: 'start' }, errors: { name: { id: 'failure' } }, submitting: false });
        // submit was not called
        submitSpy.wasNotCalled();
        submitFailedSpy.wasCalled(1);
        submitFinishedSpy.wasNotCalled();
    });

    it('considers the run time of the submit handler as submitting phase', async () => {
        const fakePromise = { then: new Spy('submitPromiseSpy').calls(func => func()) };
        const submitSpy = new Spy('submitSpy').returns(fakePromise);
        const submitFailedSpy = new Spy('submitFailedSpy');
        const submitFinishedSpy = new Spy('submitFinishedSpy');
        const changeSpy = new Spy('changeSpy');
        const data = { values: { name: 'start' }, errors: {} };
        const validation = { name: { onBlur: () => Promise.resolve() } };

        const form = mountForm({
            data,
            validation,
            onSubmit: submitSpy,
            onChange: changeSpy,
            name: 'name',
            onSubmitFailed: submitFailedSpy,
            onSubmitFinished: submitFinishedSpy,
        });
        const field = form.find(Field);
        // this has to be considered required, because a promise was returned for undefined value
        expect(field.find('.required').length).toBe(1);
        expect(field.find('.error').length).toBe(0);
        const input = field.find('input');

        expect(input.props().value).toBe('start');

        form.simulate('submit');
        submitSpy.wasNotCalled();
        submitFailedSpy.wasNotCalled();
        submitFinishedSpy.wasNotCalled();
        // first we are informed about submitting state
        changeSpy.wasCalled(1);
        changeSpy.wasCalledWith({ values: { name: 'start' }, errors: {}, submitting: true });

        changeSpy.reset();
        // wait as many ticks as are required for making all validations
        await window.nextTick();

        fakePromise.then.wasCalled(1);
        changeSpy.wasCalled(1);
        // finally we get the error and the submitting phase ends
        changeSpy.wasCalledWith({ values: { name: 'start' }, errors: {}, submitting: false });
        // submit was not called
        submitSpy.wasCalledWith({ name: 'start' });
        submitFailedSpy.wasNotCalled();
        submitFinishedSpy.wasCalled(1);
    });

    it('renders the passed children with the given errors', () => {
        const submitSpy = new Spy('submitSpy');
        const changeSpy = new Spy('changeSpy');
        const form = mountForm({
            data: invalidFormData,
            onSubmit: submitSpy,
            onChange: changeSpy,
            name: 'size',
        });
        const field = form.find(Field);
        expect(field.find('.required').length).toBe(0);
        expect(field.find('.error').text()).toBe('validation.value.incompatible');
        const input = field.find('input');

        expect(input.props().onChange).toBeInstanceOf(Function);
        expect(input.props().onBlur).toBeInstanceOf(Function);
        expect(input.props().value).toBe(170);

        input.simulate('blur', { target: { value: 170 } });
        changeSpy.wasNotCalled();

        input.simulate('change', { target: { value: 150 } });
        changeSpy.wasCalledWith({
            values: { name: 'Kenny - The King', age: 9999, size: 150, email: '' },
            errors: {},
        });

        form.simulate('submit');
        submitSpy.wasNotCalled();
    });

    it('makes no updates if value did not change and error was present', () => {
        const changeSpy = new Spy('changeSpy');
        const form = mountForm({ values: invalidFormData, onChange: changeSpy, name: 'size' });
        const field = form.find(Field);
        const input = field.find('input');

        input.simulate('change', { target: { value: invalidFormData.values.size } });
        changeSpy.wasNotCalled();
    });

    it('makes no updates if value did not change and no error occurred', () => {
        const changeSpy = new Spy('changeSpy');
        const form = mountForm({ onChange: changeSpy, name: 'age' });

        const field = form.find(Field);
        const input = field.find('input');

        input.simulate('change', { target: { value: formData.values.age } });
        changeSpy.wasNotCalled();

        input.simulate('change', { target: { value: 1000 } });
        changeSpy.wasCalled();
    });

    it('makes updates if the validator returns an new error', () => {
        const changeSpy = new Spy('changeSpy');
        const form = mountForm({ data: invalidFormData, onChange: changeSpy, name: 'age' });

        const field = form.find(Field);
        const input = field.find('input');

        input.simulate('change', { target: { value: invalidFormData.values.age } });
        changeSpy.wasCalledWith({
            values: { name: 'Kenny - The King', age: 9999, size: 170, email: '' },
            errors: {
                size: { id: 'validation.value.incompatible' },
                age: { id: 'validation.characters.atMost.x', values: { num: 3, s: 's' } },
            },
        });
    });

    it('updates still uninitialized values', () => {
        const changeSpy = new Spy('changeSpy');
        const form = mountForm({ onChange: changeSpy, name: 'uninitialized' });

        const field = form.find(Field);
        const input = field.find('input');

        input.simulate('change', { target: { value: 'some' } });
        changeSpy.wasCalledWith({
            values: {
                name: 'Kenny',
                age: 81,
                size: 170,
                nickname: 'KeNNy',
                email: 'kenny@testweb.de',
                uninitialized: 'some',
            },
            errors: {},
        });
    });

    it('propagates no changes if the form was unmounted', async () => {
        const changeSpy = new Spy('changeSpy');
        const data = { values: { name: 'start' }, errors: {} };
        const validation = { name: { onChange: () => Promise.resolve({ id: 'failure' }) } };
        const form = mountForm({ onChange: changeSpy, name: 'name', validation, data });

        const field = form.find(Field);
        expect(field.find('.required').length).toBe(1);
        expect(field.find('.error').length).toBe(0);
        const input = field.find('input');

        // first without unmounting
        input.simulate('change', { target: { value: 'fail' } });
        changeSpy.wasCalled(1);

        await window.nextTick(); // wait one tick

        // was called again
        changeSpy.wasCalled(2);

        // then with unmounting
        changeSpy.reset();
        input.simulate('change', { target: { value: 'fail' } });
        changeSpy.wasCalled(1);
        changeSpy.wasCalledWith({ values: { name: 'fail' }, errors: {} });
        form.unmount(); // <-- unmounting

        await window.nextTick(); // wait one tick

        // was not called
        changeSpy.wasCalled(1);
    });
});
