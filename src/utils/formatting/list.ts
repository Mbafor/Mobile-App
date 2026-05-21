/** Parse comma-separated user input into a trimmed string array. */
export function parseListInput(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatListInput(items: string[] | null | undefined): string {
  return (items ?? []).join(', ');
}
