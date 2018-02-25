/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import AsyncValidationSample from './AsyncValidationSample';
import { Spy } from 'spy4js';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Input } from './fields/FormInput';

describe('AsyncValidationSample', () => {
    it('renders the initial form', () => {
        expect(toJson(shallow(<AsyncValidationSample />))).toMatchSnapshot();
    });
    it('knows the requirements', () => {
        const mounted = mount(<AsyncValidationSample />);

        const inputs = mounted.find(Input);
        expect(inputs.length).toBe(2);

        const [userNameInput, realNameInput] = inputs;

        expect(userNameInput.props.required).toBeTruthy();
        expect(userNameInput.props.value).toBe(undefined);
        expect(userNameInput.props.error).toBe(undefined);
        expect(userNameInput.props.label).toBe('Username');
        expect(userNameInput.props.disabled).toBeFalsy();
        expect(userNameInput.props.pending).toBeFalsy();

        expect(realNameInput.props.required).toBeFalsy();
        expect(realNameInput.props.value).toBe(undefined);
        expect(realNameInput.props.error).toBe(undefined);
        expect(realNameInput.props.label).toBe('Real name');
        expect(realNameInput.props.disabled).toBeFalsy();
    });

    it('validates the real name', () => {
        const mounted = mount(<AsyncValidationSample />);

        const realNameInput = () => mounted.find(Input).at(1);

        realNameInput()
            .find('input')
            .simulate('change', { target: { value: 'No r34l N@me' } });

        const nextProps = realNameInput().props();
        expect(nextProps.value).toBe('No r34l N@me');
        expect(nextProps.error).toEqual({ id: 'AsyncValidationSample.realName.validation.requirements' });
    });

    it('validates the user name', async () => {
        const mounted = mount(<AsyncValidationSample />);

        // always take the latest version of the mounted instance
        const userNameInput = () => mounted.find(Input).at(0);

        // change the input to an invalid value
        userNameInput()
            .find('input')
            .simulate('change', { target: { value: '' } });

        // see the error
        let nextProps = userNameInput().props();
        expect(nextProps.value).toBe('');
        expect(nextProps.error).toEqual({ id: 'validation.characters.atLeast.x', values: { num: 1, s: '' } });

        // refresh the state and let the "call" succeed
        mounted.setState({ data: { values: {}, errors: {} } });
        const mathRandomSpy = Spy.on(Math, 'random').returns(0.1);

        // leave the field with some entered value
        userNameInput()
            .find('input')
            .simulate('blur', { target: { value: 'Anything' } });

        // wait for the validations
        await window.nextTick();

        // update the component, since the setState was called async and ezyme did not update correctly
        mounted.update();

        // no error is displayed
        nextProps = userNameInput().props();
        expect(nextProps.value).toBe('Anything');
        expect(nextProps.error).toEqual(undefined);

        // refresh the state and let the "call" fail
        mounted.setState({ data: { values: {}, errors: {} } });
        mathRandomSpy.returns(0.9);

        // leave the field with some entered value
        userNameInput()
            .find('input')
            .simulate('blur', { target: { value: 'Anything else' } });

        // wait for the validations
        await window.nextTick();

        // update the component, since the setState was called async and ezyme did not update correctly
        mounted.update();

        // see the error
        nextProps = userNameInput().props();
        expect(nextProps.value).toBe('Anything else');
        expect(nextProps.error).toEqual({
            id: 'AsyncValidationSample.userName.already.registered',
            values: { userName: 'Anything else' },
        });
    });
});
