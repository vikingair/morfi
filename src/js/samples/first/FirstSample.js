/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';
import { Validators } from '../../validators/validators';
import { Form } from '../../form/index';
import { FormInput, FormNumberInput, FormSelect } from '../../fields/index';
import type { FormData } from '../../form/index';
import type { Person } from './PersonTable';
import PersonTable from './PersonTable';

const validation = {
    firstName: { onChange: Validators.string({ min: 1, max: 10 }) },
    lastName: { onBlur: Validators.string({ min: 1, max: 10 }) },
    age: { onChange: Validators.number({ minLength: 1, maxLength: 3 }) },
};

type MyFormValues = {
    gender: string,
    firstName: string,
    lastName?: string,
    age: number,
};

type FirstSampleState = {
    data: FormData<MyFormValues>,
    persons: Person[],
};

const genderOptions = [{ value: 'M', label: 'male' }, { value: 'F', label: 'female' }];

export default class FirstSample extends Component<{}, FirstSampleState> {
    state: FirstSampleState = {
        data: { values: { gender: 'M', firstName: 'Nick', age: 21 }, errors: {} },
        persons: [],
    };

    onChange = (data: FormData<MyFormValues>) => this.setState({ data });

    onSubmit = ({ gender, firstName, lastName = '', age }: MyFormValues): void => {
        this.setState({
            persons: [...this.state.persons, { gender: gender === 'M' ? 'M' : 'F', firstName, lastName, age }],
        });
    };

    onClear = () => {
        this.setState({ data: { values: { gender: 'M', firstName: '', age: 0 }, errors: {} } });
    };

    render(): React$Node {
        const data = this.state.data;
        const { values, errors } = data;
        return (
            <div className="col-12">
                <Form validation={validation} onChange={this.onChange} data={data} onSubmit={this.onSubmit}>
                    <div className="row">
                        <FormInput
                            name="firstName"
                            value={values.firstName}
                            error={errors.firstName}
                            label="First name"
                            className="form-group col-sm-6"
                        />
                        <FormInput
                            name="lastName"
                            value={values.lastName}
                            error={errors.lastName}
                            label="Last name"
                            className="form-group col-sm-6"
                        />
                    </div>
                    <div className="row">
                        <FormSelect
                            name="gender"
                            value={values.gender}
                            error={errors.gender}
                            options={genderOptions}
                            label="Gender"
                            className="form-group col-sm-6"
                        />
                        <FormNumberInput
                            name="age"
                            value={values.age}
                            error={errors.age}
                            label="Age"
                            className="form-group col-sm-6"
                        />
                    </div>
                    <div className="btn-toolbar">
                        <button className="btn btn-secondary mr-2" type="button" onClick={this.onClear}>
                            Clear
                        </button>
                        <button className="btn btn-success" disabled={Form.hasErrors(data)}>
                            Submit
                        </button>
                    </div>
                </Form>
                <div className="mt-4">
                    <PersonTable persons={this.state.persons} />
                </div>
            </div>
        );
    }
}
