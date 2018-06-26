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
import { mountForm } from '../../../test/form-test-util';

describe('AsyncValidationSample', () => {
    it('renders the initial form', () => {
        expect(shallow(<AsyncValidationSample />)).toMatchSnapshot();
    });

    it('validates the form integration', async () => {
        const wrapper = mountForm(<AsyncValidationSample />)
            .expectRequired({ userName: true, realName: false })
            .change('realName', 'Tester')
            .expect({ values: { realName: 'Tester' }, errors: { realName: undefined } })
            .change('realName', 'Tester @ga!n')
            .expect({
                values: { realName: 'Tester @ga!n' },
                errors: { realName: { id: 'AsyncValidationSample.realName.validation.requirements' } },
            })
            .change('userName', 'Tom')
            .expect({ errors: { userName: undefined } });

        await wrapper.blur().nextTick();

        wrapper
            .expect({
                values: { userName: 'Tom' },
                errors: {
                    userName: { id: 'AsyncValidationSample.userName.already.registered', values: { userName: 'Tom' } },
                },
            })
            .change('userName', 'otherFooName')
            .expect({ errors: { userName: undefined } });

        await wrapper.blur().nextTick();

        wrapper.expect({ values: { userName: 'otherFooName' }, errors: { userName: undefined } });

        wrapper.submit();
    });
});
