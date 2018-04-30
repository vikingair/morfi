/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';
import type { _ErrorMessage, _FormData, _FormValidation, ValidationType } from './Form-classes';
import { FormUtil, NOP, ReactPropTypesAny } from './Form-classes';

type FormProps<V> = {
    className?: string,
    validation: _FormValidation<V>,
    data: _FormData<V>,
    children: React$Node,
    onChange: (_FormData<V>) => void,
    onSubmit: V => void | Promise<void>,
    onSubmitFailed?: (any, _FormData<V>) => void,
    onSubmitFinished?: (_FormData<V>) => void,
};

class _Form<V: *> extends Component<FormProps<V>> {
    // Register the provided accessible context properties
    // for all children components.
    // To avoid the prop-types dependency, simply ignore the check
    static childContextTypes = {
        onFieldChange: ReactPropTypesAny,
        fieldIsRequired: ReactPropTypesAny,
    };

    static hasErrors = FormUtil.hasErrors;

    getChildContext() {
        return { onFieldChange: this.onFieldChange, fieldIsRequired: this.fieldIsRequired };
    }
    onFieldChange = (name: $Keys<V>, nextValue: any, validationType: ValidationType): void => {
        const data = this.props.data;
        const validators = this.props.validation[name];
        const validator = validators ? validators[validationType] : undefined;
        const nextError = FormUtil.validateField(nextValue, validator);

        if (FormUtil.isPromise(nextError)) {
            if (data.values[name] !== nextValue) {
                this._onChange(FormUtil.update(this.props.data, name, nextValue, undefined));
            }
            (nextError: any).then(error => this._onFieldChangeAfterValidation(name, nextValue, error));
        } else {
            this._onFieldChangeAfterValidation(name, nextValue, (nextError: any));
        }
    };

    _onFieldChangeAfterValidation = (name: $Keys<V>, nextValue: any, nextError?: _ErrorMessage) => {
        const data = this.props.data;
        // if the value did not change AND
        // we had already an error or our validator did not return any error
        // -> we return undefined to avoid a store update
        if (data.values[name] !== nextValue || (nextError && !data.errors[name])) {
            this._onChange(FormUtil.update(data, name, nextValue, nextError));
        }
    };
    fieldIsRequired = (name: $Keys<V>): boolean => {
        return FormUtil.isRequired(this.props.validation[name]);
    };
    _onSubmit = (event: SyntheticEvent<*>): void => {
        event.preventDefault();
        const data = this.props.data;
        this._onChange(FormUtil.setSubmitting(data, true));
        const validated = FormUtil.validateAll(data, this.props.validation);
        if (FormUtil.isPromise(validated)) {
            (validated: any).then(validatedData => {
                this._onSubmitAfterValidation(validatedData);
            });
        } else {
            this._onSubmitAfterValidation((validated: any));
        }
    };
    _onSubmitAfterValidation = (data: any /* _FormData<V> */): void => {
        if (!FormUtil.hasErrors(data)) {
            const maybePromise = this.props.onSubmit(data.values);
            if (FormUtil.isPromise(maybePromise)) {
                (maybePromise: any).then(this._finishSubmit).catch(e => {
                    const nextData = FormUtil.setSubmitting(this.props.data, false);
                    this._onChange(nextData);
                    // pass the encountered uncatched error to onSubmitFailed
                    this._onSubmitFailed(e, nextData);
                });
            } else {
                this._finishSubmit();
            }
        } else {
            data.submitting = false;
            this._onChange(data);
            this._onSubmitFailed(undefined, data);
        }
    };
    _finishSubmit = (): void => {
        const nextData = FormUtil.setSubmitting(this.props.data, false);
        this._onChange(nextData);
        this._onSubmitFinished(nextData);
    };
    _onChange = (data: any /* _FormData<V> */): void => this.props.onChange(data);
    _onSubmitFailed = (e: any /* thrown object */, data: any /* _FormData<V> */): void =>
        this.props.onSubmitFailed && this.props.onSubmitFailed(e, data);
    _onSubmitFinished = (data: any /* _FormData<V> */): void =>
        this.props.onSubmitFinished && this.props.onSubmitFinished(data);

    componentWillUnmount = () => {
        this._onChange = NOP;
        this._onSubmitFailed = NOP;
        this._onSubmitFinished = NOP;
    };

    render(): React$Node {
        return (
            <form className={this.props.className} onSubmit={this._onSubmit}>
                {this.props.children}
            </form>
        );
    }
}

export { _Form };
