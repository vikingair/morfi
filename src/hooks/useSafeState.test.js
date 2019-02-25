// @flow

import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { useSafeState } from './useSafeState';

describe('useSafeState', () => {
    it('does suppress state updates after the component did unmount', () => {
        let state = '';
        let setState = (_: string) => {};
        const DummyComponent = () => {
            [state, setState] = useSafeState('foo');
            return null;
        };
        const wrapper = mount(<DummyComponent />);

        expect(state).toBe('foo');

        act(() => {
            setState('bar');
        });
        expect(state).toBe('bar');

        wrapper.unmount();

        act(() => {
            setState('does not matter');
        });
        expect(state).toBe('bar');
    });
});
