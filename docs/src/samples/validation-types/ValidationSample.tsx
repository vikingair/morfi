import React, { useCallback, useMemo, useState } from "react";
import { type FormValidation, Morfi, type ValidationType } from "morfi";
import { Button } from "../../fields/Basic";
import { FormInput } from "../../fields/FormInput";
import { Select, type SelectOption } from "../../fields/FormSelect";
import { DisplayValues } from "../../tools/DisplayValues";
import { Utils } from "../../tools/Utils";
import { Validators } from "../../validators/validators";

const ValidationTypeOptions: Array<SelectOption<ValidationType>> = [
  { label: "onChange", value: "onChange" },
  { label: "onBlur", value: "onBlur" },
  { label: "onSubmit", value: "onSubmit" },
];

const descriptionFor = (type: ValidationType) => {
  switch (type) {
    case "onChange":
      return (
        "This validation type will automatically make a " +
        "validation for each character you enter in the form fields."
      );
    case "onBlur":
      return "This validation type will automatically make a validation each time you leave the form field.";
    case "onSubmit":
      return (
        "This validation type will trigger the validators " +
        "as soon as the form data was requested to be submitted."
      );
    default:
      return "";
  }
};

type FormValues = { email: string; pw: string };

const initialValues: FormValues = { email: "", pw: "" };

const validationFor = (type: ValidationType): FormValidation<FormValues> => ({
  email: { [type]: Validators.email },
  pw: {
    [type]: Validators.regex({
      re: /^[a-zA-Z0-9]{8,}$/,
      message: { id: "validation.pw.requirements" },
    }),
  },
});

export const ValidationSample: React.FC = () => {
  const [data, setData] = useState(Morfi.initialData(initialValues));
  const [validationType, setValidationType] =
    useState<ValidationType>("onChange");
  const validation = useMemo(
    () => validationFor(validationType),
    [validationType],
  );

  const onSubmit = useCallback(
    () =>
      // simulate server request
      Utils.sleep(2000),
    [],
  );

  const { Form, fields } = Morfi.useForm<FormValues>();

  return (
    <>
      <Select
        label="Choose the validation type"
        options={ValidationTypeOptions}
        value={validationType}
        onChange={setValidationType}
      />
      <p className="small font-italic">{descriptionFor(validationType)}</p>
      <hr />
      <Form
        validation={validation}
        onChange={setData}
        data={data}
        onSubmit={onSubmit}
      >
        <FormInput
          field={fields.email}
          label="Email"
          placeholder="Please enter your email address"
        />
        <FormInput
          field={fields.pw}
          type="password"
          label="Password"
          placeholder="Set your password"
        />
        <div className="btn-toolbar">
          <Button
            disabled={Morfi.notSubmittable(data)}
            loading={data.isSubmitting}
          >
            Submit
          </Button>
        </div>
      </Form>
      <div>
        <DisplayValues data={data} />
      </div>
    </>
  );
};
