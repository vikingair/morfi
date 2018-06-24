/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';
import { Form, type FormData } from '../../form/index';
import { FormInput } from '../../fields/index';
import { Spinner } from '../../icons/Spinner';

const validation = {
    password: {
        onChange: (v: string) => {
            if (!v) return { id: 'PasswordRepeatForm.validation.password.required' };
            if (RegExp('[^0-9a-zA-Z]').test(v)) return { id: 'PasswordRepeatForm.validation.password.validChars' };
        },
        onBlur: (v: string) => {
            if (!v || v.length < 8) return { id: 'PasswordRepeatForm.validation.password.length' };
            if (!RegExp('[^0-9]').test(v) || !RegExp('[^a-zA-Z]').test(v))
                return { id: 'PasswordRepeatForm.validation.password.mixed' };
        },
    },
};

type MyFormValues = {
    password: string,
    repeat: string,
};

type PasswordRepeatFormState = {
    data: FormData<MyFormValues>,
};

const initialState: PasswordRepeatFormState = { data: { values: { password: '', repeat: '' }, errors: {} } };

export default class PasswordRepeatForm extends Component<{}, PasswordRepeatFormState> {
    state = initialState;
    validation = {
        ...validation,
        repeat: {
            onChange: (v: string) => {
                if (!v || v !== this.state.data.values.password)
                    return { id: 'PasswordRepeatForm.validation.repeat.wrong' };
            },
        },
    };

    onChange = (data: FormData<MyFormValues>) => {
        if (this.state.data.values.password !== data.values.password) {
            this.setState({ data: { ...data, errors: { ...data.errors, repeat: undefined } } });
        } else {
            this.setState({ data });
        }
    };

    onSubmit = ({ password, repeat }: MyFormValues): void => window.sleep(1000);

    onSubmitFinished = () => this.setState(initialState);

    render(): React$Node {
        const data = this.state.data;
        const { values, errors, submitting } = data;
        return (
            <div className="col-12">
                <Form
                    validation={this.validation}
                    onChange={this.onChange}
                    data={data}
                    onSubmit={this.onSubmit}
                    onSubmitFinished={this.onSubmitFinished}>
                    <div className="row">
                        <FormInput
                            name="password"
                            value={values.password}
                            error={errors.password}
                            label="Password"
                            type="password"
                            className="form-group col-sm-6"
                        />
                        <FormInput
                            name="repeat"
                            value={values.repeat}
                            error={errors.repeat}
                            label="Password repetition"
                            type="password"
                            className="form-group col-sm-6"
                        />
                    </div>
                    <div className="btn-toolbar">
                        <button className="btn btn-success" disabled={submitting || Form.hasErrors(data)}>
                            {submitting && <Spinner />} Submit
                        </button>
                    </div>
                </Form>
            </div>
        );
    }
}
