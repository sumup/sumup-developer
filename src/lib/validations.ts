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

export function validateEmail(value: unknown) {
  const isValidEmail = (v: unknown) => {
    if (typeof v !== "string") return false;
    return /^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      v,
    );
  };

  return isValidEmail(value) ? undefined : "Please enter a valid email address";
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
