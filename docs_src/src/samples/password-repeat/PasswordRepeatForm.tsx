import React, { useCallback, useMemo, useState } from 'react';
import { Spinner } from '../../icons/Spinner';
import { FormInput } from '../../fields/FormInput';
import { Morfi, type FormData } from '../../../../src';
import { Utils } from '../../tools/Utils';

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
        <div className="col-12">
            <Form
                validation={validation}
                onChange={onChange}
                data={data}
                onSubmit={onSubmit}
                onSubmitFinished={onSubmitFinished}>
                <div className="row">
                    <FormInput
                        field={fields.password}
                        label="Password"
                        type="password"
                        className="form-group col-sm-6"
                    />
                    <FormInput
                        field={fields.repeat}
                        label="Password repetition"
                        type="password"
                        className="form-group col-sm-6"
                    />
                </div>
                <div className="btn-toolbar">
                    <button className="btn btn-success" disabled={Morfi.notSubmittable(data)}>
                        {data.isSubmitting && <Spinner />} Submit
                    </button>
                </div>
            </Form>
        </div>
    );
};
