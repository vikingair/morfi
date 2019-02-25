/**
 * This file is part of morfi which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

type Event = { preventDefault: Function, target: { value: any } };
type EventHandler = Event => void;

type CustomInputHandling = { preventDefault?: boolean, falsyToUndefined?: boolean };

const inputHandler = (
    cb: any => mixed | void,
    { preventDefault = true, falsyToUndefined = false }: CustomInputHandling = {}
): EventHandler => {
    return event => {
        if (preventDefault) event.preventDefault();
        const original = event.target.value;
        cb(falsyToUndefined ? original || undefined : original);
    };
};

export const EventUtil = { inputHandler };
