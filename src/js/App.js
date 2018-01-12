/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';
import './App.css';
import { Link, Switch, Route } from 'react-router-dom';
import { FormContainer } from './FormContainer';
import FirstSample from './FirstSample';
import { ValidationSample } from './ValidationSample';

type Sample = { pathname: string, label: string };
const Samples: Sample[] = [
    { pathname: '/', label: 'First sample' },
    { pathname: '/validation/types', label: 'Validation types' },
];

export default class App extends Component<{ location: { pathname: string } }> {
    renderSideBar() {
        return (
            <div className="nav flex-sm-column nav-pills row">
                {Samples.map(({ pathname, label }: Sample) => {
                    const activeClass = this.props.location.pathname === pathname ? ' active' : '';
                    return (
                        <Link className={'nav-link' + activeClass} to={pathname} key={pathname}>
                            {label}
                        </Link>
                    );
                })}
            </div>
        );
    }

    render(): React$Node {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-3 col-lg-2">{this.renderSideBar()}</div>
                    <div className="col-sm-9 col-lg-10">
                        <FormContainer>
                            <Switch>
                                <Route path="/validation/types" component={ValidationSample} />
                                <Route component={FirstSample} />
                            </Switch>
                        </FormContainer>
                    </div>
                </div>
            </div>
        );
    }
}
