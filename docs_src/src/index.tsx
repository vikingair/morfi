/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */

import '../assets/styles/index.scss';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

const root = createRoot(document.getElementById('root')!);

root.render(
    <React.StrictMode>
        <BrowserRouter basename="/morfi">
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
