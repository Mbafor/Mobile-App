import { Text } from '@/components/ui';
import { colors } from '@/constants/theme';

type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return <Text style={{ color: colors.error }}>{message}</Text>;
}
