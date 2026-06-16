import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export class AttachmentTooLargeError extends Error {
  readonly maxBytes: number;

  constructor(maxBytes: number) {
    super(`File is too large. Maximum size is ${formatBytes(maxBytes)}.`);
    this.name = 'AttachmentTooLargeError';
    this.maxBytes = maxBytes;
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export async function assertAttachmentSize(uri: string, maxBytes: number): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    throw new Error('Could not read the selected file.');
  }
  const size = 'size' in info && typeof info.size === 'number' ? info.size : 0;
  if (size > maxBytes) {
    throw new AttachmentTooLargeError(maxBytes);
  }
  return size;
}

/** Read a local file URI into an ArrayBuffer for Supabase Storage upload. */
export async function readLocalAttachment(
  uri: string,
  maxBytes: number,
): Promise<{ data: ArrayBuffer; byteLength: number }> {
  // On web, expo-image-picker and expo-document-picker return blob: or data: URLs
  // that expo-file-system cannot read. Use fetch() instead.
  if (Platform.OS === 'web') {
    const resp = await fetch(uri);
    if (!resp.ok) throw new Error('Could not read the selected file.');
    const data = await resp.arrayBuffer();
    if (data.byteLength > maxBytes) throw new AttachmentTooLargeError(maxBytes);
    return { data, byteLength: data.byteLength };
  }

  await assertAttachmentSize(uri, maxBytes);

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const data = decode(base64);

  if (data.byteLength > maxBytes) {
    throw new AttachmentTooLargeError(maxBytes);
  }

  return { data, byteLength: data.byteLength };
}
