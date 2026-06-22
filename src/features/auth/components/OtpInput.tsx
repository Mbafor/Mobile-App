import { useRef } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { spacing, typography } from '@/constants/theme';

const OTP_LENGTH = 6;

type Props = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  onComplete?: () => void;
};

export function OtpInput({ value, onChange, autoFocus, onComplete }: Props) {
  const styles = useThemedStyles(createStyles);
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  const handleChange = (t: string) => {
    const cleaned = t.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(cleaned);
    if (cleaned.length === OTP_LENGTH) onComplete?.();
  };

  return (
    <Pressable style={styles.wrap} onPress={() => inputRef.current?.focus()}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={OTP_LENGTH}
        autoFocus={autoFocus}
        style={styles.hidden}
        caretHidden
      />
      <View style={styles.row}>
        {digits.map((d, i) => (
          <View key={i} style={[styles.box, d !== '' && styles.boxFilled]}>
            <Text style={styles.digit}>{d}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: { marginVertical: spacing.md },
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  box: {
    flex: 1,
    maxWidth: 48,
    aspectRatio: 0.9,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  boxFilled: { borderColor: colors.primary, backgroundColor: '#E8F0EB' },
  digit: { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.text },
});
}
