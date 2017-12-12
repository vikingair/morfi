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
import type { _FormData } from './Form-classes';

describe('Field', () => {
    type mountFormProps = {
        data?: _FormData<any>,
        onSubmit?: Object => void,
        onChange?: (_FormData<any>) => void,
        name: $Keys<any>,
    };
    const mountForm = ({ data = formData, onSubmit = () => {}, onChange = () => {}, name }: mountFormProps) => {
        const error = data.errors[name];
        return mount(
            <Form validation={formValidation} data={data} onSubmit={onSubmit} onChange={onChange}>
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
        const changeSpy = new Spy('changeSpy');
        const form = mountForm({ onSubmit: submitSpy, onChange: changeSpy, name: 'name' });

        const field = form.find(Field);
        expect(field.find('.required').length).toBe(1);
        expect(field.find('.error').length).toBe(0);
        const input = field.find('input');

        expect(input.props().onChange).toBeInstanceOf(Function);
        expect(input.props().onBlur).toBeInstanceOf(Function);
        expect(input.props().value).toBe('Kenny');

        input.simulate('change', { target: { value: 'test-name' } });
        changeSpy.wasCalledWith({
            values: { name: 'test-name', age: 81, size: 170, nickname: 'KeNNy' },
            errors: {},
        });

        input.simulate('blur', { target: { value: 'test-name again' } });
        changeSpy.wasCalledWith({
            values: { name: 'test-name again', age: 81, size: 170, nickname: 'KeNNy' },
            errors: {},
        });

        input.simulate('change', { target: { value: 'test-name too long' } });
        changeSpy.wasCalledWith({
            values: { name: 'test-name too long', age: 81, size: 170, nickname: 'KeNNy' },
            errors: { name: { id: 'validation.characters.atMost.x', values: { num: 10 } } },
        });

        form.simulate('submit');
        submitSpy.wasCalledWith({ name: 'Kenny', age: 81, size: 170, nickname: 'KeNNy' });
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
            values: { name: 'Kenny - The King', age: 9999, size: 150 },
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
            values: { name: 'Kenny - The King', age: 9999, size: 170 },
            errors: {
                size: { id: 'validation.value.incompatible' },
                age: { id: 'validation.characters.atMost.x', values: { num: 3 } },
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
            values: { name: 'Kenny', age: 81, size: 170, nickname: 'KeNNy', uninitialized: 'some' },
            errors: {},
        });
    });
});
