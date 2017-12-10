// @flow
import React, { Component } from 'react';
import logo from '../logo.svg';
import './App.css';
import { Validators } from './validators/validators';
import { Form } from './form';
import { FormInput } from './fields';
import type { FormData } from './form';
import { FormSelect } from './fields/FormSelect';

const validation = {
    firstName: { onChange: Validators.string({ min: 1, max: 10 }) },
    lastName: { onBlur: Validators.string({ min: 1, max: 10 }) },
    age: { onChange: Validators.number({ minLength: 1, maxLength: 3 }) },
};

type MyFormValues = {
    gender: string,
    firstName: string,
    lastName?: string,
    age?: string,
};

type AppState = {
    data: FormData<MyFormValues>,
    message?: string,
};

const genderOptions = [{ value: 'M', label: 'male' }, { value: 'F', label: 'female' }];

class App extends Component<{}, AppState> {
    state: AppState = { data: { values: { gender: 'M', firstName: 'Nick', age: '12' }, errors: {} } };

    onChange = (data: *) => this.setState({ data });

    onSubmit = ({ gender, firstName, lastName, age }: MyFormValues): void => {
        this.setState({
            message:
                `Hello ${gender === 'M' ? 'Mr' : 'Mrs'}. ${firstName} ${lastName || ''},\n` +
                `thank you for submitting your age: ${age || 0}`,
        });
    };

    field = (name: *): * => ({ name, value: this.state.data.values[name], error: this.state.data.errors[name] });

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to form4js</h1>
                </header>
                <div className="container">
                    <Form
                        validation={validation}
                        onChange={this.onChange}
                        data={this.state.data}
                        onSubmit={this.onSubmit}>
                        <div className="row">
                            <FormInput
                                {...this.field('firstName')}
                                label="First name"
                                className="form-group col-sm-6"
                            />
                            <FormInput {...this.field('lastName')} label="Last name" className="form-group col-sm-6" />
                        </div>
                        <div className="row">
                            <FormSelect
                                {...this.field('gender')}
                                options={genderOptions}
                                label="Gender"
                                className="form-group col-sm-6"
                            />
                            <FormInput {...this.field('age')} label="Age" className="form-group col-sm-6" />
                        </div>
                        <button className="btn btn-primary">Abschicken</button>
                    </Form>
                    {this.state.message && (
                        <blockquote>
                            <p>{this.state.message}</p>
                        </blockquote>
                    )}
                </div>
            </div>
        );
    }
}

export default App;
