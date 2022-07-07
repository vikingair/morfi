import React, { useCallback, useState } from 'react';
import { Validators } from '../../validators/validators';
import { Morfi } from '../../../../src';
import { type Gender, type Person, PersonTable } from './PersonTable';
import { FormSelect, type SelectOption } from '../../fields/FormSelect';
import { FormNumberInput } from '../../fields/FormNumberInput';
import { FormInput } from '../../fields/FormInput';

type MyFormValues = {
    firstName: string;
    lastName: string;
    gender: Gender;
    age: number;
};

const initialValues: MyFormValues = { firstName: 'Nick', lastName: '', gender: 'M', age: 21 };

const validation = {
    firstName: { onChange: Validators.string({ min: 1, max: 10 }) },
    lastName: { onBlur: Validators.string({ min: 1, max: 10 }) },
    age: { onChange: Validators.number({ minLength: 1, maxLength: 3 }) },
};

const genderOptions: SelectOption<Gender>[] = [
    { value: 'M', label: 'male' },
    { value: 'F', label: 'female' },
];

export const FirstSample: React.FC = () => {
    const [data, setData] = useState(() => Morfi.initialData(initialValues));
    const [persons, setPersons] = useState<Person[]>([]);

    const onSubmit = useCallback(({ firstName, lastName, gender, age }: MyFormValues): void => {
        setPersons((persons) => [...persons, { gender, firstName, lastName, age }]);
    }, []);

    const onClear = useCallback(() => {
        setData(Morfi.initialData({ ...initialValues, firstName: '' }));
    }, []);

    const { Form, fields } = Morfi.useForm<MyFormValues>();

    return (
        <div className="col-12">
            <Form validation={validation} onChange={setData} data={data} onSubmit={onSubmit}>
                <div className="row">
                    <FormInput field={fields.firstName} label="First name" className="form-group col-sm-6" />
                    <FormInput field={fields.lastName} label="Last name" className="form-group col-sm-6" />
                </div>
                <div className="row">
                    <FormSelect
                        field={fields.gender}
                        options={genderOptions}
                        label="Gender"
                        className="form-group col-sm-6"
                    />
                    <FormNumberInput field={fields.age} label="Age" className="form-group col-sm-6" />
                </div>
                <div className="btn-toolbar">
                    <button className="btn btn-secondary mr-2" type="button" onClick={onClear}>
                        Clear
                    </button>
                    <button className="btn btn-success" disabled={Morfi.notSubmittable(data)}>
                        Submit
                    </button>
                </div>
            </Form>
            <div className="mt-4">
                <PersonTable persons={persons} />
            </div>
        </div>
    );
};
