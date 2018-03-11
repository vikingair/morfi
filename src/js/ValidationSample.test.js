/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import { ValidationSample } from './ValidationSample';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Input } from './fields/FormInput';
import { FormWrapper } from '../test/form-test-util';
import { Select } from './fields/FormSelect';

describe('AsyncValidationSample', () => {
    it('renders the initial form', () => {
        expect(toJson(shallow(<ValidationSample />))).toMatchSnapshot();
    });

    it('validates the form integration with onChange - Validations', () => {
        new FormWrapper(<ValidationSample />)
            .validate(
                { base: 'state', name: 'data' },
                { name: 'email', component: Input, required: true },
                { name: 'pw', component: Input, required: true }
            )
            .lookAt('email')
            .change('nomail.com')
            .valueIs('nomail.com')
            .errorIs({ id: 'validation.email.requirements' })
            .change('some@mail.com')
            .valueIs('some@mail.com')
            .errorIs(undefined)
            .lookAt('pw')
            .change('1234567')
            .errorIs({ id: 'validation.pw.requirements' })
            .change('12345678')
            .errorIs(undefined);
    });

    it('validates the form integration with onBlur - Validations', () => {
        const wrapper = new FormWrapper(<ValidationSample />);
        wrapper
            .mounted()
            .find(Select)
            .props()
            .onChange('onBlur');
        wrapper
            .validate(
                { base: 'state', name: 'data' },
                { name: 'email', component: Input, required: true },
                { name: 'pw', component: Input, required: true }
            )
            .lookAt('email')
            .change('nomail.com')
            .valueIs('nomail.com')
            .errorIs(undefined)
            .blur()
            .errorIs({ id: 'validation.email.requirements' })
            .change('some@mail.com')
            .valueIs('some@mail.com')
            .errorIs(undefined)
            .blur()
            .errorIs(undefined)
            .lookAt('pw')
            .change('1234567')
            .errorIs(undefined)
            .blur()
            .errorIs({ id: 'validation.pw.requirements' })
            .change('12345678')
            .errorIs(undefined)
            .blur()
            .errorIs(undefined);
    });
});
