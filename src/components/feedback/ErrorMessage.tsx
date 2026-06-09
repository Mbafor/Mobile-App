import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  const { colors } = useTheme();
  return <Text style={{ color: colors.error }}>{message}</Text>;
}
