/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import './styles/css/bootstrap.min.css';
import './styles/css/bootstrap-grid.min.css';
import './index.css';
import App from './js/App';
import registerServiceWorker from './registerServiceWorker';

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
registerServiceWorker();
