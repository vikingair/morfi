import { describe, expect, it } from "vitest";
import React, {
  ChangeEvent,
  MutableRefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { FormField, FormFields, FormRef, FormValidation, Morfi } from "morfi";
import { Spy } from "spy4js";

type FormValues = {
  age: number;
  name: string;
  displayName?: string;
  nested: { data: string; description?: string };
  other?: string;
};
const initialValues: FormValues = { age: 0, name: "", nested: { data: "" } };

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
  nested: {
    data: {
      onChange: (value) =>
        value?.includes("secret") ? "remove all secrets" : undefined,
      onSubmit: (value) => (value ? undefined : "Nested data required"),
    },
    description: {
      onChange: (value) =>
        value?.includes("secret") ? "remove all secrets" : undefined,
    },
  },
  other: undefined, // doesn't break the code to have undefined assigned
};

const Input: React.FC<{ field: FormField<string> }> = ({ field }) => {
  const { onChange, onBlur, value, error, dirty, required, name } =
    Morfi.useField(field);
  const _onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    [onChange],
  );
  return (
    <div>
      <input
        className={[required && "required", dirty && "dirty"]
          .filter(Boolean)
          .join(" ")}
        name={name}
        onChange={_onChange}
        onBlur={onBlur}
        value={value}
      />
      {/* eslint-disable-next-line prettier/prettier */}
            {error && <span className="error">{error as string}</span>}
    </div>
  );
};

const OptionalInput: React.FC<{ field: FormField<string | undefined> }> = ({
  field,
}) => {
  const { onChange, onBlur, value, error, dirty, required, name } =
    Morfi.useField(field);
  const _onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value || undefined),
    [onChange],
  );
  return (
    <div>
      <input
        className={[required && "required", dirty && "dirty"]
          .filter(Boolean)
          .join(" ")}
        name={name}
        onChange={_onChange}
        onBlur={onBlur}
        value={value || ""}
      />
      {error && <span className="error">{error as string}</span>}
    </div>
  );
};

const NumberInput: React.FC<{ field: FormField<number> }> = ({ field }) => {
  const { onChange, onBlur, value, error, dirty, required, name } =
    Morfi.useField(field);
  const _onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(+e.target.value),
    [onChange],
  );
  return (
    <div>
      <input
        className={[required && "required", dirty && "dirty"]
          .filter(Boolean)
          .join(" ")}
        name={name}
        onChange={_onChange}
        onBlur={onBlur}
        value={value.toString()}
      />
      {error && <span className="error">{error as string}</span>}
    </div>
  );
};

const onSubmit = Spy("onSubmit");
const onSubmitFinished = Spy("onSubmitFinished");
const onSubmitFailed = Spy("onSubmitFailed");

const DummyForm: React.FC<{
  version?: number;
  validation?: FormValidation<FormValues>;
  givenRef?: MutableRefObject<FormRef<any> | null>;
}> = ({ version, validation, givenRef }) => {
  const { fields, Form } = Morfi.useForm<FormValues>();
  const [data, setData] = useState(() => Morfi.initialData(initialValues));

  // testing the type
  const nestedFields: FormFields<FormValues["nested"]> = fields.nested;

  return (
    <Form
      ref={givenRef}
      data={data}
      version={version}
      onChange={setData}
      onSubmit={onSubmit}
      validation={validation}
      onSubmitFinished={onSubmitFinished}
      onSubmitFailed={onSubmitFailed}
    >
      <Input field={fields.name} />
      <OptionalInput field={fields.displayName} />
      <NumberInput field={fields.age} />
      <Input field={nestedFields.data} />
      <OptionalInput field={fields.nested.description} />
      <button
        className={data.isSubmitting ? "loading" : undefined}
        type="submit"
        disabled={Morfi.notSubmittable(data)}
      />
    </Form>
  );
};

describe("Morfi", () => {
  it("submits the form even without validation", async () => {
    // given
    const { container } = render(<DummyForm />);

    // when - changing the name and submitting
    fireEvent.change(container.querySelector('[name="name"]')!, {
      target: { value: "Test Name" },
    });
    fireEvent.submit(container.querySelector("form")!);

    // then
    onSubmit.wasCalledWith({
      age: 0,
      displayName: undefined,
      name: "Test Name",
      nested: { data: "" },
    });
    onSubmitFailed.wasNotCalled();
    onSubmitFinished.wasNotCalled(); // not yet

    // when
    await act(global.nextTick);

    // then
    onSubmitFinished.wasCalledWith({
      dirty: {},
      errors: {},
      hasErrors: false,
      isDirty: false,
      isSubmitting: false,
      values: {
        age: 0,
        displayName: undefined,
        name: "Test Name",
        nested: { data: "" },
      },
    });
  });

  it("handles the form correctly", async () => {
    // when
    const ref: MutableRefObject<FormRef<FormValues> | null> =
      React.createRef<FormRef<any>>();
    const { container, rerender, unmount } = render(
      <DummyForm givenRef={ref} validation={DummyValidations} />,
    );

    // then
    const form = container.querySelector("form")!;
    const submitButton = container.querySelector("button")!;
    expect(submitButton.className).toBe(""); // not loading
    expect(submitButton.disabled).toBe(true); // no dirty fields
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBe(5);
    // 1. input
    expect(inputs[0].name).toBe("name");
    expect(inputs[0].className).toBe("required");
    expect(inputs[0].value).toBe("");
    // 2. input
    expect(inputs[1].name).toBe("displayName");
    expect(inputs[1].className).toBe("");
    expect(inputs[1].value).toBe("");
    // 3. input
    expect(inputs[2].name).toBe("age");
    expect(inputs[2].className).toBe("required");
    expect(inputs[2].value).toBe("0");
    // 4. input
    expect(inputs[3].name).toBe("nested.data");
    expect(inputs[3].className).toBe("required");
    expect(inputs[3].value).toBe("");
    // 5. input
    expect(inputs[4].name).toBe("nested.description");
    expect(inputs[4].className).toBe("");
    expect(inputs[4].value).toBe("");

    expect(container.querySelector(".error")).toBe(null);

    // when - using the "name" input with onBlur validation
    fireEvent.change(inputs[0], { target: { value: "" } });
    expect(container.querySelector(".error")).toBe(null);
    expect(inputs[0].className).toBe("required");
    fireEvent.blur(inputs[0]);
    expect(container.querySelector(".error")!.textContent).toBe(
      "Name required",
    );
    // allows to override initial data for comparison
    ref.current!.updateInitialData((data) => ({
      ...data,
      name: "Test Name Not Dirty",
    }));
    fireEvent.change(inputs[0], { target: { value: "Test Name Not Dirty" } });
    expect(inputs[0].value).toBe("Test Name Not Dirty");
    expect(inputs[0].className).toBe("required"); // not dirty
    fireEvent.change(inputs[0], { target: { value: "Test Name" } });
    expect(inputs[0].value).toBe("Test Name");
    expect(inputs[0].className).toBe("required dirty");
    expect(submitButton.disabled).toBe(false);
    expect(container.querySelector(".error")).toBe(null);
    fireEvent.blur(inputs[0]);
    expect(container.querySelector(".error")).toBe(null);

    // when - using the "displayName" input with onChange validation
    fireEvent.change(inputs[1], { target: { value: "Test Name" } });
    expect(inputs[1].value).toBe("Test Name");
    expect(inputs[1].className).toBe("dirty");
    expect(container.querySelector(".error")!.textContent).toBe(
      "No whitespace in displayName allowed",
    );
    expect(submitButton.disabled).toBe(true); // has errors
    fireEvent.change(inputs[1], { target: { value: "" } });
    expect(inputs[1].value).toBe("");
    expect(inputs[1].className).toBe("");
    expect(container.querySelector(".error")).toBe(null);
    fireEvent.change(inputs[1], { target: { value: "Test-DisplayName" } });
    expect(inputs[1].value).toBe("Test-DisplayName");
    expect(inputs[1].className).toBe("dirty");
    expect(container.querySelector(".error")).toBe(null);

    // when - using the "age" input with onSubmit validation
    fireEvent.change(inputs[2], { target: { value: "100" } });
    expect(inputs[2].value).toBe("100");
    expect(inputs[2].className).toBe("required dirty");
    expect(container.querySelector(".error")).toBe(null);
    fireEvent.submit(form);
    expect(container.querySelector(".error")!.textContent).toBe("Invalid age");
    onSubmit.wasNotCalled();
    onSubmitFinished.wasNotCalled();
    onSubmitFailed.wasNotCalled(); // will be called in the next tick to avoid automatic update batching
    await act(global.nextTick);
    onSubmitFailed.wasCalledWith(
      Spy.COMPARE((err) => Morfi.isValidationError(err)),
      {
        dirty: { age: true, displayName: true, name: true },
        errors: { age: "Invalid age", "nested.data": "Nested data required" },
        hasErrors: true,
        isDirty: true,
        isSubmitting: false,
        values: {
          age: 100,
          displayName: "Test-DisplayName",
          name: "Test Name",
          nested: { data: "" },
        },
      },
    );
    fireEvent.change(inputs[2], { target: { value: "99" } }); // fix the error

    // when - using the "nested.data" input with onChange and onSubmit validation
    fireEvent.change(inputs[3], { target: { value: "My precious secret" } });
    expect(inputs[3].value).toBe("My precious secret");
    expect(inputs[3].className).toBe("required dirty");
    expect(container.querySelector(".error")!.textContent).toBe(
      "remove all secrets",
    );
    fireEvent.change(inputs[3], { target: { value: "" } });
    expect(container.querySelector(".error")).toBe(null);
    fireEvent.submit(form);
    expect(container.querySelector(".error")!.textContent).toBe(
      "Nested data required",
    );
    onSubmit.wasNotCalled();
    onSubmitFinished.wasNotCalled();
    onSubmitFailed.wasNotCalled(); // will be called in the next tick to avoid automatic update batching
    await act(global.nextTick);
    onSubmitFailed.wasCalledWith(
      Spy.COMPARE((err) => Morfi.isValidationError(err)),
      {
        dirty: {
          age: true,
          displayName: true,
          name: true,
          "nested.data": false,
        },
        errors: { "nested.data": "Nested data required" },
        hasErrors: true,
        isDirty: true,
        isSubmitting: false,
        values: {
          age: 99,
          displayName: "Test-DisplayName",
          name: "Test Name",
          nested: { data: "" },
        },
      },
    );
    // fix the nested data
    fireEvent.change(inputs[3], { target: { value: "Test-nested.data" } });

    // when - submitting with backend error
    const specialBackendErr = new Error("special backend error");
    onSubmit.rejects(specialBackendErr);
    // submitting via ref
    act(ref.current!.submit);

    // then
    onSubmitFailed.wasNotCalled(); // not yet
    onSubmitFinished.wasNotCalled();
    onSubmit.wasCalledWith({
      age: 99,
      displayName: "Test-DisplayName",
      name: "Test Name",
      nested: { data: "Test-nested.data" },
    });
    expect(submitButton.className).toBe("loading");
    expect(submitButton.disabled).toBe(true); // isSubmitting

    // when - waiting for rejection
    await act(global.nextTick);

    // then
    onSubmitFailed.wasCalledWith(
      Spy.COMPARE(
        (err) => !Morfi.isValidationError(err) && err === specialBackendErr,
      ),
      {
        dirty: {
          age: true,
          displayName: true,
          name: true,
          "nested.data": true,
        },
        errors: { age: undefined, displayName: undefined, name: undefined },
        hasErrors: false,
        isDirty: true,
        isSubmitting: false,
        values: {
          age: 99,
          displayName: "Test-DisplayName",
          name: "Test Name",
          nested: { data: "Test-nested.data" },
        },
      },
    );

    // when - submitting successfully
    onSubmit.resolves();
    fireEvent.submit(form);
    onSubmitFailed.wasNotCalled();
    onSubmitFinished.wasNotCalled(); // not yet
    onSubmit.wasCalledWith({
      age: 99,
      displayName: "Test-DisplayName",
      name: "Test Name",
      nested: { data: "Test-nested.data" },
    });

    // when - waiting for resolve
    await act(global.nextTick);

    // then
    onSubmitFinished.wasCalledWith({
      dirty: {},
      errors: {},
      hasErrors: false,
      isDirty: false,
      isSubmitting: false,
      values: {
        age: 99,
        displayName: "Test-DisplayName",
        name: "Test Name",
        nested: { data: "Test-nested.data" },
      },
    });

    // when - submitting successfully synchronously
    onSubmit.returns();
    fireEvent.submit(form);
    onSubmitFailed.wasNotCalled();
    onSubmit.wasCalledWith({
      age: 99,
      displayName: "Test-DisplayName",
      name: "Test Name",
      nested: { data: "Test-nested.data" },
    });
    onSubmitFinished.wasNotCalled(); // will be called in the next tick to avoid automatic update batching
    await act(global.nextTick);
    onSubmitFinished.wasCalledWith({
      dirty: {},
      errors: {},
      hasErrors: false,
      isDirty: false,
      isSubmitting: false,
      values: {
        age: 99,
        displayName: "Test-DisplayName",
        name: "Test Name",
        nested: { data: "Test-nested.data" },
      },
    });

    // when - making the form dirty again
    fireEvent.change(inputs[2], { target: { value: "50" } });

    // then
    expect(inputs[2].classList.contains("dirty")).toBe(true);

    // when - changing the form version
    rerender(<DummyForm version={42} validation={DummyValidations} />);

    // then
    expect(inputs[2].classList.contains("dirty")).toBe(false);

    // when - submitting successfully, but unmounting the form in between
    onSubmit.resolves();
    fireEvent.submit(form);
    unmount();

    await act(global.nextTick);
    onSubmitFailed.wasNotCalled();
    onSubmitFinished.wasNotCalled();
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
    const { container } = render(<DummyForm validation={validation} />);
    const form = container.querySelector("form")!;
    const nameInput = container.querySelector(
      'input[name="name"]',
    ) as HTMLInputElement;

    // when - entering a short name
    fireEvent.change(nameInput, { target: { value: "Bo" } });

    // then
    expect(nameInput.className).toBe("required dirty");
    expect(nameInput.value).toBe("Bo");
    expect(container.querySelector(".error")).toBe(null);

    // when - waiting for the async validation
    await act(global.nextTick);

    // then
    expect(container.querySelector(".error")!.textContent).toBe(
      "Could not find such short names",
    );

    // when - entering a sufficiently long name
    fireEvent.change(nameInput, { target: { value: "Bob" } });

    // then
    expect(nameInput.value).toBe("Bob");
    expect(container.querySelector(".error")).toBe(null); // clears the error synchronously

    // when - waiting for the async validation
    await act(global.nextTick);

    // then
    expect(container.querySelector(".error")).toBe(null);

    // when - submitting with async validation
    fireEvent.submit(form);

    // then
    onSubmitFailed.wasNotCalled(); // not yet
    onSubmit.wasNotCalled();
    onSubmitFinished.wasNotCalled();

    // when - waiting for the async validation
    await act(global.nextTick);

    // then
    onSubmit.wasNotCalled();
    onSubmitFailed.wasCalledWith(Spy.COMPARE(Morfi.isValidationError), {
      dirty: { name: true },
      errors: {
        age: "Age required",
        name: undefined,
        "nested.data": "Nested data required",
      },
      hasErrors: true,
      isDirty: true,
      isSubmitting: false,
      values: { age: 0, name: "Bob", nested: { data: "" } },
    });
  });

  it("uses global fields object", () => {
    // given
    const initialData = Morfi.initialData({
      foo: "bar",
      nested: { num: 123, str: "zzz" },
    });
    let useFieldReturn: any = null as any;
    const DummyInner: React.FC<{
      fields: FormFields<(typeof initialData)["values"]>;
    }> = ({ fields }) => {
      useFieldReturn = Morfi.useField(fields);
      return null;
    };
    const Dummy = () => {
      const [data, setData] = useState(initialData);
      const { fields, Form } = Morfi.useForm<(typeof initialData)["values"]>();
      return (
        <Form data={data} onChange={setData} onSubmit={onSubmit}>
          <DummyInner fields={fields} />
        </Form>
      );
    };

    // when
    render(<Dummy />);

    // then
    expect(useFieldReturn.value).toEqual(initialData.values);
    expect(useFieldReturn.error).toBe(undefined);
    expect(useFieldReturn.required).toBe(false);
    expect(useFieldReturn.dirty).toBe(false);
  });

  it("Morfi.useClearErrors: Allows to clear errors from within the form tree", async () => {
    // given
    const initialData = Morfi.initialData({ foo: "one", bar: "two" });
    let fieldFoo: any = null as any;
    let fieldBar: any = null as any;
    const DummyInner: React.FC<{
      fields: FormFields<(typeof initialData)["values"]>;
    }> = ({ fields }) => {
      fieldFoo = Morfi.useField(fields.foo);
      fieldBar = Morfi.useField(fields.bar);
      const clearErrors = Morfi.useClearErrors();

      useEffect(() => {
        // clear bar error if foo changes
        clearErrors(fields.bar);
      }, [clearErrors, fieldFoo.value, fields]);

      return null;
    };
    const alwaysFailingValidation: FormValidation<
      (typeof initialData)["values"]
    > = {
      foo: { onChange: () => "ups" },
      bar: { onChange: () => "ups" },
    };
    const Dummy = () => {
      const [data, setData] = useState(initialData);
      const { fields, Form } = Morfi.useForm<(typeof initialData)["values"]>();
      return (
        <Form
          data={data}
          onChange={setData}
          onSubmit={onSubmit}
          validation={alwaysFailingValidation}
        >
          <DummyInner fields={fields} />
        </Form>
      );
    };

    // when
    render(<Dummy />);
    act(() => {
      fieldBar.onChange("thing");
    });

    // then
    expect(fieldBar.value).toBe("thing");
    expect(fieldBar.error).toBe("ups");

    // when - updating "foo"
    act(() => {
      fieldFoo.onChange("test");
    });

    // then
    expect(fieldFoo.value).toBe("test");
    expect(fieldFoo.error).toBe("ups");
    expect(fieldBar.value).toBe("thing");
    expect(fieldBar.error).toBe(undefined);

    // when - updating "bar" again the opposite is not true
    act(() => {
      fieldBar.onChange("test-2");
    });

    // then
    expect(fieldFoo.value).toBe("test");
    expect(fieldFoo.error).toBe("ups");
    expect(fieldBar.value).toBe("test-2");
    expect(fieldBar.error).toBe("ups");
  });

  it("Morfi.clearErrors: removes errors from MorfiData", () => {
    // given
    const data = Morfi.initialData({
      foo: "bar",
      nested: { num: 123, str: "zzz" },
    });
    let fields: FormFields<(typeof data)["values"]> = null as any;
    const Dummy = () => {
      const useFormReturn = Morfi.useForm<(typeof data)["values"]>();
      fields = useFormReturn.fields;
      return null;
    };
    render(<Dummy />);

    // filled with errors
    data.errors[fields] = "Ups global";
    data.errors[fields.foo] = "Ups foo";
    data.errors[fields.nested] = "Ups nested";
    data.errors[fields.nested.num] = "Ups num";
    data.errors[fields.nested.str] = "Ups str";
    data.hasErrors = true;

    // test cases
    expect(Morfi.clearErrors(data, fields)).toEqual({
      ...data,
      errors: {},
      hasErrors: false,
    });
    expect(Morfi.clearErrors(data, fields.foo)).toEqual({
      ...data,
      errors: {
        [fields]: "Ups global",
        [fields.nested]: "Ups nested",
        [fields.nested.num]: "Ups num",
        [fields.nested.str]: "Ups str",
      },
    });
    expect(Morfi.clearErrors(data, fields.nested)).toEqual({
      ...data,
      errors: {
        [fields]: "Ups global",
        [fields.foo]: "Ups foo",
      },
    });
    expect(Morfi.clearErrors(data, fields.nested.str)).toEqual({
      ...data,
      errors: {
        [fields]: "Ups global",
        [fields.foo]: "Ups foo",
        [fields.nested]: "Ups nested",
        [fields.nested.num]: "Ups num",
      },
    });
  });
});
