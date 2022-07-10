import React, { useCallback, useMemo, useState } from 'react';
import { FormInput } from '../../fields/FormInput';
import { type FormData, Morfi } from 'morfi';
import { Utils } from '../../tools/Utils';
import { Button } from '../../fields/Basic';

const staticValidation = {
    password: {
        onChange: (v?: string) => {
            if (!v) return { id: 'PasswordRepeatForm.validation.password.required' };
            if (RegExp('[^0-9a-zA-Z]').test(v)) return { id: 'PasswordRepeatForm.validation.password.validChars' };
        },
        onBlur: (v?: string) => {
            if (!v || v.length < 8) return { id: 'PasswordRepeatForm.validation.password.length' };
            if (!RegExp('[^0-9]').test(v) || !RegExp('[^a-zA-Z]').test(v))
                return { id: 'PasswordRepeatForm.validation.password.mixed' };
        },
    },
};

type MyFormValues = { password: string; repeat: string };

const initialValues: MyFormValues = { password: '', repeat: '' };

export const PasswordRepeatForm: React.FC = () => {
    const [data, setData] = useState(() => Morfi.initialData(initialValues));
    const validation = useMemo(
        () => ({
            ...staticValidation,
            repeat: {
                onChange: (v?: string) => {
                    if (!v || v !== data.values.password) return { id: 'PasswordRepeatForm.validation.repeat.wrong' };
                },
            },
        }),
        [data.values.password]
    );

    const onChange = useCallback((data: FormData<MyFormValues>) => {
        setData((prevData) => {
            if (prevData.values.password !== data.values.password) {
                return { ...data, errors: { ...data.errors, repeat: undefined } };
            } else {
                return data;
            }
        });
    }, []);

    const onSubmit = useCallback(() => Utils.sleep(1000), []);

    const onSubmitFinished = useCallback(() => setData(Morfi.initialData(initialValues)), []);

    const { fields, Form } = Morfi.useForm<MyFormValues>();

    return (
        <Form
            validation={validation}
            onChange={onChange}
            data={data}
            onSubmit={onSubmit}
            onSubmitFinished={onSubmitFinished}>
            <FormInput field={fields.password} label="Password" type="password" />
            <FormInput field={fields.repeat} label="Password repetition" type="password" />
            <div className="btn-toolbar">
                <Button disabled={Morfi.notSubmittable(data)} loading={data.isSubmitting}>
                    Submit
                </Button>
            </div>
        </Form>
    );
};
