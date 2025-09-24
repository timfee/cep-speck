const hasCrypto =
  typeof globalThis !== "undefined" &&
  typeof globalThis.crypto !== "undefined" &&
  typeof globalThis.crypto.randomUUID === "function";

const BASE36_RADIX = 36;

const fallbackId = () =>
  `${Math.random().toString(BASE36_RADIX).slice(2)}${Math.random()
    .toString(BASE36_RADIX)
    .slice(2)}`;

export function createOutlineId(prefix: string) {
  const id = hasCrypto ? globalThis.crypto.randomUUID() : fallbackId();
  return `${prefix}-${id}`;
}
