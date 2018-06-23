/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import AsyncValidationSample from './AsyncValidationSample';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Input } from './fields/FormInput';
import { FormWrapper } from '../test/form-test-util';

describe('AsyncValidationSample', () => {
    it('renders the initial form', () => {
        expect(toJson(shallow(<AsyncValidationSample />))).toMatchSnapshot();
    });

    it('validates the form integration', async () => {
        const wrapper = new FormWrapper(<AsyncValidationSample />)
            .validate(
                { base: 'state', name: 'data' },
                { name: 'userName', component: Input, required: true },
                { name: 'realName', component: Input, required: false }
            )
            .lookAt('realName')
            .change('Tester')
            .valueIs('Tester')
            .errorIs(undefined)
            .change('Tester @ga!n')
            .valueIs('Tester @ga!n')
            .errorIs({ id: 'AsyncValidationSample.realName.validation.requirements' })
            .lookAt('userName')
            .change('Tom')
            .errorIs(undefined);

        await wrapper.blur().nextTick();

        wrapper
            .valueIs('Tom')
            .errorIs({ id: 'AsyncValidationSample.userName.already.registered', values: { userName: 'Tom' } })
            .change('otherFooName')
            .errorIs(undefined);

        await wrapper.blur().nextTick();

        wrapper.valueIs('otherFooName').errorIs(undefined);

        wrapper.submit();
    });
});
