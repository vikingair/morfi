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
import type { FormData, FormValidation } from './form';
import DisplayValues from './DisplayValues';
import type { ValidationType } from './form/Form-classes';
import { Select } from './fields/FormSelect';
import type { SelectOption } from './fields/FormSelect';

const ValidationTypeOptions: Array<SelectOption> = [
    { label: 'onChange', value: 'onChange' },
    { label: 'onBlur', value: 'onBlur' },
    { label: 'onSubmit', value: 'onSubmit' },
];

const descriptionFor = (type: ValidationType) => {
    switch (type) {
        case 'onChange':
            return (
                'This validation type will automatically make a ' +
                'validation for each character you enter in the form fields.'
            );
        case 'onBlur':
            return 'This validation type will automatically make a validation each time you leave the form field.';
        case 'onSubmit':
            return (
                'This validation type will trigger the validators ' +
                'as soon as the form data was requested to be submitted.'
            );
        default:
            return '';
    }
};

type FormValues = {
    email?: string,
    pw?: string,
};

const validationFor = (type: ValidationType): FormValidation<FormValues> => {
    return {
        email: { [type]: Validators.email },
        pw: { [type]: Validators.regex({ re: /^[a-zA-Z0-9]{8,}$/, message: { id: 'validation.pw.requirements' } }) },
    };
};

type ValidationSampleState = {
    data: FormData<FormValues>,
    validation: FormValidation<FormValues>,
    currentValidationType: ValidationType,
};

const initialState = {
    data: { values: {}, errors: {} },
    validation: validationFor('onChange'),
    currentValidationType: 'onChange',
};

export class ValidationSample extends Component<{}, ValidationSampleState> {
    state: ValidationSampleState = initialState;

    onChange = (data: FormData<FormValues>) => this.setState({ data });

    onSubmit = (): Promise<void> => {
        // simulate server request
        return window.sleep(2000);
    };

    chooseValidationType = (type: any /* ValidationType <- is a problem with the used select component */) => {
        this.setState({ validation: validationFor(type), currentValidationType: type });
    };

    render(): React$Node {
        const data = this.state.data;
        const { values, errors, submitting } = data;
        return (
            <div className="col-12">
                <Select
                    label="Choose the validation type"
                    className="validation-type-picker mt-3 mb-2 col-md-6 row"
                    options={ValidationTypeOptions}
                    value={this.state.currentValidationType}
                    onChange={this.chooseValidationType}
                />
                <p className="small font-italic">{descriptionFor(this.state.currentValidationType)}</p>
                <hr />
                <Form validation={this.state.validation} onChange={this.onChange} data={data} onSubmit={this.onSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <FormInput
                                name="email"
                                value={values.email}
                                error={errors.email}
                                label="Email"
                                placeholder="Please enter your email address"
                            />
                            <FormInput
                                name="pw"
                                type="password"
                                value={values.pw}
                                error={errors.pw}
                                label="Password"
                                placeholder="Set your password"
                            />
                            <div className="btn-toolbar">
                                <button className="btn btn-success" disabled={submitting || Form.hasErrors(data)}>
                                    {submitting && <i className="fa fa-circle-notch fa-spin" />} Submit
                                </button>
                            </div>
                        </div>
                        <div className="col-md-6 mt-3">
                            <DisplayValues data={this.state.data} />
                        </div>
                    </div>
                </Form>
            </div>
        );
    }
}
