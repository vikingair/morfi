import { DependencyList, useEffect, useRef } from 'react';

type OptionalCleanUpCb = void | (() => void);
export const useChangeEffect: typeof useEffect = (create: () => OptionalCleanUpCb, deps?: DependencyList) => {
    const firstRun = useRef<boolean>(true);
    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
        } else {
            return create();
        }
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};
