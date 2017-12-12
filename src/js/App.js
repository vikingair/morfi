/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';
import { FormContainer } from './FormContainer';
import FirstSample from './FirstSample';

export default class App extends Component<{}> {
    render(): React$Node {
        return (
            <div className="container-fluid">
                <FormContainer>
                    <FirstSample />
                </FormContainer>
            </div>
        );
    }
}
