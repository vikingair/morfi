[![GitHub license][license-image]][license-url]

# morfi-test-utils

This is a test utility for [morfi](https://www.npmjs.com/package/morfi).

### Installation
##### With yarn
```
yarn add --dev morfi-test-utils
```
##### With npm
```
npm install --save-dev morfi-test-utils
```

### How-to
Import the utility in your tests...
```js
import { morfiMount } from 'morfi-test-utils';
```
And now have a look on a list of all returned utilities and how to use them.
```js
it('interacts with my form', async () => {
    const form = morfiMount(<MyForm />);
    const { instance, nextTick, isRequired, getValue, 
            getError, getErrorId, getState, update, 
            focus, blur, submit, unmount } = form;
    
    // "instance" holds the mounted enzyme instance
    expect(instance.find('button')).toHaveLength(2);
    
    // "nextTick" will wait for all resolvable promises to be resolved
    await nextTick();
    
    // "isRequired" returns a boolean that indicates whether the 
    // specified field is required
    expect(isRequired('firstName')).toBe(false);
    
    // "getValue" returns the current value of the specified field
    expect(getValue('firstName')).toBe('Luke');
    
    // "getError" returns the current error of the specified field
    expect(getError('firstName')).toEqual({ id: 'not.acceptable' });
    
    // "getErrorId" returns the current error-id of the specified field 
    // or undefined if "getError" would return undefined
    expect(getErrorId('firstName')).toBe('not.acceptable');
    
    // "getState" returns the current value and error of the specified field
    expect(getState('firstName')).toEqual({ value: 'Luke', error: { id: 'not.acceptable' }});
    
    // "update" performs a value update for the specified field
    update('firstName', 'Mario');
    
    // "focus" lets you focus the specified field
    focus('lastName');
    
    // "blur" lets you blur the currently focused field
    blur();
    
    // "submit" lets you submit the currently entered inputs (like a user would)
    // you can even supply an optional callback that will be called directly after
    // after the click was simulated (can be necessary for concurrent actions)
    await submit();
    
    // "unmount" will unmount the enzyme instance and therefore the included form
    unmount();
});
```
### Hint
One peer dependency is `react-dom@16.9` or higher. Since all actions are already wrapped into
`act` from `react-dom/test-utils` to fully support the behaviour of React Hooks. 

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/fdc-viktor-luft/morfi/blob/master/LICENSE
