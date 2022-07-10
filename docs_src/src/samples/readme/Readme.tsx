import React, { useCallback, useState } from 'react';
import { FormData, FormField, Morfi } from 'morfi';

type User = { ID: string; name: string };
type UserPickerProps = { users: User[]; userID?: string; onPick: (user: User) => void };

const UserPicker: React.FC<UserPickerProps> = ({ users, userID, onPick }) => (
    <ul>
        {users.map((user) => (
            <li
                key={user.ID}
                className={userID === user.ID ? 'active' : undefined}
                role="button"
                onClick={() => onPick(user)}>
                {user.name}
            </li>
        ))}
    </ul>
);

type FormUserPickerProps = { field: FormField<string | undefined>; users: User[] };

const FormUserPicker: React.FC<FormUserPickerProps> = ({ users, field }) => {
    const { value, onChange } = Morfi.useField(field);
    const onPick = useCallback((user: User) => onChange(user.ID), [onChange]);

    return <UserPicker users={users} userID={value} onPick={onPick} />;
};

type FormValues = { userID?: string };
type MyFormProps = { users: User[]; onSubmit: (values: FormValues) => Promise<void> };

export const MyForm: React.FC<MyFormProps> = ({ users, onSubmit }) => {
    const { Form, fields } = Morfi.useForm<FormValues>();
    const [data, setData] = useState<FormData<FormValues>>(Morfi.initialData({}));

    return (
        <Form onSubmit={onSubmit} data={data} onChange={setData}>
            <FormUserPicker users={users} field={fields.userID} />
        </Form>
    );
};
