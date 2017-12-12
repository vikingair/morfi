/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { Spy } from 'spy4js';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const oldDescribe = describe;
window.describe = (string, func) => {
    oldDescribe(string, () => {
        afterEach(() => {
            Spy.restoreAll();
        });
        return func();
    });
};
