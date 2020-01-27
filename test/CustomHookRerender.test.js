// @flow

import React, { useState } from 'react';
import { Spy } from 'spy4js';
import { type FormData, Morfi } from '../src';
import { morfiMount } from '../morfi-test-utils/src/';
import { FormInput } from '../docs_src/ui/fields/FormInput';

type Values = { phone: string, name: string };
const initialValues: Values = { phone: '', name: '' };
const initialData: FormData<Values> = { values: initialValues, errors: {} };

const { Form, Fields } = Morfi.create(initialValues);

const MockedReturnValue = { current: false };
const useNameRequired = () => MockedReturnValue.current;

const TestComponent = ({ onSubmit }: { onSubmit: Function }) => {
    const [data, setData] = useState(initialData);
    const nameRequired = useNameRequired();

    return (
        <Form onChange={setData} onSubmit={onSubmit} validation={{}} data={data}>
            <FormInput Field={Fields.phone} />
            {nameRequired && <FormInput Field={Fields.name} />}
        </Form>
    );
};

describe('TestComponent', () => {
    it('let the component rerender if mocked hook return value was modified', async () => {
        const onSubmit = new Spy('onSubmit');
        const { update, rerender } = morfiMount(<TestComponent onSubmit={onSubmit} />);

        // name field is not visible so far
        expect(() => update('name', 'Foobar')).toThrow();

        // then we want the hook to return some different value
        MockedReturnValue.current = true;
        // and rerender
        rerender();

        // now we are able to modify the field value
        update('name', 'Foobar');
    });
});
