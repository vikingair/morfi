/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import React, { Component } from 'react';
import './App.css';
import { Link, Switch, Route } from 'react-router-dom';
import { FormContainer } from './FormContainer';
import FirstSample from './samples/first/FirstSample';
import { ValidationSample } from './samples/validation-types/ValidationSample';
import { AsyncValidationSample } from './samples/async/AsyncValidationSample';
import { Arrow } from './icons/Arrow';
import PasswordRepeatForm from './samples/password-repeat/PasswordRepeatForm';

type Sample = { pathname: string, label: string };
const Samples: Sample[] = [
    { pathname: '/', label: 'First sample' },
    { pathname: '/validation/types', label: 'Validation types' },
    { pathname: '/validation/async', label: 'Async validation' },
    { pathname: '/validation/passwordRepeat', label: 'Password repetition' },
];

type AppProps = { location: { pathname: string } };

export default class App extends Component<AppProps, { sideBarOpen?: boolean }> {
    state = { sideBarOpen: undefined };

    toggleSideBar = () => this.setState(state => ({ sideBarOpen: !state.sideBarOpen }));

    renderSideBar() {
        return (
            <div className="nav nav-pills row">
                <div className="nav-header">
                    <strong>Navigation</strong>
                    <div onClick={this.toggleSideBar}>
                        <Arrow direction="LEFT" />
                    </div>
                </div>
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

    componentDidUpdate = (prevProps: AppProps): void => {
        if (prevProps.location.pathname !== this.props.location.pathname) {
            this.setState({ sideBarOpen: false });
        }
    };

    render(): React$Node {
        let sideBarFadeClass = '';
        if (this.state.sideBarOpen !== undefined) {
            sideBarFadeClass = this.state.sideBarOpen ? ' fade-in' : ' fade-out';
        }
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className={`col-8 col-sm-4 app-navigation${sideBarFadeClass}`}>{this.renderSideBar()}</div>
                    <div className="col-12">
                        <FormContainer toggleSideBar={this.toggleSideBar}>
                            <Switch>
                                <Route path="/validation/types" component={ValidationSample} />
                                <Route path="/validation/async" component={AsyncValidationSample} />
                                <Route path="/validation/passwordRepeat" component={PasswordRepeatForm} />
                                <Route component={FirstSample} />
                            </Switch>
                        </FormContainer>
                    </div>
                </div>
            </div>
        );
    }
}
