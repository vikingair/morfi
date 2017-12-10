// @flow
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
