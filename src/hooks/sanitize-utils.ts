export const sanitizeOptionalField = (value?: string) => {
  if (value == null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};
