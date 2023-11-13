import { DependencyList, useEffect, useRef } from 'react';

// React strict mode calls all effects twice, so we need this helper
// see: https://github.com/streamich/react-use/blob/master/src/useFirstMountState.ts
export const useFirstMountState = (): boolean => {
    const isFirst = useRef(true);

    if (isFirst.current) {
        isFirst.current = false;
        return true;
    }

    return isFirst.current;
};

type OptionalCleanUpCb = void | (() => void);
export const useChangeEffect: typeof useEffect = (effect: () => OptionalCleanUpCb, deps?: DependencyList) => {
    const isFirst = useFirstMountState();

    useEffect(() => {
        if (!isFirst) {
            return effect();
        }
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};
