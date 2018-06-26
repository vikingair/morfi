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
            .expect({ values: { email: 'nomail.com' }, errors: { email: { id: 'validation.email.requirements' } } })
            .change('email', 'some@mail.com')
            .expect({ values: { email: 'some@mail.com' }, errors: { email: undefined } })
            .change('pw', '1234567')
            .expectErrors({ pw: { id: 'validation.pw.requirements' } })
            .change('pw', '12345678')
            .expectErrors({ pw: undefined });
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
            .expect({ values: { email: 'nomail.com' }, errors: { email: undefined } })
            .blur()
            .expect({ values: { email: 'nomail.com' }, errors: { email: { id: 'validation.email.requirements' } } })
            .change('email', 'some@mail.com')
            .expect({ values: { email: 'some@mail.com' }, errors: { email: undefined } })
            .blur()
            .expect({ values: { email: 'some@mail.com' }, errors: { email: undefined } })
            .change('pw', '1234567')
            .expect({ errors: { pw: undefined } })
            .blur()
            .expect({ errors: { pw: { id: 'validation.pw.requirements' } } })
            .change('pw', '12345678')
            .expect({ errors: { pw: undefined } })
            .blur()
            .expect({ errors: { pw: undefined } });
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
            .expectErrors({ email: undefined, pw: undefined });

        await wrapper.submit().nextTick();

        wrapper
            .expectErrors({
                email: { id: 'validation.email.requirements' },
                pw: { id: 'validation.pw.requirements' },
            })
            .change('email', 'some@mail.com')
            .change('pw', '12345678')
            .expectErrors({ email: undefined, pw: undefined });

        await wrapper.submit().nextTick();

        wrapper.expectErrors({ email: undefined, pw: undefined });
    });
});
