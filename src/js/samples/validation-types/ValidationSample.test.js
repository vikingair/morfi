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
import { mountForm } from '../../../test/form-test-util';
import { Select } from '../../fields/FormSelect';

describe('AsyncValidationSample', () => {
    it('renders the initial form', () => {
        expect(shallow(<ValidationSample />)).toMatchSnapshot();
    });

    it('validates the form integration with onChange - Validations', () => {
        mountForm(<ValidationSample />)
            .change('email', 'nomail.com')
            .assume({ values: { email: 'nomail.com' }, errors: { email: { id: 'validation.email.requirements' } } })
            .change('email', 'some@mail.com')
            .assume({ values: { email: 'some@mail.com' }, errors: { email: undefined } })
            .change('pw', '1234567')
            .assumeErrors({ pw: { id: 'validation.pw.requirements' } })
            .change('pw', '12345678')
            .assumeErrors({ pw: undefined });
    });

    it('validates the form integration with onBlur - Validations', () => {
        const wrapper = mountForm(<ValidationSample />);
        wrapper
            .mounted()
            .find(Select)
            .props()
            .onChange('onBlur');
        wrapper
            .change('email', 'nomail.com')
            .assume({ values: { email: 'nomail.com' }, errors: { email: undefined } })
            .blur()
            .assume({ values: { email: 'nomail.com' }, errors: { email: { id: 'validation.email.requirements' } } })
            .change('email', 'some@mail.com')
            .assume({ values: { email: 'some@mail.com' }, errors: { email: undefined } })
            .blur()
            .assume({ values: { email: 'some@mail.com' }, errors: { email: undefined } })
            .change('pw', '1234567')
            .assume({ errors: { pw: undefined } })
            .blur()
            .assume({ errors: { pw: { id: 'validation.pw.requirements' } } })
            .change('pw', '12345678')
            .assume({ errors: { pw: undefined } })
            .blur()
            .assume({ errors: { pw: undefined } });
    });

    it('validates the form integration with onSubmit - Validations', async () => {
        const wrapper = mountForm(<ValidationSample />);
        wrapper
            .mounted()
            .find(Select)
            .props()
            .onChange('onSubmit');
        wrapper
            .change('email', 'nomail.com')
            .change('pw', '1234567')
            .blur()
            .assumeErrors({ email: undefined, pw: undefined });

        await wrapper.submit().nextTick();

        wrapper
            .assumeErrors({
                email: { id: 'validation.email.requirements' },
                pw: { id: 'validation.pw.requirements' },
            })
            .change('email', 'some@mail.com')
            .change('pw', '12345678')
            .assumeErrors({ email: undefined, pw: undefined });

        await wrapper.submit().nextTick();

        wrapper.assumeErrors({ email: undefined, pw: undefined });
    });
});
