import React, { useCallback, useRef, useState } from 'react';
import { Validators } from '../../validators/validators';
import { Spinner } from '../../icons/Spinner';
import { FormInput } from '../../fields/FormInput';
import { Morfi, FormData, FormValidation } from '../../../../src';
import { useSafeState } from '../../hooks/useSafeState';
import { Utils } from '../../tools/Utils';

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
        <div className="col-12">
            <Form
                validation={validation.current}
                onChange={setData}
                data={data}
                onSubmit={onSubmit}
                onSubmitFailed={onSubmitFailed}
                onSubmitFinished={onSubmitFinished}>
                <div className="row">
                    <div className="col-md-12">
                        <p className="small font-italic form-group-apply">
                            ATTENTION: The validation succeeds for all names, but the following:
                            <br />
                            <strong>Tom</strong>: Validation fails each time.
                            <br />
                            <strong>Jack</strong>: Validation fails each second time.
                            <br />
                            <strong>Mike</strong>: Validation succeeds but submitting fails.
                        </p>
                        <FormInput
                            field={fields.userName}
                            pending={pendingUserName}
                            label="Username (async validation triggers on blur)"
                            placeholder="Please enter your desired username"
                        />
                        <FormInput
                            field={fields.alias}
                            pending={pendingAlias}
                            label="Alias (async validation triggers on change)"
                            placeholder="Please enter some alias"
                        />
                        <FormInput
                            field={fields.realName}
                            label="Real name"
                            placeholder="Please enter your real name"
                        />
                        <div className="btn-toolbar">
                            <button className="btn btn-success" disabled={Morfi.notSubmittable(data)}>
                                {data.isSubmitting && <Spinner />} Submit
                            </button>
                        </div>
                    </div>
                </div>
            </Form>
        </div>
    );
};
