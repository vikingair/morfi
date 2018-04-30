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

const alreadyRegistered_userName = 'tom';
const everySecondTimeFailing_userName = 'jack';
const failingAfterSubmit_userName = 'mike';
let validationCounter = 0;

export default class AsyncValidationSample extends Component<{}, AsyncValidationSampleState> {
    validateUserName: Validator = (userName?: string) => {
        const syncError = Validators.string({ min: 1 })(userName);
        if (syncError) {
            return syncError;
        }
        const lowerCaseUserName = (userName: any).toLowerCase();
        this.setState({ pendingUserName: true });
        validationCounter++;
        return window.sleep(1000).then(() => {
            if (lowerCaseUserName === alreadyRegistered_userName) {
                this.setState({ pendingUserName: false });
                return { id: 'AsyncValidationSample.userName.already.registered', values: { userName } };
            } else if (lowerCaseUserName === everySecondTimeFailing_userName && validationCounter % 2 === 0) {
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

    onSubmit = ({ userName = '' }: FormValues): Promise<void> => {
        console.log('onSubmit was called');
        // simulate server request
        const fakeServerRequest = window.sleep(1000);
        return userName.toLowerCase() !== failingAfterSubmit_userName
            ? fakeServerRequest
            : fakeServerRequest.then(() => {
                  throw new Error('AsyncValidationSample.userName.submit.failed');
              });
    };

    onSubmitFailed = (e?: Error): void => {
        e &&
            this.setState({
                data: {
                    values: { ...this.state.data.values },
                    errors: { ...this.state.data.errors, userName: { id: e.message } },
                },
            });
    };

    onSubmitFinished = (): void => {
        this.setState({ data: { values: {}, errors: {} } });
    };

    render(): React$Node {
        const { data, pendingUserName } = this.state;
        const { values, errors, submitting } = data;
        return (
            <div className="col-12">
                <Form
                    validation={this.state.validations}
                    onChange={this.onChange}
                    data={data}
                    onSubmit={this.onSubmit}
                    onSubmitFailed={this.onSubmitFailed}
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
                                ATTENTION: The validation succeeds for all names, but the following:<br />
                                <strong>Tom</strong>: Validation fails each time.<br />
                                <strong>Jack</strong>: Validation fails each second time.<br />
                                <strong>Mike</strong>: Validation succeeds but submitting fails.
                            </p>
                            <FormInput
                                name="realName"
                                value={values.realName}
                                error={errors.realName}
                                label="Real name"
                                placeholder="Please enter your real name"
                            />
                            <div className="btn-toolbar">
                                <button className="btn btn-success" disabled={submitting || Form.hasErrors(data)}>
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
