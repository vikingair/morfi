// @flow

import React, { useState } from 'react';
import { Spy } from 'spy4js';
import { Select } from '../docs_src/ui/fields/FormSelect';
import { type FormData, Morfi } from '../src';
import { morfiMount } from '../morfi-test-utils/src/';
import { FormInput } from '../docs_src/ui/fields/FormInput';

type Values = { phone: string, name: string };
const initialValues: Values = { phone: '', name: '' };
const initialData: FormData<Values> = { values: initialValues, errors: {} };

const { Form, Fields } = Morfi.create(initialValues);

const TestComponent = ({ onSubmit }: { onSubmit: Function }) => {
    const [data, setData] = useState(initialData);

    return (
        <Form onChange={setData} onSubmit={onSubmit} validation={{}} data={data}>
            <FormInput Field={Fields.phone} />
            {data.values.name === 'Devil' || <FormInput Field={Fields.name} />}
        </Form>
    );
};

describe('TestComponent', () => {
    it('submits a form where the input vanishes', async () => {
        const onSubmit = new Spy('onSubmit');
        const { update, submit } = morfiMount(<TestComponent onSubmit={onSubmit} />);

        update('phone', '123');
        update('name', 'Devil');

        await submit();

        onSubmit.hasCallHistory({ phone: '123', name: 'Devil' });
    });
});
