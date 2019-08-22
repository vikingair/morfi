// @flow

import { mount, type ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import type { ErrorMessage } from '../../src';

type MorfiMount = {|
    instance: ReactWrapper<any>,
    unmount: () => void,
    isRequired: (name: string) => boolean,
    getValue: (name: string) => any,
    getError: (name: string) => ErrorMessage | void,
    getErrorId: (name: string) => string | void,
    getState: (name: string) => {| error: ErrorMessage | void, value: any |},
    update: (name: string, value: any) => void,
    focus: (name: string) => void,
    blur: () => void,
    submit: (cbAfterClick?: () => void) => Promise<void>,
    nextTick: () => Promise<void>,
|};

export const morfiMount = (node: React$Element<any>): MorfiMount => {
    const instance: ReactWrapper<any> = mount(node);

    let lastFocus: string | void = undefined;
    const blur = () => {
        if (lastFocus) {
            act(() => {
                const fieldProps = getField(instance, (lastFocus: any)).props();
                fieldProps.onBlur && fieldProps.onBlur(fieldProps.value);
                lastFocus = undefined;
            });
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
            act(() => {
                getField(instance, name)
                    .props()
                    .onChange(value);
            });
            lastFocus = name;
            instance.update();
        },
        focus: (name: string): void => {
            if (lastFocus !== name) blur();
            lastFocus = name;
        },
        blur,
        submit: async (cbAfterClick?: () => void): Promise<void> => {
            blur();
            const p = act(async () => {
                getForm(instance)
                    .props()
                    .onSubmit({ preventDefault: () => {} });
            });
            instance.update();
            cbAfterClick && cbAfterClick();
            await p;
            instance.update();
        },
        nextTick: async (): Promise<void> => {
            await act(async () => {
                await new Promise(resolve => (process: any).nextTick(resolve));
            });
            instance.update();
        },
    };
};

const getField = (instance: any, name: string) => {
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
