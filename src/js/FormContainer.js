/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';
import logo from '../form-logo.svg';
import './FormContainer.css';

export const FormContainer = ({ children }: { children: React$Node }) => (
    <div className="FormContainer row">
        <header className="FormContainer-header col-12">
            <img src={logo} className="FormContainer-logo" alt="logo" />
            <h1 className="FormContainer-title">Welcome to form4react</h1>
        </header>
        {children}
    </div>
);
