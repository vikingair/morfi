import React, { useCallback, useEffect, useState } from 'react';
import { ErrorMessage, FormField, FormFields, FormProps, Morfi } from 'morfi';
import { fireEvent, act } from '@testing-library/react';

type FieldData = {
    props: Record<string, any>;
    error?: ErrorMessage;
    dirty: boolean;
    value: any;
    required: boolean;
    change: (v: any) => void;
    blur: () => void;
};
type FieldsData = Record<string, FieldData>;

const clearFields = () => {
    MorfiTestUtils.fields = {};
};

const Field: React.FC<Record<string, any> & { field: FormField<any> }> = (props) => {
    const { field } = props;
    const { onChange, error, dirty, value, required, onBlur, name } = Morfi.useField(field);

    const change = useCallback(
        (v: any) => {
            act(() => {
                onChange(v);
            });
        },
        [onChange]
    );
    const blur = useCallback(() => {
        act(() => {
            onBlur();
        });
    }, [onBlur]);

    MorfiTestUtils.fields[name] = {
        props,
        error,
        dirty,
        value,
        required,
        change,
        blur,
    };

    useEffect(
        () => () => {
            delete MorfiTestUtils.fields[name];
        },
        [name]
    );

    return <div data-morfi-field-name={name} />;
};

const submit = async (form?: HTMLFormElement) => {
    fireEvent.submit(form || document.querySelector('form')!);
    await act(() => new Promise((r) => setTimeout(r, 0)));
};

const getErrors = (): Record<string, ErrorMessage> =>
    Object.fromEntries(
        Object.entries(MorfiTestUtils.fields)
            .map(([name, { error }]) => [name, error])
            .filter(([_name, error]) => !!error)
    );

const hasErrors = (): boolean => !!Object.keys(getErrors()).length;

const Form = <T,>({
    children,
    initialData,
    ...rest
}: Pick<FormProps<T>, 'onSubmit' | 'onSubmitFinished' | 'onSubmitFailed' | 'version' | 'validation'> & {
    children: (fields: FormFields<T>) => React.ReactNode;
    initialData: T;
}) => {
    const [data, setData] = useState(() => Morfi.initialData(initialData));
    const { Form: MorfiForm, fields } = Morfi.useForm<T>();

    return (
        <MorfiForm data={data} onChange={setData} {...rest}>
            <>{children(fields)}</>
            <button type={'submit'} />
        </MorfiForm>
    );
};

export const MorfiTestUtils = {
    Field,
    fields: {} as FieldsData,
    clearFields,
    submit,
    hasErrors,
    getErrors,
    Form,
};
