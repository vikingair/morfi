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

type FieldSpec = {
    name: string,
    component: any,
    required?: boolean,
};

const _makeTestData = (fieldSpecs: FieldSpec[]): Object => {
    const result = { values: {}, errors: {} };
    for (let key = 0; key < fieldSpecs.length; key++) {
        const name = fieldSpecs[key].name;
        result.values[name] = 'test.value.' + name;
        result.errors[name] = { id: 'test.error.' + name };
    }
    return result;
};

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

const NOP = () => {};

const _findTypeFromField = (fieldWrapper: ReactWrapper): any => {
    return fieldWrapper.props().children({ onChange: NOP, onBlur: NOP, required: false }).type;
};

const _validateFieldSpecs = (fieldSpecs: FieldSpec[]): void => {
    const names = [];
    for (let key = 0; key < fieldSpecs.length; key++) {
        const name = fieldSpecs[key].name;
        if (names.indexOf(name) === -1) {
            names.push(name);
        } else {
            throw new Error(
                `Each field should have a different name. You specified the name "${name}" more than once.`
            );
        }
    }
};

// first version of the upcoming test util
export class FormWrapper {
    +_mounted: ReactWrapper;
    focused: { name: string, component: any } | void;

    constructor(nodes: React$Node) {
        this._mounted = mount(nodes);
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
        const { name, component } = this.focused;
        const field = this.find(name);
        if (!field) {
            return this;
        }
        const comp = field.find(component);
        if (comp.length !== 1) {
            throw new Error('Did not find exactly one component for field with name: ' + name);
        }
        const props = comp.props();
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

    lookAt = (name: string): FormWrapper => {
        this.blur();
        const field = this.find(name);
        if (!field) {
            throw new Error(`Field with name ${name} does not exist.`);
        }
        const component = _findTypeFromField(field);
        const comp = field.find(component);
        if (comp.length !== 1) {
            throw new Error('Did not find exactly one component for field with name: ' + name);
        }
        this.focused = { name, component };
        return this;
    };

    find = (name: string): ReactWrapper | void => {
        return _findWithin(this._mounted.find(Field), name);
    };

    validate = (
        location?: { base: 'state' | 'props', name: string } = {
            base: 'state',
            name: 'data',
        },
        ...fieldSpecs: FieldSpec[]
    ): FormWrapper => {
        _validateFieldSpecs(fieldSpecs);
        const data = _makeTestData(fieldSpecs);
        const oldData =
            location.base === 'state' ? this._mounted.state()[location.name] : this._mounted.props()[location.name];
        location.base === 'state'
            ? this._mounted.setState({ [location.name]: data })
            : this._mounted.setProps({ [location.name]: data });
        const fields = this._mounted.find(Field);
        if (fieldSpecs.length !== fields.length) {
            throw new Error('Not all found fields where specified.');
        }
        for (let key = 0; key < fieldSpecs.length; key++) {
            const fieldSpec = fieldSpecs[key];
            const name = fieldSpec.name;
            const field = _findWithin(fields, name);
            if (!field) {
                throw new Error(`Field with name "${name}" could not be found.`);
            }
            const component = field.find(fieldSpec.component);
            if (component.length !== 1) {
                throw new Error('Did not find exactly one component for field with name: ' + name);
            }
            const props = component.props();
            expect(props.value).toBe(data.values[name]);
            expect(props.error).toEqual(data.errors[name]);
            if (fieldSpec.required !== undefined) {
                expect(props.required).toBe(fieldSpec.required);
            }
        }
        location.base === 'state'
            ? this._mounted.setState({ [location.name]: oldData })
            : this._mounted.setProps({ [location.name]: oldData });
        return this;
    };

    change = (value: string | boolean | number): FormWrapper => {
        if (!this.focused) {
            throw new Error('No field was focused');
        }
        const { name, component } = this.focused;
        const field = this.find(name);
        if (!field) {
            throw new Error('Focused field does not exist anymore');
        }
        const comp = field.find(component);
        if (comp.length !== 1) {
            throw new Error('Did not find exactly one component for field with name: ' + name);
        }
        comp.props().onChange(value);
        this._mounted.update();
        return this;
    };

    valueIs = (value: any): FormWrapper => {
        if (!this.focused) {
            throw new Error('No field was focused');
        }
        const { name, component } = this.focused;
        const field = this.find(name);
        if (!field) {
            throw new Error('Focused field does not exist anymore');
        }
        const comp = field.find(component);
        if (comp.length !== 1) {
            throw new Error('Did not find exactly one component for field with name: ' + name);
        }
        const props = comp.props();
        expect(props.value).toEqual(value);
        return this;
    };

    errorIs = (error: ErrorMessage | void): FormWrapper => {
        if (!this.focused) {
            throw new Error('No field was focused');
        }
        const { name, component } = this.focused;
        const field = this.find(name);
        if (!field) {
            throw new Error('Focused field does not exist anymore');
        }
        const comp = field.find(component);
        if (comp.length !== 1) {
            throw new Error('Did not find exactly one component for field with name: ' + name);
        }
        const props = comp.props();
        expect(props.error).toEqual(error);
        return this;
    };

    submit = (): FormWrapper => {
        this.blur();
        const form = this._mounted.find(Form).at(0);
        form.simulate('submit');
        return this;
    };
}
