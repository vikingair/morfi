import React, { useCallback, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Main } from './Main';
import { FirstSample } from './samples/first/FirstSample';
import { ValidationSample } from './samples/validation-types/ValidationSample';
import { AsyncValidationSample } from './samples/async/AsyncValidationSample';
import { Arrow } from './icons/Arrow';
import { useChangeEffect } from './hooks/useChangeEffect';
import { PasswordRepeatForm } from './samples/password-repeat/PasswordRepeatForm';

type Sample = { pathname: string; label: string };
const Samples: Sample[] = [
    { pathname: '/', label: 'First sample' },
    { pathname: '/validation/types', label: 'Validation types' },
    { pathname: '/validation/async', label: 'Async validation' },
    { pathname: '/validation/passwordRepeat', label: 'Password repetition' },
];

export type SidebarProps = { open?: boolean; toggle: () => void };

export const Sidebar: React.FC<SidebarProps> = ({ open, toggle }) => {
    const location = useLocation();

    useChangeEffect(() => {
        toggle();
    }, [location.pathname, toggle]);

    let sideBarFadeClass = undefined;
    if (open !== undefined) {
        sideBarFadeClass = open ? 'fade-in' : 'fade-out';
    }
    return (
        <nav className={sideBarFadeClass}>
            <header>
                <strong>Navigation</strong>
                <div onClick={toggle}>
                    <Arrow direction="LEFT" />
                </div>
            </header>
            <ul>
                {Samples.map(({ pathname, label }: Sample) => {
                    const activeClass = location.pathname === pathname ? ' active' : '';
                    return (
                        <li key={pathname}>
                            <Link className={'nav-link' + activeClass} to={pathname}>
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export const App: React.FC = () => {
    const [sideBarOpen, setSidebarOpen] = useState<boolean | undefined>();
    const toggleSideBar = useCallback(() => setSidebarOpen((s) => !s), []);

    return (
        <div className="app">
            <Sidebar open={sideBarOpen} toggle={toggleSideBar} />
            <Main toggleSideBar={toggleSideBar}>
                <Routes>
                    <Route path="/validation/types" element={<ValidationSample />} />
                    <Route path="/validation/async" element={<AsyncValidationSample />} />
                    <Route path="/validation/passwordRepeat" element={<PasswordRepeatForm />} />
                    <Route path="*" element={<FirstSample />} />
                </Routes>
            </Main>
        </div>
    );
};
