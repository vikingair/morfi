/**
 * This file is part of form4react which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { FormContainer } from './FormContainer';
import FirstSample from './FirstSample';
import ValidationOnChangeSample from './validation-onchange-sample';

type Sample = { pathname: string, label: string };
const Samples: Sample[] = [
    { pathname: '/', label: 'First Sample' },
    { pathname: '/validation/onchange', label: 'Validation - onChange' },
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
                    <div className="col-sm-3">{this.renderSideBar()}</div>
                    <div className="col-sm-9">
                        <FormContainer>
                            <Switch>
                                <Route path="/validation/onchange" component={ValidationOnChangeSample} />
                                <Route component={FirstSample} />
                            </Switch>
                        </FormContainer>
                    </div>
                </div>
            </div>
        );
    }
}
