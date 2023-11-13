import React from 'react';

type FormContainerProps = { children: React.ReactNode; toggleSideBar: () => void };

export const Main: React.FC<FormContainerProps> = ({ children, toggleSideBar }) => (
    <main>
        <header>
            <img
                src={`${import.meta.env.BASE_URL}images/menu.svg`}
                className="sidebar-toggle"
                alt="menu"
                onClick={toggleSideBar}
            />
            <img src={`${import.meta.env.BASE_URL}images/form-logo.svg`} className="logo" alt="logo" />
            <h1>Welcome to morfi</h1>
        </header>
        <div className={'content'}>{children}</div>
    </main>
);
