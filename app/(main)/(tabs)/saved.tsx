import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

export default function SavedScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text variant="title">Saved</Text>
      <Text style={{ marginTop: 12 }}>This is the Saved screen.</Text>
    </View>
  );
}
