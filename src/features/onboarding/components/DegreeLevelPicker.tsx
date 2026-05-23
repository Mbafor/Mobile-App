import { SelectWithOther } from '@/components/forms';
import { DEGREE_LEVELS } from '@/constants/onboarding';

const DEGREE_OPTIONS = DEGREE_LEVELS.map((d) => ({ value: d.value, label: d.label }));
const DEGREE_VALUES = DEGREE_LEVELS.map((d) => d.value);

type DegreeLevelPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DegreeLevelPicker({ value, onChange }: DegreeLevelPickerProps) {
  return (
    <SelectWithOther
      options={DEGREE_OPTIONS}
      predefinedValues={DEGREE_VALUES}
      value={value}
      onChange={onChange}
      placeholder="Select degree level"
    />
  );
}
