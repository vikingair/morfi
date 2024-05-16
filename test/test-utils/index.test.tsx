import { beforeEach, describe, expect, it } from "vitest";
import React, { useState } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { FormValidation, Morfi } from "morfi";
import { Spy } from "spy4js";
import { MorfiTestUtils } from "../../test-utils/index"; // cannot be shortened because of nested package.json

Morfi.configure({
  comparator: (a, b) => {
    if (a instanceof Date && b instanceof Date) return +a === +b;
    return a === b;
  },
});

const getCurrentDateWithoutTime = () => new Date(2023, 1, 1);

type FormValues = {
  age: number;
  name: string;
  displayName?: string;
  birthDate: Date;
};
const initialValues: FormValues = {
  age: 0,
  name: "",
  birthDate: getCurrentDateWithoutTime(),
};

const DummyValidations: FormValidation<FormValues> = {
  age: {
    onSubmit: (value) =>
      value
        ? value < 0 || value > 99
          ? "Invalid age"
          : undefined
        : "Age required",
  },
  name: { onBlur: (value) => (value ? undefined : "Name required") },
  displayName: {
    onChange: (value) =>
      value?.includes(" ") ? "No whitespace in displayName allowed" : undefined,
  },
};

const onSubmit = Spy("onSubmit");
const onSubmitFinished = Spy("onSubmitFinished");
const onSubmitFailed = Spy("onSubmitFailed");

const DummyForm: React.FC<{
  version?: number;
  validation?: FormValidation<FormValues>;
}> = ({ version, validation = DummyValidations }) => {
  const { fields, Form } = Morfi.useForm<FormValues>();
  const [data, setData] = useState(() => Morfi.initialData(initialValues));

  return (
    <Form
      data={data}
      version={version}
      onChange={setData}
      onSubmit={onSubmit}
      validation={validation}
      onSubmitFinished={onSubmitFinished}
      onSubmitFailed={onSubmitFailed}
    >
      <MorfiTestUtils.Field field={fields.name} />
      <MorfiTestUtils.Field field={fields.displayName} />
      <MorfiTestUtils.Field field={fields.age} />
      <MorfiTestUtils.Field field={fields.birthDate} />
      <button
        className={data.isSubmitting ? "loading" : undefined}
        type="submit"
        disabled={Morfi.notSubmittable(data)}
      />
    </Form>
  );
};

const DummyMorfiTestUtilForm: React.FC<{
  version?: number;
  validation?: FormValidation<FormValues>;
}> = ({ version, validation = DummyValidations }) => (
  <MorfiTestUtils.Form
    initialData={initialValues}
    onSubmit={onSubmit}
    version={version}
    validation={validation}
    onSubmitFinished={onSubmitFinished}
    onSubmitFailed={onSubmitFailed}
  >
    {(fields) => (
      <>
        <MorfiTestUtils.Field field={fields.name} />
        <MorfiTestUtils.Field field={fields.displayName} />
        <MorfiTestUtils.Field field={fields.age} />
      </>
    )}
  </MorfiTestUtils.Form>
);

describe("MorfiTestUtils", () => {
  beforeEach(() => {
    // this is actually optional since all fields will be unregistered between the tests
    MorfiTestUtils.clearFields();
    // testing the cleanup of fields on unmount (this happens usually automatically if the same form is being used
    // multiple times), but we're using two different forms here on purpose
    cleanup();
  });

  it("handles the form correctly", async () => {
    // when
    const { container, rerender } = render(<DummyForm />);

    // then
    const submitButton = container.querySelector("button")!;
    expect(submitButton.className).toBe(""); // not loading
    expect(submitButton.disabled).toBe(true); // no dirty fields
    expect(Object.keys(MorfiTestUtils.fields).length).toBe(4);
    // first input
    expect(MorfiTestUtils.fields.name.required).toBe(true);
    expect(MorfiTestUtils.fields.name.value).toBe("");
    // second input
    expect(MorfiTestUtils.fields.displayName.required).toBe(false);
    expect(MorfiTestUtils.fields.displayName.value).toBe(undefined);
    // third input
    expect(MorfiTestUtils.fields.age.required).toBe(true);
    expect(MorfiTestUtils.fields.age.value).toBe(0);

    expect(MorfiTestUtils.hasErrors()).toBe(false);

    // when - using the "name" input with onBlur validation
    MorfiTestUtils.fields.name.change("");
    expect(MorfiTestUtils.hasErrors()).toBe(false);
    expect(MorfiTestUtils.fields.name.dirty).toBe(false);
    MorfiTestUtils.fields.name.blur();
    expect(MorfiTestUtils.fields.name.error).toBe("Name required");
    MorfiTestUtils.fields.name.change("Test Name");
    expect(MorfiTestUtils.fields.name.dirty).toBe(true);
    expect(submitButton.disabled).toBe(false);
    expect(MorfiTestUtils.hasErrors()).toBe(false);
    MorfiTestUtils.fields.name.blur();
    expect(MorfiTestUtils.hasErrors()).toBe(false);

    // when - setting the "birthDate" input to the same date but different reference
    MorfiTestUtils.fields.birthDate.change(new Date());
    expect(MorfiTestUtils.hasErrors()).toBe(false);
    expect(MorfiTestUtils.fields.birthDate.dirty).toBe(true);

    MorfiTestUtils.fields.birthDate.change(getCurrentDateWithoutTime());
    expect(MorfiTestUtils.hasErrors()).toBe(false);
    expect(MorfiTestUtils.fields.birthDate.dirty).toBe(false);

    // when - using the "displayName" input with onChange validation
    MorfiTestUtils.fields.displayName.change("Test Name");
    expect(MorfiTestUtils.fields.displayName.dirty).toBe(true);
    expect(MorfiTestUtils.fields.displayName.error).toBe(
      "No whitespace in displayName allowed",
    );
    expect(MorfiTestUtils.hasErrors()).toBe(true);
    expect(submitButton.disabled).toBe(true); // has errors
    MorfiTestUtils.fields.displayName.change(undefined);
    expect(MorfiTestUtils.fields.displayName.value).toBe(undefined);
    expect(MorfiTestUtils.fields.displayName.dirty).toBe(false);
    expect(MorfiTestUtils.hasErrors()).toBe(false);
    MorfiTestUtils.fields.displayName.change("Test-DisplayName");
    expect(MorfiTestUtils.fields.displayName.dirty).toBe(true);
    expect(MorfiTestUtils.hasErrors()).toBe(false);

    // when - using the "age" input with onSubmit validation
    MorfiTestUtils.fields.age.change(100);
    expect(MorfiTestUtils.fields.age.value).toBe(100);
    expect(MorfiTestUtils.fields.age.dirty).toBe(true);
    expect(MorfiTestUtils.hasErrors()).toBe(false);
    await MorfiTestUtils.submit();
    expect(MorfiTestUtils.fields.age.error).toBe("Invalid age");
    onSubmit.wasNotCalled();
    onSubmitFinished.wasNotCalled();
    onSubmitFailed.wasCalledWith(Spy.COMPARE(Morfi.isValidationError), {
      dirty: { age: true, displayName: true, name: true, birthDate: false },
      errors: { age: "Invalid age", displayName: undefined, name: undefined },
      hasErrors: true,
      isDirty: true,
      isSubmitting: false,
      values: {
        age: 100,
        displayName: "Test-DisplayName",
        name: "Test Name",
        birthDate: initialValues.birthDate,
      },
    });

    // when - submitting with backend error
    let reject = (_err: Error): void => undefined;
    onSubmit.returns(
      new Promise((_, rej) => {
        reject = rej;
      }),
    );
    MorfiTestUtils.fields.age.change(99);
    await MorfiTestUtils.submit(container.querySelector("form")!);

    // then
    onSubmitFailed.wasNotCalled(); // not yet
    onSubmitFinished.wasNotCalled();
    onSubmit.wasCalledWith({
      age: 99,
      displayName: "Test-DisplayName",
      name: "Test Name",
      birthDate: initialValues.birthDate,
    });
    expect(submitButton.className).toBe("loading");
    expect(submitButton.disabled).toBe(true); // isSubmitting

    // when - waiting for rejection
    const specialBackendErr = new Error("special backend error");
    reject(specialBackendErr);
    await act(global.nextTick);

    // then
    onSubmitFailed.wasCalledWith(
      Spy.COMPARE(
        (err) => !Morfi.isValidationError(err) && err === specialBackendErr,
      ),
      {
        dirty: { age: true, displayName: true, name: true, birthDate: false },
        errors: { age: undefined, displayName: undefined, name: undefined },
        hasErrors: false,
        isDirty: true,
        isSubmitting: false,
        values: {
          age: 99,
          displayName: "Test-DisplayName",
          name: "Test Name",
          birthDate: initialValues.birthDate,
        },
      },
    );

    // when - submitting successfully
    onSubmit.resolves();
    await MorfiTestUtils.submit();

    // then
    onSubmitFailed.wasNotCalled();
    onSubmit.wasCalledWith({
      age: 99,
      displayName: "Test-DisplayName",
      name: "Test Name",
      birthDate: initialValues.birthDate,
    });
    onSubmitFinished.wasCalledWith({
      dirty: { age: undefined, displayName: undefined, name: undefined },
      errors: { age: undefined, displayName: undefined, name: undefined },
      hasErrors: false,
      isDirty: false,
      isSubmitting: false,
      values: {
        age: 99,
        displayName: "Test-DisplayName",
        name: "Test Name",
        birthDate: initialValues.birthDate,
      },
    });

    // when - making the form dirty again
    MorfiTestUtils.fields.age.change(50);

    // then
    expect(MorfiTestUtils.fields.age.dirty).toBe(true);

    // when - changing the form version
    rerender(<DummyForm version={42} />);

    // then
    expect(MorfiTestUtils.fields.age.dirty).toBe(false);
  });

  it("handles async form validations", async () => {
    // given
    const validation = {
      ...DummyValidations,
      name: {
        onChange: (v?: string) => {
          if (!v) return "Name required";
          return Promise.resolve(
            v.length < 3 ? "Could not find such short names" : undefined,
          );
        },
      },
    };
    const { container } = render(
      <DummyMorfiTestUtilForm validation={validation} />,
    );

    // when - entering a short name
    MorfiTestUtils.fields.name.change("Bo");

    // then
    expect(MorfiTestUtils.fields.name.required).toBe(true);
    expect(MorfiTestUtils.fields.name.dirty).toBe(true);
    expect(MorfiTestUtils.hasErrors()).toBe(false);

    // when - waiting for the async validation
    await act(global.nextTick);

    // then
    expect(MorfiTestUtils.fields.name.error).toBe(
      "Could not find such short names",
    );

    // when - entering a sufficiently long name
    MorfiTestUtils.fields.name.change("Bob");

    // then
    expect(MorfiTestUtils.hasErrors()).toBe(false); // clears the error synchronously

    // when - waiting for the async validation
    await act(global.nextTick);

    // then
    expect(MorfiTestUtils.hasErrors()).toBe(false);

    // when - submitting with async validation
    await MorfiTestUtils.submit(container.querySelector("form")!);

    // then
    onSubmitFinished.wasNotCalled();
    onSubmit.wasNotCalled();
    onSubmitFailed.wasCalledWith(Spy.COMPARE(Morfi.isValidationError), {
      dirty: { name: true },
      errors: { age: "Age required", name: undefined },
      hasErrors: true,
      isDirty: true,
      isSubmitting: false,
      values: { age: 0, name: "Bob", birthDate: initialValues.birthDate },
    });
  });
});
