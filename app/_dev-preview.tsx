import { View } from 'react-native';

import { DesktopSidebar, DesktopHeader } from '@/features/navigation/components';

/** Temporary auth-free route for visually verifying the desktop sidebar/header layout. Delete before committing. */
export default function DevPreview() {
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#ffffff' }}>
      <DesktopSidebar />
      <View style={{ flex: 1 }}>
        <DesktopHeader />
        <View style={{ flex: 1, backgroundColor: '#f5f6f8' }} />
      </View>
    </View>
  );
}
