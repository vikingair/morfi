// @flow

import { mount } from 'enzyme';
import type { ErrorMessage } from '../../src';

export const morfiMount = (node: React$Element<any>) => {
    const instance = mount(node);

    let lastFocus = undefined;
    const blur = () => {
        if (lastFocus) {
            const fieldProps = getField(instance, lastFocus).props();
            fieldProps.onBlur && fieldProps.onBlur(fieldProps.value);
            lastFocus = undefined;
            instance.update();
        }
    };

    const getError = (name: string): ErrorMessage | void => {
        return getField(instance, name).props().error;
    };

    return {
        instance,
        unmount: () => {
            blur();
            instance.unmount();
        },
        isRequired: (name: string) => {
            return getField(instance, name).props().required;
        },
        getValue: (name: string) => {
            return getField(instance, name).props().value;
        },
        getError,
        getErrorId: (name: string): string | void => {
            const error = getError(name);
            return error ? error.id : undefined;
        },
        getState: (name: string) => {
            const { error, value } = getField(instance, name).props();
            return { error, value };
        },
        update: (name: string, value: any): void => {
            if (lastFocus !== name) blur();
            getField(instance, name)
                .props()
                .onChange(value);
            lastFocus = name;
            instance.update();
        },
        focus: (name: string): void => {
            if (lastFocus !== name) blur();
            lastFocus = name;
        },
        blur,
        submit: (): void => {
            blur();
            getForm(instance)
                .props()
                .onSubmit({ preventDefault: () => {} });
            instance.update();
        },
        nextTick: async (): Promise<void> => {
            await new Promise(resolve => (process: any).nextTick(resolve));
            instance.update();
        },
    };
};

const getField = (instance: any, name) => {
    const results = instance.find(`Field[name="${name}"]`);
    if (results.length > 1) throw new Error('Found more than one field with name: ' + name);
    if (results.length === 0) throw new Error('Found no field with name: ' + name);
    return results.at(0).childAt(0);
};

const getForm = (instance: any) => {
    const results = instance.find('Form');
    if (results.length > 1) throw new Error('Found more than one Form. This is not yet supported');
    if (results.length === 0) throw new Error('Found no Form!');
    return results.at(0).childAt(0);
};
