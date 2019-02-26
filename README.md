[![GitHub license][license-image]][license-url]
[![npm package][npm-image]][npm-url]
[![Travis][build-image]][build-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![styled with prettier][prettier-image]][prettier-url]

# ![morfi logo](src/form-logo.svg?sanitize=true) morfi
Abstract form handling for any purpose (1.8 kb gzipped)

### Why morfi?

I have invested a lot of time to read about and use forms from different
developers. Since I did not find the *one* solution in my year long
experience with `react`, I decided to spend some time and think about
an ideal solution.

I tried to target the following aspects. It should be a small bundle.
Leave the flexibility to the developer. Make it type safe, because I
develop only with assistance of `flow`. Support the usage of any
internationalization framework. Absolutely no dependencies, which have
to be installed additionally. High performing and very assisting.

* Optimized `flow` assistance
* No dependencies
* Small bundle size
* High performance
* Nice features
* Totally customizable
* Well documented

### Installation
##### With yarn
```
yarn add morfi
```
##### With npm
```
npm install --save morfi
```

### Introduction
Let's get a first impression...
```js
import React from 'react';
import { Morfi } from 'morfi';

type MyFormValues = {| phone: string |};

const initialValues: MyFormValues = { phone: '' };
const validation = {};

const { Form, Fields } = Morfi.create(initialValues);

const render = () => (
    <Form validation={validation}
          onChange={onChange}
          data={data}
          onSubmit={onSubmit}>
        <Fields.phone>
            {({ onChange, onBlur, required, value, error }) => (
                <div>
                    <label>{`Phone${required ? ' *' : ''}`}</label>
                    <input value={value} 
                           onChange={e => onChange(e.target.value)}
                           onBlur={e => onBlur(e.target.value)} />
                    <span className="error">{__(error)}</span>
                </div>
            )}
        </Fields.phone>
        <button type="submit">Submit</button>
    </Form>
);
```
By calling `Morfi.create` with the initial values, a `React` context will generated
and you get `Form` element together with `Fields` which itself contains different
elements for each specified initial value. ATTENTION: It is mandatory to supply all
relevant fields. Even values that will be initialized with `undefined`. Because the
keys of your initial values matter.

The `Form` element receives certain "control" props and needs to provide the current
context state to each of the `Fields`.
It expects the following props: (See below for the missing [Flow types](#flow-types))

Props              | Type                                    | Description                                                       | Example
------------------ | --------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------
`className`        | `void \ string`                         | Will be applied to the form tag                                   | `'my-form'`
`validation`       | `FormValidation<V>`                     | Contains all validators                                           | `{ name: { onChange: customValidator } }`
`data`             | `FormData<V>`                           | Contains all values, errors and submitting state                  | `{ values: { name: 'Scotty' }, errors: { name: { id: 'does.not.know' } }, submitting: false }`
`onChange`         | `(FormData<V>) => void`                 | Handles the next data after any changes have been made            |
`onSubmit`         | `V => void \ Promise<void>`             | Will be called if submitted without any failing validators        |
`onSubmitFailed`   | `void \ ((Error, FormData<V>) => void)` | Will be called if submitting was aborted due to validation errors or if your submit returned a rejected promise |
`onSubmitFinished` | `void \ ((FormData<V>) => void)`        | Will be called after submitting finished                          |

In the above example was a single value specified with the key "phone". Hence
`Fields.phone` is a element mapped to the generic type "string". It accepts only
a single child function, which receives the following:

* `value`: The current value of that field. It equals the `data.values.phone`.

* `error`: The current error message of that field. It equals the `data.errors.phone`.

* `onChange`: Receives the next value of the generic type, runs the onChange-Validator on it
and calls the `Form` - `onChange` where e.g. `data.values.phone` holds the
updated value and `data.errors.phone` will maybe hold an occurred validation error.

* `onBlur`: Same as the `onChange` but will be triggered if the input loses
the users focus and triggers the onBlur-Validator.

* `required`: A boolean which indicates if the value `undefined` for "phone"
would pass all validations on that field. If not the value is treated as
required.

The above example shows a form with a single field. 
The label shows "Phone *" if the value is required.
It will update the form data accordingly to the specified `onChange` handler
supplied to the Form.
It will display an error message below the input if any error was encountered.

### Asynchronous form field handling

To implement async form field validation, you simply have to return a promise, which
will resolve the validation result. You can write validators which are both:
**async** *AND* **sync** validator at the same time. One example:

```js
import type { Validator } from 'morfi';

const specialValidator: Validator<string> = (val?: string) => {
    if (!val) { // if value is falsy we return sync error
        return {id: 'value.required'};
    }
    return myFetch('/my/api').then(result => {
        if (result.isInvalid) { // api answered that the value was invalid
            return {id: 'value.invalid'}; // return async error
        }
    });
}
```
HINT: You should always validate the value `undefined` synchronously, because
`morfi` determines the requirements by these criteria. So if you use the comfortable
`async-await`-Syntax, you should split your validator into two parts.

### Control your submit
When the user submits the form, the following will happen:

1) The `submitting` property will be propagated as `true` to your `onChange`
2) All registered validators will be executed and their validation results will be awaited
3) When `2` returned any errors your `onChange` will be called with the found errors and `submitting` as `false` (**Early exit**)
4) When `2` returned no errors your `onSubmit` will be called
5) When `4` took place, the `submitting` property will be propagated as `false` (if your `onSubmit` returned a Promise, this will happen after this Promise resolved)

![morfi-Lifecycle](morfi-Lifecycle.png)

### Flow types

**morfi** comes with a lot of types and exports `FormData<T>`, `ErrorMessage`
and `Validator`.

In this table you get an overview of relevant types.

 Name                | Flow declaration                                                     | Information
 ------------------- | -------------------------------------------------------------------- | ---------------------
 `ErrorMessage`      | `{ id: string, values?: {[string]: mixed}}`                          | This structure allows to handle internationalization by transporting the required information like the intl key and placeholder values
 `FormData<V>`       | `$Shape<$ObjMap<V, () => ErrorMessage>>`                             | This is the main structure for the data represent the form state
 `Validator<F>`      | `(F | void) => ErrorMessage \ void \ Promise<ErrorMessage \ void>`   | The validator returns void if no error occurred or a Promise if the validation is asynchronous 
 `ValidationType`    | `'onChange' \ 'onBlur' \ 'onSubmit'`                                 | Currently only those to validation types can be specified
 `FormValidation<V>` | `$Shape<$ObjMap<V, <F>(F) => FieldValidation<F>>>`                   | For each key of the specified form values V here can be specified all validations for this field

### Example

In this chapter we will examine how a sample form could be implemented.
The [sample](https://fdc-viktor-luft.github.io/morfi/) is hosted by GitHub Pages.

We first define the types of the form values...
```js
type Gender = 'M' | 'F';
type MyFormValues = {|
    firstName: string,
    lastName: string,
    gender: Gender,
    age: number,
|};
// gender can be selected with the following available options
const genderOptions = [{ value: 'M', label: 'male' }, { value: 'F', label: 'female' }];
```
Let's initialize the form elements...
```js
const initialValues: MyFormValues = { firstName: 'Nick', lastName: '', gender: 'M', age: 21 };
const { Form, Fields } = Morfi.create(initialValues);
```
Then we define the validations... (see [here](https://github.com/fdc-viktor-luft/morfi/blob/master/src/js/validators/validators.js) for the used validators below)
```js
const validation = {
    firstName: { onChange: Validators.string({ min: 1, max: 10 }) },
    lastName: { onBlur: Validators.string({ min: 1, max: 10 }) },
    age: { onChange: Validators.number({ minLength: 1, maxLength: 3 }) },
};
```
Let's say we decide to control the form state inside our app state...
```js
type AppProps = {||};
type AppState = {| data: FormData<MyFormValues> |};
```
Now we define the first version of the app... (see [here](https://github.com/fdc-viktor-luft/morfi/tree/master/src/js/fields) for all used custom components below)
```js
import React, { Component } from 'react';
import { Morfi, type FormData } from 'morfi';

(...)

class App extends Component<AppProps, AppState> {
    // first we initialize the defaults (if we would not, flow would complain for all mandatory fields missing)
    // we could also start with initial errors, but here we don't
    state: AppState = { data: { values: initialValues, errors: {} } };

    // this handler will propagate the form changes to the state
    onChange = (data: FormData<MyFormValues>) => this.setState({ data });

    // for now we leave the submit handler empty
    onSubmit = ({ gender, firstName, lastName, age }: MyFormValues): void => {
        // do something
    };

    render(): React$Node {
        const { data } = this.state;
        return (
            <Form validation={validation} onChange={this.onChange} data={data} onSubmit={this.onSubmit}>
                <div className="row">
                    <FormInput Field={Fields.firstName} label="First name" className="form-group col-sm-6" />
                    <FormInput Field={Fields.lastName} label="Last name" className="form-group col-sm-6" />
                </div>
                <div className="row">
                    <FormSelect
                        Field={Fields.gender}
                        options={genderOptions}
                        label="Gender"
                        className="form-group col-sm-6"
                    />
                    <FormNumberInput Field={Fields.age} label="Age" className="form-group col-sm-6" />
                </div>
                <div className="btn-toolbar">
                    <button className="btn btn-secondary mr-2" type="button" onClick={this.onClear}>
                        Clear
                    </button>
                    <button className="btn btn-success" disabled={Morfi.hasErrors(data)}>
                        Submit
                    </button>
                </div>
            </Form>
        );
    }
}
```
This version does the specified validations on the fields and prevents our empty
`onSubmit` function from being called, when any validations would not succeed.

So now we add a table (see [here](https://github.com/fdc-viktor-luft/morfi/blob/master/src/js/PersonTable.js) 
for the implementation and the new type `Person`) to hold all entered person data. What changes...
```js
// the state interface
type AppState = {| data: FormData<MyFormValues>, persons: Person[] |};
```
```js
// the initial state
state: AppState = { data: { values: initialValues, errors: {} }, persons: [] };
```
```js
// we add below the form the table
<PersonTable persons={this.state.persons} />
```
```js
// we implement functionality for the onSubmit
onSubmit = ({ gender, firstName, lastName = '', age }: MyFormValues): void => {
    this.setState({
        persons: [...this.state.persons, { gender, firstName, lastName, age }],
    });
};
```
Now each time we submit the entered data which succeeds all validations, a new
person entry will be displayed in the `PersonTable`.

Finally we will add a clear button for all inputs and disable the submit button if
any errors are present. What changes...
```js
// a new function inside our App
onClear = () => {
    this.setState({ data: { values: initialValues, errors: {} } });
};
```
```js
// the submit button on the bottom of the form will be replaced by
<div className="btn-toolbar" role="toolbar">
    <button className="btn btn-secondary" type="button" onClick={this.onClear}>
        Clear
    </button>
    <button className="btn btn-primary" disabled={Morfi.hasErrors(data)}>
        Submit
    </button>
</div>
```
Now if we hit the clear button all entered values will be cleared.

### Testing

Check out [morfi-test-utils](https://www.npmjs.com/package/morfi-test-utils) to write your tests
almost as a user would test your form manually.

### FAQ
  
* Why are there no ready-to-use components exported like `FormSelect` 
  from the above examples?
  
  **morfi** is primarily made to handle updates, validations, storing of
  data, assist the developer with strict flow types and serve as a guideline for form handling.
  
  Later there might be subdirectories which you can optionally use, but most
  often in larger projects you want to have full control over all form components.


### Alternatives...

The following table includes results from [bundlephobia](https://bundlephobia.com).

Package                 | Version | Size (minified + gzipped)
------------------------|---------|--------------------------
`morfi`                 | 1.0.0   | 1.8 kB
`react-form`            | 3.5.7   | Missing Dependency Error
`redux-form`            | 8.1.0   | 26.7 kB
`react-redux-form`      | 1.16.12 | 22.5 kB
`formik`                | 1.5.1   | 12 kB
`react-final-form`      | 4.0.2   | 2.9 kB + 4.7 kB (hidden peer dependency: `final-form@4.11.1`)
`react-jsonschema-form` | 1.2.1   | 53.4 kB

The following statements represent only my personal opinion, although I did
not work a lot with the following pretty good packages.

* [**react-form**](https://github.com/react-tools/react-form): 
A lot of features, *but* a large package with less flexibility when it comes
to very individual forms. No `flow` support.

* [**redux-form**](https://github.com/erikras/redux-form): 
A lot of features, nice documented and easy to use
form handling tool, *but* it comes with the cost of a little integrative work,
the cost of big package size, forces you to hold the form data in the redux store
and to connect every form and has poor `flow` assistance. Almost the same for
[**react-redux-form**](https://github.com/davidkpiano/react-redux-form).


* [**formik**](https://github.com/jaredpalmer/formik): 
Indicates what it does better than `redux-form`, *but* is not so much better
because it uses its own pseudo store and pseudo connect-function called
`withFormik` and still is not a very small package.

* [**react-final-form**](https://github.com/final-form/react-final-form): 
A lot of features, optimized for performance,
small bundle size, totally customizable and needs no integrative work, 
*but* is not as well documented, has `peerDependecies` which you also need
to install and has no `flow` assistance.

* [**react-jsonschema-form**](https://github.com/mozilla-services/react-jsonschema-form): 
A lot of features and very nice docs, *but* a large package with less flexibility when it comes
to individual form templating. No `flow` support.

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/fdc-viktor-luft/morfi/blob/master/LICENSE
[npm-image]: https://img.shields.io/npm/v/morfi.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/morfi
[build-image]: https://img.shields.io/travis/fdc-viktor-luft/morfi/master.svg?style=flat-square
[build-url]: https://travis-ci.org/fdc-viktor-luft/morfi
[coveralls-image]: https://coveralls.io/repos/github/fdc-viktor-luft/morfi/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/fdc-viktor-luft/morfi?branch=master
[prettier-image]: https://img.shields.io/badge/styled_with-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier
