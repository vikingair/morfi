# Migration Guide
You can find here tips for migrating breaking changes.

## 2.0.0
Breaking changes:
- Dropped `flow` support.
- Requires at least `react@16.8.0` to work.
- Instead of invoking `Morfi.create(initialValues)` you call the hook `Morfi.useForm<MyFormValues>()` to receive the `Form` component
  and the `fields` object, which is completely new designed.
- The `fields` object contains arbitrary deeply nested values containing information about the field, which
  can be accessed via `Morfi.useField(fields.myData)`.
- The `FormData<T>` changed now to include some additional properties and was renamed to `MorfiData<T>` to avoid name collisions with the native type. 
  - `dirty` -> A map of all dirty form elements.
  - `isDirty` -> Boolean, which is true, when any field is dirty.
  - `hasErrors` -> Boolean, which is true, when any field has an error.
- `Morfi.hasErrors(data)` -> `data.hasErrors`
- New: `Morfi.initialData(values)` -> Returns a pre-filled `MorfiData<typeof values>` object.
- New: `Morfi.notSubmittable(data)` -> A form is considered submittable, if it is dirty, has no errors and is not currently being submitted
- New: `Morfi.clearErrors(data, fields.myField)` -> Returns data with cleared error on field `myField`. 
  Using `fields` itself will clear all errors.
- New: `Morfi.useClearErrors(fields.myField)` -> Returns a callback. Useful for fields to clear their own error.

Before:
```tsx
import React from 'react';
import { Morfi, type FormData } from 'morfi';
 // this can be replaced by any intl framework of your choice
import { myOwnIntlFramework } from 'my-own-intl-framwwork';

// first define your form value types
type MyFormValues = { phone: string };

const initialValues: MyFormValues = { phone: '' };
const initialData: FormData<MyFormValues> = { values: initialValues, errors: {} };

// initialize the used components
const { Form, Fields } = Morfi.create(initialValues);

// you can initialize the submit callback outside of the component
// if it does not depend on further component state
const onSubmit = (values: MyFormValues) => console.log(values);

const MyForm = () => {
    const [data, setData] = React.useState<FormData<MyFormValues>>(initialData);
    
    return (
        <Form 
          validation={{}}
          onChange={setData}
          data={data}
          onSubmit={onSubmit}>
            <Fields.phone>
                {({ onChange, onBlur, required, value, error }) => (
                    <div>
                        <label>{`Phone${required ? ' *' : ''}`}</label>
                        <input value={value} 
                               onChange={e => onChange(e.target.value)}
                               onBlur={e => onBlur(e.target.value)} />
                        <span className="error">{myOwnIntlFramework(error)}</span>
                    </div>
                )}
            </Fields.phone>
            <button type="submit">Submit</button>
        </Form>
    );
}
```
Now:
```tsx
import React from 'react';
import { Morfi, type FormField } from 'morfi';

type FormInputProps = { field: FormField<string>; label: string }

// Has to be an extra component as you need to use the hook "Morfi.useField" which works
// only inside the "Form" component.
const FormInput: React.FC<FormInputProps> = ({ field, label }) => {
    const { onChange, onBlur, required, value, error } = Morfi.useField(field);
    
    return (
        <div>
            <label>{`${label}${required ? ' *' : ''}`}</label>
            <input value={value}
                   onChange={e => onChange(e.target.value)}
                   onBlur={onBlur} />
            <span className="error">{typeof error === 'string' ? error : error.id}</span>
        </div>
    );
}; 

// first define your form value types
type MyFormValues = { phone: string };

const initialValues: MyFormValues = { phone: '' };

// you can initialize the submit callback outside of the component
// if it does not depend on further component state
const onSubmit = (values: MyFormValues) => console.log(values);

const MyForm = () => {
    const [data, setData] = React.useState(() => Morfi.initialData(initialValues));
    const { Form, fields } = Morfi.useForm<MyFormValues>();

    return (
        <Form 
          onChange={setData}
          data={data}
          onSubmit={onSubmit}>
            <FormInput label="Phone" field={fields.phone} />
            <button type="submit">Submit</button>
        </Form>
    );
}
```
