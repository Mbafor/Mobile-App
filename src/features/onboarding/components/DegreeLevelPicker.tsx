import { useTranslation } from 'react-i18next';

import { SelectWithOther } from '@/components/forms';
import { DEGREE_LEVEL_VALUES, getDegreeLevels } from '@/constants/onboarding';

type DegreeLevelPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DegreeLevelPicker({ value, onChange }: DegreeLevelPickerProps) {
  const { t } = useTranslation();
  return (
    <SelectWithOther
      options={getDegreeLevels()}
      predefinedValues={DEGREE_LEVEL_VALUES}
      value={value}
      onChange={onChange}
      placeholder={t('onboarding.academic.degreePlaceholder')}
    />
  );
}
