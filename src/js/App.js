/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';
import logo from '../logo.svg';
import './App.css';
import { Validators } from './validators/validators';
import { Form } from './form';
import { FormInput, FormNumberInput, FormSelect } from './fields';
import type { FormData } from './form';
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

type AppState = {
    data: FormData<MyFormValues>,
    persons: Person[],
};

const genderOptions = [{ value: 'M', label: 'male' }, { value: 'F', label: 'female' }];

class App extends Component<{}, AppState> {
    state: AppState = { data: { values: { gender: 'M', firstName: 'Nick', age: 21 }, errors: {} }, persons: [] };

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
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to form4js</h1>
                </header>
                <div className="container">
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
                        <div className="btn-toolbar" role="toolbar">
                            <button className="btn btn-secondary" type="button" onClick={this.onClear}>
                                Clear
                            </button>
                            <button className="btn btn-primary" disabled={Form.hasErrors(data)}>
                                Submit
                            </button>
                        </div>
                    </Form>
                    <PersonTable persons={this.state.persons} />
                </div>
            </div>
        );
    }
}

export default App;
