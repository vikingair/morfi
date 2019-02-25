// @flow

import React, { Component } from 'react';
import { Validators } from '../../validators/validators';
import { Morfi, type FormData } from '../../form/index';
import type { Gender, Person } from './PersonTable';
import PersonTable from './PersonTable';
import type { SelectOption } from '../../fields/FormSelect';
import { FormSelect } from '../../fields/FormSelect';
import { FormNumberInput } from '../../fields/FormNumberInput';
import { FormInput } from '../../fields/FormInput';

type MyFormValues = {|
    firstName: string,
    lastName: string,
    gender: Gender,
    age: number,
|};

const initialValues: MyFormValues = { firstName: 'Nick', lastName: '', gender: 'M', age: 21 };

const { Form, Fields } = Morfi.create(initialValues);

const validation = {
    firstName: { onChange: Validators.string({ min: 1, max: 10 }) },
    lastName: { onBlur: Validators.string({ min: 1, max: 10 }) },
    age: { onChange: Validators.number({ minLength: 1, maxLength: 3 }) },
};

type FirstSampleState = {|
    data: FormData<MyFormValues>,
    persons: Person[],
|};

const genderOptions: SelectOption<Gender>[] = [{ value: 'M', label: 'male' }, { value: 'F', label: 'female' }];

export default class FirstSample extends Component<{}, FirstSampleState> {
    state: FirstSampleState = { data: { values: initialValues, errors: {} }, persons: [] };

    onChange = (data: FormData<MyFormValues>) => this.setState({ data });

    onSubmit = ({ firstName, lastName, gender }: MyFormValues): void => {
        this.setState({
            persons: [...this.state.persons, { gender, firstName, lastName, age: 1 }],
        });
    };

    onClear = () => {
        this.setState({ data: { values: { ...initialValues, firstName: '' }, errors: {} } });
    };

    render(): React$Node {
        const data = this.state.data;
        return (
            <div className="col-12">
                <Form validation={validation} onChange={this.onChange} data={data} onSubmit={this.onSubmit}>
                    <div className="row">
                        <FormInput Field={Fields.firstName} label="First name" className="form-group col-sm-6" />
                        <FormInput Field={Fields.lastName} label="Last name" className="form-group col-sm-6" />
                    </div>
                    <div className="row">
                        <FormSelect
                            Field={Fields.gender}
                            options={genderOptions}
                            label="Gender"
                            className="form-group col-sm-6"
                        />
                        <FormNumberInput Field={Fields.age} label="Age" className="form-group col-sm-6" />
                    </div>
                    <div className="btn-toolbar">
                        <button className="btn btn-secondary mr-2" type="button" onClick={this.onClear}>
                            Clear
                        </button>
                        <button className="btn btn-success" disabled={Morfi.hasErrors(data)}>
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
