import { useEffect, useRef } from 'react';

type UseMountedReturnType = Readonly<{ current: boolean }>;

export const useMounted = (): UseMountedReturnType => {
    const mounted = useRef<boolean>(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    return mounted;
};
