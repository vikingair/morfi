[![GitHub license][license-image]][license-url]
[![npm package][npm-image]][npm-url]
[![Travis][build-image]][build-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![styled with prettier][prettier-image]][prettier-url]

# ![form4react logo](src/form-logo.svg) form4react
Abstract form handling for any purpose (< 2 kb gzipped)

### Why form4react?

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
yarn add form4react
```
##### With npm
```
npm install --save form4react
```

### Introduction

First take a look at the outer form element.
```js
import { Form } from 'form4react';

const render = () => (
    <Form validation={validation}
          onChange={onChange}
          data={data}
          onSubmit={onSubmit}>
       {/* form content */}
    </Form>
);
```
It expects the following props: (See below for the missing [Flow types](#flow-types))

Props              | Type                        | Description                                                       | Example
------------------ | --------------------------- | ----------------------------------------------------------------- | ------------------------------------------                                                 
`className`        | `string`                    | Will be applied to the form tag                                   | `'my-form'`                     
`validation`       | `FormValidation<V>`         | Contains all validators                                           | `{ name: { onChange: customValidator } }`                     
`data`             | `FormData<V>`               | Contains all values, errors and submitting state                  | `{ values: { name: 'Scotty' }, errors: { name: { id: 'does.not.know' } }, submitting: false }`                     
`onChange`         | `(FormData<V>) => void`     | Handles the next data after any changes have been made            |                     
`onSubmit`         | `V => void \ Promise<void>` | Will be called if submitted without any failing validators        |                    
`onSubmitFailed`   | `void \ (void => void)`     | Will be called if submitting was aborted due to validation errors |                    
`onSubmitFinished` | `void \ (void => void)`     | Will be called if after submitting finished                       |                    

Now lets take a look on a single integrated form element:

```js
import { Form, Field } from 'form4react';

const render = () => (
    <Form validation={validation}
          onChange={onChange}
          data={data}
          onSubmit={onSubmit}>
        <Field name="phone" >
            {({ onChange, onBlur, required }) => (
                <div>
                    <label>{'Phone' + required ? '*' : ''}</label>
                    <input value={data.values.phone} onChange={onChange} onBlur={onBlur} />
                    <span className="error">{__(data.errors.phone)}</span>
                </div>
            )}
        </Field>
    </Form>
);
```

By using the `Field` which excepts only *one* property `name` of type string,
the rendered children get access to the three attributes:

* `onChange`: Receives the next value, runs the onChange-Validator on it
and calls the `Form` - `onChange` where the `data.values.phone` holds the
updated value and `data.errors.phone` will maybe hold an occurred validation error.

* `onBlur`: Same as the `onChange` but will be triggered if the input loses
the users focus.

* `required`: A boolean which indicates if the value `undefined` for "phone"
would pass all validations on that field. If not the value is treated as
required.

The above example shows a `Form` with a single `Field`. 
The label shows "Phone*" if the value is required.
It will update the form data accordingly to the specified `onChange` handler
supplied to the Form.
It will display an error message below the input if any error is encountered.

### Asynchronous form field handling

To implement async form field validation, you simply have to return a promise, which
will resolve the validation result. You can write validators which are both:
**async** *AND* **sync** validator at the same time. One example:

```js
const specialValidator = (val: any) => {
    if (!val) { // if value is falsy we return sync error
        return {id: 'value.required'};
    }
    if (typeof val !== 'number') { // only check non numbers
        return myFetch('/my/api').then(result => {
            if (result.isInvalid) { // api answered that the value was invalid
                return {id: 'value.invalid'}; // return async error
            }
        })
    }
}
```
HINT: You should always validate the value `undefined` synchronously, because
`form4react` determines the requirements by these criteria. So if you use the preferable
`async-await`-Syntax, you should split your validator into to parts.

### Control your submit
When the user submits the form, the following will happen:

1) The `submitting` property will be propagated as `true` to your `onChange`
2) All registered validators will be executed and their validation results will be awaited
3) When `2` returned any errors your `onChange` will be called with the found errors and `submitting` as `false` (**Early exit**)
4) When `2` returned no errors your `onSubmit` will be called
5) When `4` took place, the `submitting` property will be propagated as `false` (if your `onSubmit` returned a Promise, this will happen after this Promise resolved)

### Flow types

**form4react** comes with a lot of types and exports `FormData<T>`, `ErrorMessage`
and `Validator`.

In this table you get an overview of relevant types.

 Name                | Flow declaration                                              | Information
 ------------------- | ------------------------------------------------------------- | ---------------------
 `ErrorMessage`      | `{ id: string, values?: {[string]: mixed}}`                   | This structure allows to handle internationalization by transporting the required information like the intl key and placeholder values
 `FormData<V>`       | `{ values: V, errors: { [$Keys<V>]: void \ ErrorMessage } }`  | This is the main structure for the data represent the form state
 `Validator`         | `any => ErrorMessage \ void \ Promise<ErrorMessage \ void>`   | The validator returns void if no error occurred or a Promise if the validation is asynchronous 
 `ValidationType`    | `'onChange' \ 'onBlur' \ 'onSubmit'`                          | Currently only those to validation types can be specified
 `FormValidation<V>` | `{ [$Keys<V>]: { [ValidationType]: Validator \ void } }`      | For each key of the specified form values V here can be specified all validations for this field

### Example

In this chapter we will examine how a sample form could be implemented.
The [sample](https://fdc-viktor-luft.github.io/form4react/) is hosted be GitHub Pages.

We first define the types of the form values...
```js
type MyFormValues = {
    gender: string,
    firstName: string,
    lastName?: string,
    age: number,
};
// gender can be selected with the following available options
const genderOptions = [{ value: 'M', label: 'male' }, { value: 'F', label: 'female' }];
```
Then we define the validations... (see [here](https://github.com/fdc-viktor-luft/form4react/blob/master/src/js/validators/validators.js) for the used validators below)
```js
const validation = {
    firstName: { onChange: Validators.string({ min: 1, max: 10 }) },
    lastName: { onBlur: Validators.string({ min: 1, max: 10 }) },
    age: { onChange: Validators.number({ minLength: 1, maxLength: 3 }) },
};
```
Let's say we decide to control the form state inside our app state...
```js
type AppState = { data: FormData<MyFormValues> };
```
Now we define the first version of the app... (see [here](https://github.com/fdc-viktor-luft/form4react/tree/master/src/js/fields) for all used custom components below)
```js
import React, { Component } from 'react';
import { Form } from 'form4react';
import type { FormData } from 'form4react';

class App extends Component<{}, AppState> {
    // first we initialize the defaults (if we would not, flow would complain for all mandatory fields missing)
    // we could also start with initial errors, but here we don't
    state: AppState = { data: { values: { gender: 'M', firstName: 'Nick', age: 21 }, errors: {} } };

    // this handler will propagate the form changes to the state
    onChange = (data: FormData<MyFormValues>) => this.setState({ data });

    // for now we leave the submit handler empty
    onSubmit = ({ gender, firstName, lastName, age }: MyFormValues): void => {
        // do nothing
    };

    render(): React$Node {
        const data = this.state.data;
        const { values, errors } = data;
        return (
            <Form validation={validation} onChange={this.onChange} data={data} onSubmit={this.onSubmit}>
                <div className="row">
                    <FormInput
                        name="firstName"
                        value={values.firstName}
                        error={errors.firstName}
                        label="First name"
                        className="form-group col-sm-6"
                    />
                    <FormInput
                        name="lastName"
                        value={values.lastName}
                        error={errors.lastName}
                        label="Last name"
                        className="form-group col-sm-6"
                    />
                </div>
                <div className="row">
                    <FormSelect
                        name="gender"
                        value={values.gender}
                        error={errors.gender}
                        options={genderOptions}
                        label="Gender"
                        className="form-group col-sm-6"
                    />
                    <FormNumberInput
                        name="age"
                        value={values.age}
                        error={errors.age}
                        label="Age"
                        className="form-group col-sm-6"
                    />
                </div>
                <button className="btn btn-primary">Submit</button>
            </Form>
        );
    }
}
```
This version does the specified validations on the fields and prevents our empty
`onSubmit` function from being called, when any validations would not succeed

So now we add a table (see [here](https://github.com/fdc-viktor-luft/form4react/blob/master/src/js/PersonTable.js) 
for the implementation and the new type `Person`) to hold all entered person data. What changes...
```js
// the state interface
type AppState = {
    data: FormData<MyFormValues>,
    persons: Person[],
};
```
```js
// the initial state
state: AppState = { data: { values: { gender: 'M', firstName: 'Nick', age: 21 }, errors: {} }, persons: [] };
```
```js
// we add below the form the table
<PersonTable persons={this.state.persons} />
```
```js
// we implement functionality for the onSubmit
onSubmit = ({ gender, firstName, lastName = '', age }: MyFormValues): void => {
    this.setState({
        persons: [...this.state.persons, { gender: gender === 'M' ? 'M' : 'F', firstName, lastName, age }],
    });
};
```
Now each time we submit the entered data which succeeds all validations, a new
person entry will be displayed in the `PersonTable`.

Finally we will add a clear button for all inputs. What changes...
```js
// a new function inside our App
onClear = () => {
    this.setState({ data: { values: { gender: 'M', firstName: '', age: 0 }, errors: {} } });
};
```
```js
// the submit button on the bottom of the form will be replaced by
<div className="btn-toolbar" role="toolbar">
    <button className="btn btn-secondary" type="button" onClick={this.onClear}>
        Clear
    </button>
    <button className="btn btn-primary" disabled={Form.hasErrors(data)}>
        Submit
    </button>
</div>
```
Now if we hit the clear button all entered values will be cleared.

### FAQ
  
* Why are there no ready-to-use components exported like `FormSelect` 
  from the above examples?
  
  **form4react** is primarily made to handle updates, validations, storing of
  data, save the developer by good flow assistance and as a guideline for form handling
  
  Later there might be subdirectories which you can optionally use, but most
  often in larger projects you want to have full control over all form components.


### Alternatives...

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
[license-url]: https://github.com/fdc-viktor-luft/form4react/blob/master/LICENSE
[npm-image]: https://img.shields.io/npm/v/form4react.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/form4react
[build-image]: https://img.shields.io/travis/fdc-viktor-luft/form4react/master.svg?style=flat-square
[build-url]: https://travis-ci.org/fdc-viktor-luft/form4react
[coveralls-image]: https://coveralls.io/repos/github/fdc-viktor-luft/form4react/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/fdc-viktor-luft/form4react?branch=master
[prettier-image]: https://img.shields.io/badge/styled_with-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier
