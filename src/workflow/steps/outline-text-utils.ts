const placeholderPattern = /^enter\s.+\shere$/i;

interface MeaningfulFieldMessages {
  empty: string;
  placeholder: string;
}

export const normalizeOptionalString = (value?: string | null) => {
  if (value == null) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const ensureMeaningfulText = (
  value: string,
  messages: MeaningfulFieldMessages
) => {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new Error(messages.empty);
  }

  if (placeholderPattern.test(trimmed)) {
    throw new Error(messages.placeholder);
  }

  return trimmed;
};

export const requireMeaningfulField = (
  value: string,
  messages: MeaningfulFieldMessages
) => ensureMeaningfulText(value, messages);
