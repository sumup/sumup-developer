import {
  Checkbox,
  type CheckboxProps,
  Input,
  type InputProps,
  Select,
  type SelectProps,
  TextArea,
  type TextAreaProps,
} from "@sumup-oss/circuit-ui";
import {
  type FieldMetaState,
  type UseFieldConfig,
  useField,
} from "react-final-form";

function getValidationProps<FieldValue>(meta: FieldMetaState<FieldValue>) {
  return {
    invalid: meta.touched && meta.invalid,
    validationHint: meta.touched ? (meta.error as string) : undefined,
  };
}

type FieldProps<ComponentProps extends { value?: unknown }> = ComponentProps &
  UseFieldConfig<ComponentProps["value"]> & { name: string };

export function InputField(props: FieldProps<InputProps>) {
  const field = useField(props.name, props);
  return (
    <Input {...props} {...field.input} {...getValidationProps(field.meta)} />
  );
}

export function SelectField(props: FieldProps<SelectProps>) {
  const field = useField(props.name, props);
  return (
    <Select {...props} {...field.input} {...getValidationProps(field.meta)} />
  );
}

export function TextAreaField(props: FieldProps<TextAreaProps>) {
  const field = useField(props.name, props);
  return (
    <TextArea
      {...props}
      {...field.input}
      {...getValidationProps(field.meta)}
      rows="auto"
    />
  );
}

export function CheckboxField(props: FieldProps<CheckboxProps>) {
  const field = useField(props.name, { ...props, type: "checkbox" });
  return (
    <Checkbox {...props} {...field.input} {...getValidationProps(field.meta)} />
  );
}
