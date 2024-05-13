import React, { useCallback, useState } from 'react';
import { Validators } from '../../validators/validators';
import { Morfi, type FormValidation } from 'morfi';
import { type Gender, type Person, PersonTable } from './PersonTable';
import { FormSelect, type SelectOption } from '../../fields/FormSelect';
import { FormNumberInput } from '../../fields/FormNumberInput';
import { FormInput } from '../../fields/FormInput';
import { Button } from '../../fields/Basic';

type MyFormValues = {
    firstName: string;
    lastName: string;
    gender: Gender;
    age?: number;
};

const initialValues: MyFormValues = { firstName: 'Nick', lastName: '', gender: 'M', age: 21 };

const validation: FormValidation<MyFormValues> = {
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
        setPersons((persons) => [...persons, { gender, firstName, lastName, age: age! }]);
    }, []);

    const onClear = useCallback(() => {
        setData(Morfi.initialData({ ...initialValues, firstName: '' }));
    }, []);

    const { Form, fields } = Morfi.useForm<MyFormValues>();

    return (
        <>
            <Form validation={validation} onChange={setData} data={data} onSubmit={onSubmit} version={persons.length}>
                <FormInput field={fields.firstName} label="First name" />
                <FormInput field={fields.lastName} label="Last name" />
                <FormSelect field={fields.gender} options={genderOptions} label="Gender" />
                <FormNumberInput field={fields.age} label="Age" />
                <div className="btn-toolbar">
                    <Button type="button" onClick={onClear}>
                        Clear
                    </Button>
                    <Button disabled={Morfi.notSubmittable(data)}>Submit</Button>
                </div>
            </Form>
            <PersonTable persons={persons} />
        </>
    );
};
