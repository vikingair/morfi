/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import './index.css';
import './styles/css/bootstrap.min.css';
import './styles/css/bootstrap-grid.min.css';
import './styles/css/fontawesome-all.min.css';
import App from './js/App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <BrowserRouter>
        <Route component={App} />
    </BrowserRouter>,
    document.getElementById('root')
);
registerServiceWorker();
