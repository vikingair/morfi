import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useMounted } from "./useMounted";

/*
 * This hook ensures that state updates that would be done
 * asynchronously will be suppressed when the component was unmounted
 * in the meanwhile.
 */

type UseSafeStateReturnType<T> = [T, Dispatch<SetStateAction<T>>];

export const useSafeState = <T>(initial: T): UseSafeStateReturnType<T> => {
  const [state, setState] = useState<T>(initial);
  const mounted = useMounted();

  const safeSetState = useCallback(
    (v: SetStateAction<T>) => {
      if (mounted.current) setState(v);
    },
    [mounted],
  );

  return [state, safeSetState];
};
