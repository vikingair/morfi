import React, { useCallback, useRef, useState } from 'react';
import { Validators } from '../../validators/validators';
import { FormInput } from '../../fields/FormInput';
import { FormData, FormValidation, Morfi } from 'morfi';
import { useSafeState } from '../../hooks/useSafeState';
import { Utils } from '../../tools/Utils';
import { Button } from '../../fields/Basic';

// some fake server state
const alreadyRegistered_userName = 'tom';
const everySecondTimeFailing_userName = 'jack';
const failingAfterSubmit_userName = 'mike';
let jackValidationCounter = 0;

type FormValues = { userName: string; realName: string; alias: string };

const initialValues: FormValues = { userName: '', realName: '', alias: '' };

const StaticValidations: FormValidation<FormValues> = {
    realName: {
        onChange: Validators.optionalOf(
            Validators.regex({
                re: /^[a-zöüä][a-zöüä ]*$/i,
                message: { id: 'AsyncValidationSample.realName.validation.requirements' },
            })
        ),
    },
};

const onSubmit = ({ userName = '' }: FormValues): Promise<void> => {
    // simulate server request
    const fakeServerRequest = Utils.sleep(1000);
    return userName.toLowerCase() !== failingAfterSubmit_userName
        ? fakeServerRequest
        : fakeServerRequest.then(() => {
              throw new Error('AsyncValidationSample.userName.submit.failed');
          });
};

const validateName = (setPending: (p: boolean) => void) => (name?: string) => {
    const syncError = Validators.string({ min: 1 })(name);
    if (syncError) {
        return syncError;
    }
    const lowerCaseUserName = name!.toLowerCase();
    setPending(true);
    lowerCaseUserName === everySecondTimeFailing_userName && jackValidationCounter++;
    return Utils.sleep(1000).then(() => {
        setPending(false);
        if (lowerCaseUserName === alreadyRegistered_userName) {
            return { id: 'AsyncValidationSample.userName.already.registered', values: { userName: name } };
        } else if (lowerCaseUserName === everySecondTimeFailing_userName && jackValidationCounter % 2 === 0) {
            return { id: 'AsyncValidationSample.userName.already.registered', values: { userName: name } };
        }
    });
};

export const AsyncValidationSample = () => {
    const [pendingUserName, setPendingUserName] = useSafeState<boolean>(false);
    const validateUserName = useCallback(
        (name?: string) => validateName(setPendingUserName)(name),
        [setPendingUserName]
    );

    const [pendingAlias, setPendingAlias] = useSafeState<boolean>(false);
    const validateAlias = useCallback((alias?: string) => validateName(setPendingAlias)(alias), [setPendingAlias]);

    const validation = useRef<FormValidation<FormValues>>({
        ...StaticValidations,
        userName: { onBlur: validateUserName, onChange: Validators.string({ min: 1 }) },
        alias: { onChange: validateAlias },
    });

    const [data, setData] = useState<FormData<FormValues>>(() => Morfi.initialData(initialValues));

    const onSubmitFailed = useCallback((e: Error): void => {
        Morfi.isValidationError(e) ||
            setData((data) => ({
                ...data,
                errors: { ...data.errors, userName: { id: e.message } },
            }));
    }, []);

    const onSubmitFinished = useCallback((): void => {
        setData(Morfi.initialData(initialValues));
    }, []);

    const { fields, Form } = Morfi.useForm<FormValues>();

    return (
        <>
            <p className="small font-italic form-group-apply">
                <em>ATTENTION: The validation succeeds for all names, but the following:</em>
                <br />
                <strong>Tom</strong>: <em>Validation fails each time.</em>
                <br />
                <strong>Jack</strong>: <em>Validation fails each second time.</em>
                <br />
                <strong>Mike</strong>: <em>Validation succeeds but submitting fails.</em>
            </p>
            <Form
                validation={validation.current}
                onChange={setData}
                data={data}
                onSubmit={onSubmit}
                onSubmitFailed={onSubmitFailed}
                onSubmitFinished={onSubmitFinished}>
                <FormInput
                    field={fields.userName}
                    loading={pendingUserName}
                    label="Username (async validation triggers on blur)"
                    placeholder="Please enter your desired username"
                />
                <FormInput
                    field={fields.alias}
                    loading={pendingAlias}
                    label="Alias (async validation triggers on change)"
                    placeholder="Please enter some alias"
                />
                <FormInput field={fields.realName} label="Real name" placeholder="Please enter your real name" />
                <div className="btn-toolbar">
                    <Button disabled={Morfi.notSubmittable(data)} loading={data.isSubmitting}>
                        Submit
                    </Button>
                </div>
            </Form>
        </>
    );
};
