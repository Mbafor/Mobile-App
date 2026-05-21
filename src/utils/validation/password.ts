const MIN_LENGTH = 8;

export function isValidPassword(value: string): boolean {
  return value.length >= MIN_LENGTH;
}
