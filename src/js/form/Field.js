// @flow

import React, { Component } from 'react';
import { ReactPropTypesAny, ValidationTypes } from './Form-classes';
import type { ValidationType } from './Form-classes';

type ChildrenFunc<F> = ({
    onChange: F => void,
    onBlur: F => void,
    required: boolean,
}) => React$Node;

type FieldProps<F> = {
    name: string,
    children: ChildrenFunc<F>,
};

class Field<F> extends Component<FieldProps<F>> {
    // Register here what are the accessed context properties
    // from the Form.
    // To avoid the prop-types dependency, simply ignore the check
    static contextTypes = {
        onFieldChange: ReactPropTypesAny,
        fieldIsRequired: ReactPropTypesAny,
    };

    onFieldChange = (validationType: ValidationType) => {
        return value => this.context.onFieldChange(this.props.name, value, validationType);
    };

    render(): React$Node {
        return this.props.children({
            onChange: this.onFieldChange(ValidationTypes.onChange),
            onBlur: this.onFieldChange(ValidationTypes.onBlur),
            required: this.context.fieldIsRequired(this.props.name),
        });
    }
}

export const _Field = ({ name, children }: FieldProps<*>): React$Node => <Field {...{ name }}>{children}</Field>;
