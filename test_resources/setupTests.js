/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { configure } from 'enzyme';
import { createSerializer } from 'enzyme-to-json';
import Adapter from 'enzyme-adapter-react-16';

(expect: any).addSnapshotSerializer(createSerializer({ mode: 'deep' }));
configure({ adapter: new Adapter() });

window.nextTick = (): Promise<void> => new Promise(resolve => process.nextTick(resolve));
window.sleep = () => Promise.resolve();

window.WEBPACK_PUBLIC_URL = '/morfi';
