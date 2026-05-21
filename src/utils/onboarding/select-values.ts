import { OTHER_OPTION_VALUE } from '@/constants/onboarding-options';

export function isPredefinedValue(value: string, predefined: readonly string[]): boolean {
  return predefined.includes(value);
}

/** Map stored single value → select UI state. */
export function parseSingleSelectValue(
  stored: string,
  predefined: readonly string[],
): { selected: string; otherText: string; isOther: boolean } {
  if (!stored) {
    return { selected: '', otherText: '', isOther: false };
  }

  if (stored === OTHER_OPTION_VALUE) {
    return { selected: OTHER_OPTION_VALUE, otherText: '', isOther: true };
  }

  if (isPredefinedValue(stored, predefined)) {
    return { selected: stored, otherText: '', isOther: false };
  }

  return { selected: OTHER_OPTION_VALUE, otherText: stored, isOther: true };
}

/** Resolve UI state → value persisted to database. */
export function serializeSingleSelectValue(
  selected: string,
  otherText: string,
  predefined: readonly string[],
): string {
  if (!selected) return '';

  if (selected === OTHER_OPTION_VALUE) {
    return otherText.trim();
  }

  if (isPredefinedValue(selected, predefined)) {
    return selected;
  }

  return selected;
}

export function parseMultiSelectValues(
  stored: string[],
  predefined: readonly string[],
): { selected: string[]; otherText: string } {
  const selected: string[] = [];
  const custom: string[] = [];

  for (const item of stored) {
    if (isPredefinedValue(item, predefined)) {
      selected.push(item);
    } else if (item && item !== OTHER_OPTION_VALUE) {
      custom.push(item);
    }
  }

  const otherText = custom.join(', ');
  if (custom.length > 0) {
    selected.push(OTHER_OPTION_VALUE);
  }

  return { selected: [...new Set(selected)], otherText };
}

export function serializeMultiSelectValues(
  selected: string[],
  otherText: string,
  predefined: readonly string[],
): string[] {
  const result: string[] = [];

  for (const item of selected) {
    if (item === OTHER_OPTION_VALUE) continue;
    if (isPredefinedValue(item, predefined)) {
      result.push(item);
    }
  }

  const custom = otherText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return [...new Set([...result, ...custom])];
}
