import { useTranslation } from 'react-i18next';

import { SelectWithOther } from '@/components/forms/SelectWithOther';
import { getCountryOptions, PREDEFINED_COUNTRIES } from '@/constants/countries';
import type { SelectOption } from '@/constants/onboarding-options';

type CountrySelectProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Extra entries (e.g. Global for opportunities). */
  extraOptions?: SelectOption[];
  extraPredefined?: readonly string[];
};

export function CountrySelect({
  value,
  onChange,
  placeholder,
  extraOptions = [],
  extraPredefined = [],
}: CountrySelectProps) {
  const { t } = useTranslation();
  const options = [...getCountryOptions(), ...extraOptions];
  const predefinedValues = [...PREDEFINED_COUNTRIES, ...extraPredefined];

  return (
    <SelectWithOther
      options={options}
      predefinedValues={predefinedValues}
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? t('settings.personalInfo.countryPlaceholder')}
    />
  );
}
