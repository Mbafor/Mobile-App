import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';
import { TRACKER_STAGE_LABELS } from '@/types/domain/tracker';
import { formatDeadline } from '@/utils/formatting';

function formatSavedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function primaryTag(item: TrackerItem): string {
  if (item.opportunity.category) return item.opportunity.category;
  return item.opportunity.tags[0] ?? '';
}

export async function exportTrackerToXlsx(
  items: TrackerItem[],
  fileLabel = 'tracker',
): Promise<void> {
  const rows = items.map((item) => ({
    Title: item.opportunity.title,
    Company: item.opportunity.organization,
    Stage: TRACKER_STAGE_LABELS[item.stage],
    Deadline: formatDeadline(item.opportunity.deadline),
    'Date Saved': formatSavedDate(item.savedAt),
    Notes: item.notes,
    Category: primaryTag(item),
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'My Tracker');

  const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
  const fileName = `olives-${fileLabel}-${Date.now()}.xlsx`;

  if (Platform.OS === 'web') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const uri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Export My Tracker',
      UTI: 'com.microsoft.excel.xlsx',
    });
  }
}
