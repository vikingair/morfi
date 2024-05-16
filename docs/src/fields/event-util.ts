import React from "react";

type CustomInputHandling = {
  preventDefault?: boolean;
  falsyToUndefined?: boolean;
};

const inputHandler =
  (
    cb: (arg: any) => any,
    {
      preventDefault = true,
      falsyToUndefined = false,
    }: CustomInputHandling = {},
  ): React.EventHandler<any> =>
  (event) => {
    if (preventDefault) event.preventDefault();
    const original = event.target.value;
    cb(falsyToUndefined ? original || undefined : original);
  };

export const EventUtil = { inputHandler };
