export function required(value: unknown) {
  return value ? undefined : "Please fill out this field";
}

export function minLength(len: number) {
  return (value: unknown) => {
    if (!value || typeof value !== "string") {
      return undefined;
    }

    return value.length >= len
      ? undefined
      : `Must be at least ${len} characters long`;
  };
}

export function composeValidators(
  ...validators: ((value: unknown) => string | undefined)[]
) {
  return (value: unknown) =>
    validators.reduce<undefined | string>(
      (error, validator) => error || validator(value),
      undefined,
    );
}
