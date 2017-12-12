# form4react
Abstract form handling for any purpose (1 kb gzipped)

### Alternatives...

The following statements represent only my personal opinion, although I did
not work a lot with the following pretty good packages.

* [**redux-form**](https://github.com/erikras/redux-form): 
A lot of features, nice documented and easy to use
form handling tool, *but* it comes with the cost of a little integrative work,
the cost of big package size, forces you to hold the form data in the redux store
and to connect every form and has poor `flow` assistance.

* [**react-final-form**](https://github.com/final-form/react-final-form): 
A lot of features, optimized for performance,
small bundle size, totally customizable and needs no integrative work, 
*but* is not as well documented and has no `flow` assistance.

### Why form4react?

* Optimized `flow` assistance
* Small bundle size
* High performance
* Nice features (but not as much as the above packages)
* Totally customizable
* Well documented (WIP)

### Installation
##### With yarn
```
yarn add form4react
```
##### With npm
```
npm install --save form4react
```

### Example

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
It expects the following props: (See below for the [Flow types](#Flow types))

Props            | Type                        | Description                                                | Example
---------------- | --------------------------- | ---------------------------------------------------------- | ------------------------------------------                                                 
`validation`     | `FormValidation<V>`         | Contains all validators                                    | `{ name: { onChange: customValidator } }`                     
`data`           | `FormData<V>`               | Contains all values and errors                             | `{ values: { name: 'Scotty' }, errors: { name: { id: 'does.not.know' } } }`                     
`onChange`       | `(_FormData<V>) => void`    | Handles the next data after any changes have been made     | `{ values: { name: 'Scotty' }, errors: { name: { id: 'does.not.know' } } }`                     
`onSubmit`       | `V => void \ Promise<void>` | Will be called if submitted without any failing validators | `{ values: { name: 'Scotty' }, errors: { name: { id: 'does.not.know' } } }`                     

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
would surpass all validations on that field. If not the value is treated as
required.

The above example shows a `Form` with a single `Field`. 
The label shows "Phone*" if the value is required.
It will update the form data accordingly to the specified `onChange` handler
supplied to the Form.
It will display an error message below the input if any error is encountered.

### Flow types

**form4react** comes with a lot of types and exports `FormData<T>`, `ErrorMessage`
and `Validator`.

In this table you get an overview of relevant types.

 Name                | Flow declaration                                              | Information
 ------------------- | ------------------------------------------------------------- | ---------------------
 `ErrorMessage`      | `{ id: string, values?: {[string]: mixed}}`                   | This structure allows to handle internationalization by transporting the required information like the intl key and placeholder values
 `FormData<V>`       | `{ values: V, errors: { [$Keys<V>]: void \ _ErrorMessage } }` | This is the main structure for the data represent the form state
 `Validator`         | `any => ErrorMessage \ void`                                  | The validator returns void if no error occurred
 `ValidationType`    | `'onChange' \ 'onBlur'`                                       | Currently only those to validation types can be specified
 `FormValidation<V>` | `{ [$Keys<V>]: { [ValidationType]: _Validator \ void } }`     | For each key of the specified form values V here can be specified all validations for this field

### More to come...
