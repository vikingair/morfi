// @flow

import React, { Component } from 'react';
import { Morfi, type FormData, type FormValidation, type ValidationType } from '../../../../dist/cjs/';
import { Validators } from '../../validators/validators';
import { DisplayValues } from '../../tools/DisplayValues';
import { Select, type SelectOption } from '../../fields/FormSelect';
import { Spinner } from '../../icons/Spinner';
import { FormInput } from '../../fields/FormInput';

const ValidationTypeOptions: Array<SelectOption<ValidationType>> = [
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

type FormValues = {| email: string, pw: string |};

const initialValues: FormValues = { email: '', pw: '' };

const { Form, Fields } = Morfi.create(initialValues);

const validationFor = (type: ValidationType): FormValidation<FormValues> => {
    return {
        email: { [type]: Validators.email },
        pw: { [type]: Validators.regex({ re: /^[a-zA-Z0-9]{8,}$/, message: { id: 'validation.pw.requirements' } }) },
    };
};

type ValidationSampleState = {|
    data: FormData<FormValues>,
    validation: FormValidation<FormValues>,
    currentValidationType: ValidationType,
|};

const initialState = {
    data: { values: initialValues, errors: {} },
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
        const { submitting } = data;
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
                                Field={Fields.email}
                                label="Email"
                                placeholder="Please enter your email address"
                            />
                            <FormInput
                                Field={Fields.pw}
                                type="password"
                                label="Password"
                                placeholder="Set your password"
                            />
                            <div className="btn-toolbar">
                                <button className="btn btn-success" disabled={submitting || Morfi.hasErrors(data)}>
                                    <span>{submitting && <Spinner />} Submit</span>
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
