/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

// $FlowFixMe
import './assets/styles/index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { App } from './ui/App';

window.sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const root = document.getElementById('root');

if (root) {
    ReactDOM.render(
        <BrowserRouter basename="/morfi">
            <Route component={App} />
        </BrowserRouter>,
        root
    );
}
