export function required(value: unknown) {
  return value ? undefined : "Please fill out this field";
}

export function validateUrl(value: unknown) {
  // why it validates if falsy??
  if (!value) {
    return undefined;
  }

  const isValidUrl = (v: unknown) => {
    if (typeof v !== "string") return false;
    try {
      new URL(v);
    } catch (_) {
      return false;
    }
    return true;
  };

  return isValidUrl(value) ? undefined : "Please enter a valid url";
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

export function minArrayLength(len: number) {
  return (value: unknown) => {
    if (!Array.isArray(value)) {
      return undefined;
    }

    return value.length >= len ? undefined : `Must have at least ${len} items`;
  };
}

export function validateHTTPUrl(value: unknown) {
  // why it validates if falsy??
  if (!value) {
    return undefined;
  }

  const isValidHttpUrl = (v: unknown) => {
    if (typeof v !== "string") return false;
    let url: URL;

    try {
      url = new URL(v);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  };

  return isValidHttpUrl(value) ? undefined : "Please enter a valid url";
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
