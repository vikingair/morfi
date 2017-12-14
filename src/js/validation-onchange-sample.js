/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';
import { Validators } from './validators/validators';
import { Form } from './form';
import { FormInput } from './fields';
import type { FormData } from './form';
import DisplayValues from './DisplayValues';

const validation = {
    email: { onChange: Validators.email },
    pw: { onChange: Validators.regex({ re: /^[a-zA-Z0-9]{8,}$/, message: { id: 'validation.pw.requirements' } }) },
};

type FormValues = {
    email?: string,
    pw?: string,
};

type ValidationOnChangeSampleState = { data: FormData<FormValues>, pending: boolean };

const initialState = {
    data: { values: {}, errors: {} },
    pending: false,
};

export default class ValidationOnChangeSample extends Component<{}, ValidationOnChangeSampleState> {
    state: ValidationOnChangeSampleState = initialState;

    onChange = (data: FormData<FormValues>) => this.setState({ data });

    onSubmit = (): void => {
        this.setState({ ...initialState, pending: true });
        // simulate server request
        window.setTimeout(() => {
            this.setState({ pending: false });
        }, 2000);
    };

    render(): React$Node {
        const data = this.state.data;
        const { values, errors } = data;
        return (
            <div className="col-12">
                <Form validation={validation} onChange={this.onChange} data={data} onSubmit={this.onSubmit}>
                    <div className="row">
                        <div className="col-6">
                            <FormInput
                                name="email"
                                value={values.email}
                                error={errors.email}
                                label="Email"
                                placeholder="Please enter your email address"
                            />
                            <FormInput
                                name="pw"
                                value={values.pw}
                                error={errors.pw}
                                label="Password"
                                placeholder="Set your password"
                            />
                            <div className="btn-toolbar">
                                <button
                                    className="btn btn-success"
                                    disabled={this.state.pending || Form.hasErrors(data)}>
                                    {this.state.pending && <i className="fa fa-circle-notch fa-spin" />} Submit
                                </button>
                            </div>
                        </div>
                        <div className="col-6">
                            <DisplayValues data={this.state.data} />
                        </div>
                    </div>
                </Form>
            </div>
        );
    }
}
