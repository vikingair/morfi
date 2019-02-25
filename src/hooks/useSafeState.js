// @flow

import { useState, useRef, useEffect, useCallback } from 'react';

type UseSafeStateReturnType<T> = [T, (T) => void];

export const useSafeState = <T>(initial: T): UseSafeStateReturnType<T> => {
    const [state, setState] = useState<T>(initial);
    const mounted = useRef<boolean>(true);

    useEffect(
        () => () => {
            mounted.current = false;
        },
        []
    );

    const safeSetState = useCallback((v: T) => {
        mounted.current && setState(v);
    }, []);

    return [state, safeSetState];
};
