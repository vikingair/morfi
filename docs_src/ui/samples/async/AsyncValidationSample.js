// @flow

import React, { useCallback, useRef, useState } from 'react';
import { Validators } from '../../validators/validators';
import { Spinner } from '../../icons/Spinner';
import { FormInput } from '../../fields/FormInput';
import { Morfi, type FormData, type FormValidation } from '../../../../dist/cjs/';
import { useSafeState } from '../../../hooks/useSafeState';

// some fake server state
const alreadyRegistered_userName = 'tom';
const everySecondTimeFailing_userName = 'jack';
const failingAfterSubmit_userName = 'mike';
let jackValidationCounter = 0;

type FormValues = {| userName: string, realName: string, alias: string |};

const initialValues: FormValues = { userName: '', realName: '', alias: '' };

const { Form, Fields } = Morfi.create(initialValues);

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
    const fakeServerRequest = window.sleep(1000);
    return userName.toLowerCase() !== failingAfterSubmit_userName
        ? fakeServerRequest
        : fakeServerRequest.then(() => {
              throw new Error('AsyncValidationSample.userName.submit.failed');
          });
};

const validateName = (setPending: boolean => void) => (name?: string) => {
    const syncError = Validators.string({ min: 1 })(name);
    if (syncError) {
        return syncError;
    }
    const lowerCaseUserName = (name: any).toLowerCase();
    setPending(true);
    lowerCaseUserName === everySecondTimeFailing_userName && jackValidationCounter++;
    return window.sleep(1000).then(() => {
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
    const validateUserName = useCallback(validateName(setPendingUserName), []);

    const [pendingAlias, setPendingAlias] = useSafeState<boolean>(false);
    const validateAlias = useCallback(validateName(setPendingAlias), []);

    const validation = useRef<FormValidation<FormValues>>({
        ...StaticValidations,
        userName: { onBlur: validateUserName, onChange: Validators.string({ min: 1 }) },
        alias: { onChange: validateAlias },
    });

    const [data, setData] = useState<FormData<FormValues>>({ values: initialValues, errors: {} });

    const onSubmitFailed = useCallback((e: Error): void => {
        Morfi.isValidationError(e) ||
            setData(({ values, errors }) => ({
                values: { ...values },
                errors: { ...errors, userName: { id: e.message } },
            }));
    }, []);

    const onSubmitFinished = useCallback((): void => {
        setData({ values: initialValues, errors: {} });
    }, []);

    const { submitting } = data;

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
                            Field={Fields.userName}
                            pending={pendingUserName}
                            label="Username (async validation triggers on blur)"
                            placeholder="Please enter your desired username"
                        />
                        <FormInput
                            Field={Fields.alias}
                            pending={pendingAlias}
                            label="Alias (async validation triggers on change)"
                            placeholder="Please enter some alias"
                        />
                        <FormInput
                            Field={Fields.realName}
                            label="Real name"
                            placeholder="Please enter your real name"
                        />
                        <div className="btn-toolbar">
                            <button className="btn btn-success" disabled={submitting || Morfi.hasErrors(data)}>
                                {submitting && <Spinner />} Submit
                            </button>
                        </div>
                    </div>
                </div>
            </Form>
        </div>
    );
};
