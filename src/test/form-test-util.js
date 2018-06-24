/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { Form, Field } from '../js/form';
import { mount } from 'enzyme';
import type { ReactWrapper } from 'enzyme';
import type { ErrorMessage } from '../js/form';

const _findWithin = (fields: ReactWrapper, name: string): ReactWrapper | void => {
    const found = [];
    for (let index = 0; index < fields.length; index++) {
        const field = fields.at(index);
        if (field.props().name === name) {
            found.push(field);
        }
    }
    if (found.length !== 1) {
        throw new Error('Did not find exactly one field with name: ' + name);
    }
    return found[0];
};

class FormWrapper {
    +_mounted: ReactWrapper;
    focused: string | void;

    constructor(node: React$Node) {
        this._mounted = mount(node);
        const forms = this._mounted.find(Form);
        if (forms.length !== 1) {
            throw new Error('Did not find exactly one form.');
        }
        const fields = this._mounted.find(Field);
        if (fields.length === 0) {
            throw new Error('There were no fields within the form.');
        }
        if (forms.at(0).find(Field).length !== fields.length) {
            throw new Error('Found fields outside the form.');
        }
    }

    // Sometimes you want to modify the state or perform other actions
    mounted = (): ReactWrapper => this._mounted;

    blur = (): FormWrapper => {
        if (!this.focused) {
            return this;
        }
        const field = this.find(this.focused);
        const props = field.props();
        const currentValue = props.value;
        if (props.onBlur) {
            props.onBlur(currentValue);
            this._mounted.update();
        }
        return this;
    };

    nextTick = async () => {
        await new Promise(resolve => process.nextTick(resolve));
        this._mounted.update();
    };

    focus = (name: string): FormWrapper => {
        if (this.focused !== name) {
            this.blur();
            this.find(name);
            this.focused = name;
        }
        return this;
    };

    find = (name: string): ReactWrapper => {
        const field = _findWithin(this._mounted.find(Field), name);
        if (!field) {
            throw new Error(`Field "${name}" does not exist`);
        }
        return field.childAt(0).childAt(0);
    };

    change = (name: string, value: string | boolean | number): FormWrapper => {
        this.focus(name);
        const field = this.find(name);
        field.props().onChange(value);
        this._mounted.update();
        return this;
    };

    _assume = (obj: { [string]: any }, check: (field: ReactWrapper, v: any, k: string) => void): FormWrapper => {
        Object.keys(obj).forEach(key => check(this.find(key), obj[key], key));
        return this;
    };

    assumeValues = (values: { [string]: any }): FormWrapper =>
        this._assume(values, (comp, value) => {
            const found = comp.props().value;
            expect(found).toEqual(value);
        });
    assumeErrors = (errors: { [string]: ErrorMessage | void }): FormWrapper =>
        this._assume(errors, (comp, error) => {
            const found = comp.props().error;
            expect(found).toEqual(error);
        });
    assumeRequired = (requiredFields: { [string]: boolean }): FormWrapper =>
        this._assume(requiredFields, (comp, required, key) => {
            const found = comp.props().required;
            if (found !== required) throw new Error(`Expected field ${key} to be ${required ? '' : 'not '}required.`);
        });
    assume = (data: {
        values?: { [string]: any },
        errors?: { [string]: ErrorMessage | void },
        required?: { [string]: boolean },
    }): FormWrapper => {
        const { values, errors, required } = data;
        if (values) this.assumeValues(values);
        if (errors) this.assumeErrors(errors);
        if (required) this.assumeRequired(required);
        return this;
    };

    submit = (): FormWrapper => {
        this.blur();
        const form = this._mounted.find(Form).at(0);
        form.simulate('submit');
        return this;
    };
}

export const mountForm = (node: React$Node) => new FormWrapper(node);
