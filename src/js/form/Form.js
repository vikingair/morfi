// @flow

import React, { Component } from 'react';
import type { _FormData, FormValidation, ValidationType } from './Form-classes';
import { FormUtil, ReactPropTypesAny } from './Form-classes';

type FormProps<V> = {
    validation: FormValidation<V>,
    data: _FormData<V>,
    children: React$Node,
    onChange: any,
    onSubmit: V => void | Promise<void>,
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

        // if the value did not change AND
        // we had already an error or our validator did not return any error
        // -> we return undefined to avoid a store update
        if (data.values[name] !== nextValue || (nextError && !data.errors[name])) {
            this.props.onChange(FormUtil.update(data, name, nextValue, nextError));
        }
    };
    fieldIsRequired = (name: $Keys<V>): boolean => {
        return FormUtil.isRequired(this.props.validation[name]);
    };

    _onSubmit = (event: SyntheticEvent<*>): void => {
        event.preventDefault();
        const validated = FormUtil.validateAll(this.props.data, this.props.validation);
        if (!FormUtil.hasErrors(validated)) {
            this.props.onSubmit(this.props.data.values);
        } else {
            this.props.onChange(validated);
        }
    };
    render(): React$Node {
        return <form onSubmit={this._onSubmit}>{this.props.children}</form>;
    }
}

export { _Form };
