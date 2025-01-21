const getErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;
  if (!("message" in error) || !error.message) return undefined;
  if (typeof error.message !== "string") return undefined;
  return error.message;
};

export const getErrorMessageWithFallback = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  return getErrorMessage(error) || fallback;
};
