/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';
import { Validators } from './validators/validators';
import { Form } from './form';
import { FormInput } from './fields';
import type { FormData, FormValidation, Validator } from './form';

type FormValues = {
    userName?: string,
    realName?: string,
};

const StaticValidations: FormValidation<FormValues> = {
    realName: {
        onChange: Validators.optionalOf(
            Validators.regex({
                re: /^[a-zöüä][a-zöüä ]*$/i,
                message: { id: 'AsyncValidationSample.realName.validation.requirements' },
            })
        ),
    },
};

type AsyncValidationSampleState = {
    data: FormData<FormValues>,
    validations: FormValidation<FormValues>,
    pendingUserName: boolean,
};

export default class AsyncValidationSample extends Component<{}, AsyncValidationSampleState> {
    validateUserName: Validator = (userName?: string) => {
        const syncError = Validators.string({ min: 1 })(userName);
        if (syncError) {
            return syncError;
        }
        this.setState({ pendingUserName: true });
        return window.sleep(1000).then(() => {
            if (Math.random() > 0.5) {
                this.setState({ pendingUserName: false });
                return { id: 'AsyncValidationSample.userName.already.registered', values: { userName } };
            } else {
                this.setState({ pendingUserName: false });
            }
        });
    };

    getValidations = (): FormValidation<FormValues> => {
        return {
            ...StaticValidations,
            userName: { onBlur: this.validateUserName, onChange: Validators.string({ min: 1 }) },
        };
    };

    state: AsyncValidationSampleState = {
        data: { values: {}, errors: {} },
        pendingUserName: false,
        validations: this.getValidations(),
    };

    onChange = (data: FormData<FormValues>) => this.setState({ data });

    onSubmit = (): Promise<void> => {
        // simulate server request
        return window.sleep(2000);
    };

    onSubmitFinished = (): void => {
        this.setState({ data: { values: {}, errors: {} } });
    };

    render(): React$Node {
        const { data, pendingUserName } = this.state;
        const { values, errors, submitting } = data;
        const submittingOrValidating = pendingUserName || submitting;
        return (
            <div className="col-12">
                <Form
                    validation={this.state.validations}
                    onChange={this.onChange}
                    data={data}
                    onSubmit={this.onSubmit}
                    onSubmitFinished={this.onSubmitFinished}>
                    <div className="row">
                        <div className="col-md-12">
                            <FormInput
                                name="userName"
                                value={values.userName}
                                error={errors.userName}
                                pending={pendingUserName}
                                label="Username"
                                placeholder="Please enter your desired username"
                            />
                            <p className="small font-italic form-group-apply">
                                ATTENTION: The validation succeeds randomly...
                            </p>
                            <FormInput
                                name="realName"
                                value={values.realName}
                                error={errors.realName}
                                label="Real name"
                                placeholder="Please enter your real name"
                            />
                            <div className="btn-toolbar">
                                <button
                                    className="btn btn-success"
                                    disabled={submittingOrValidating || Form.hasErrors(data)}>
                                    {submitting && <i className="fa fa-circle-notch fa-spin" />} Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        );
    }
}
