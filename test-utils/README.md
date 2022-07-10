[![GitHub license][license-image]][license-url]

# morfi-test-utils

This is a test utility for [morfi](https://www.npmjs.com/package/morfi).

## Installation
```
npm i -D morfi-test-utils
```

## How-to

### Testing Forms
```tsx
import { render } from '@testing-library/react';
import { MorfiTestUtils } from 'morfi-test-utils';

// mock all fields that are used in the form
// e.g. regular named export
jest.mock('./path/to/Input', () => ({
    Input: (arg: any) => MorfiTestUtil.Field(arg),
}));
// or default export
jest.mock('./path/to/Select', () => ({
    __esModule: true,
    default: (arg: any) => MorfiTestUtil.Field(arg),
}));
// or exported on variable
jest.spyOn(FormElements, 'DatePicker').mockImplementation(MorfiTestUtil.Field);

// now test your form
it('interacts with my form', async () => {
    // mount the form
    render(<MyForm />);
    
    // update some values (already wrapped into "act")
    MorfiTestUtil.fields.userName.change('M4gic');
    
    // check for validation errors and value
    expect(MorfiTestUtil.hasErrors).toBe(true);
    expect(MorfiTestUtil.fields.userName.error).toBe('entered invalid user name');
    expect(MorfiTestUtil.getErrors()).toEqual({ userName: 'entered invalid user name' });
    
    // check more data of the field
    expect(MorfiTestUtil.fields.userName.value).toBe('M4gic');
    expect(MorfiTestUtil.fields.userName.dirty).toBe(true);
    expect(MorfiTestUtil.fields.userName.required).toBe(false);
    
    // check for the props the mocked component would be called with
    expect(MorfiTestUtil.fields.userName.props.label).toBe('Unique Username');

    // submit the form data (already wrapped into "act")
    await MorfiTestUtils.submit();
    
    // trigger the "blur" on a field (already wrapped into "act")
    MorfiTestUtil.fields.street.blur();
});

```

### Testing Fields
```tsx
import { render, fireEvent } from '@testing-library/react';
import { MorfiTestUtils } from 'morfi-test-utils';

it('uses my field', async () => {
    // prepare
    const onSubmit = jest.fn();
    const initialData = { email: '' };
    
    // render your custom field into "MorfiTestUtil.Form"
    const { container } = render(
        <MorfiTestUtil.Form onSubmit={onSubmit} initialData={initialData}>
            {(fields) => <MyFormInput field={fields.email} label="Phone number" />}
        </MorfiTestUtil.Form>
    );
    
    // make a change
    fireEvent.input(container.querySelector('input')!, { target: { value: '01234' }});
    
    // submit
    await MorfiTestUtils.submit();
    
    // check your submit has been invoked as expected
    expect(onSubmit).toHaveBeenCalledWith({ phone: '01234' });
});
```

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/fdc-viktor-luft/morfi/blob/master/LICENSE
