import { ReactElement } from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { ErrorMessage } from 'morfi';

type MorfiMount = {
    instance: ReactWrapper<any>;
    unmount: () => void;
    isRequired: (name: string) => boolean;
    getValue: (name: string) => any;
    getError: (name: string) => ErrorMessage | void;
    getErrorId: (name: string) => string | void;
    getState: (name: string) => { error: ErrorMessage | void, value: any };
    update: (name: string, value: any) => void;
    focus: (name: string) => void;
    blur: () => void;
    submit: (cbAfterClick?: () => void) => Promise<void>;
    nextTick: () => Promise<void>;
    rerender: () => void;
};
export function morfiMount(node: ReactElement): MorfiMount;