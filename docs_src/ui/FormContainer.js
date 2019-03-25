/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React from 'react';

export const FormContainer = ({ children, toggleSideBar }: { children: React$Node, toggleSideBar: void => void }) => (
    <div className="FormContainer row">
        <header className="FormContainer-header col-12">
            <img
                src={`${WEBPACK_PUBLIC_URL}/images/menu.svg`}
                className="sidebar-toggle"
                alt="menu"
                onClick={toggleSideBar}
            />
            <img src={`${WEBPACK_PUBLIC_URL}/images/form-logo.svg`} className="FormContainer-logo" alt="logo" />
            <h1 className="FormContainer-title">Welcome to morfi</h1>
        </header>
        {children}
    </div>
);
