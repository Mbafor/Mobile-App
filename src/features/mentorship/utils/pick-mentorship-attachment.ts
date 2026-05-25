import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

import {
  MENTORSHIP_ATTACHMENT_LIMITS,
  formatMaxAttachmentSize,
} from '@/features/mentorship/constants/attachments';
import { AttachmentTooLargeError } from '@/features/mentorship/utils/read-local-attachment';
import type { MentorshipMessageAttachmentType } from '@/types/domain/mentorship';

export type PickedAttachment = {
  uri: string;
  attachmentType: MentorshipMessageAttachmentType;
  fileName: string;
  mimeType?: string;
  fileSize?: number;
};

function validateSize(size: number | undefined, maxBytes: number): void {
  if (size != null && size > maxBytes) {
    throw new AttachmentTooLargeError(maxBytes);
  }
}

export async function pickPhotoFromLibrary(): Promise<PickedAttachment | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission required', 'Allow photo library access to share images.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing: false,
  });

  if (result.canceled || !result.assets[0]?.uri) return null;

  const asset = result.assets[0];
  validateSize(asset.fileSize, MENTORSHIP_ATTACHMENT_LIMITS.imageMaxBytes);

  const fileName = asset.fileName ?? `photo_${Date.now()}.jpg`;
  return {
    uri: asset.uri,
    attachmentType: 'image',
    fileName,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileSize: asset.fileSize,
  };
}

export async function pickPhotoFromCamera(): Promise<PickedAttachment | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission required', 'Allow camera access to take a photo.');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) return null;

  const asset = result.assets[0];
  validateSize(asset.fileSize, MENTORSHIP_ATTACHMENT_LIMITS.imageMaxBytes);

  return {
    uri: asset.uri,
    attachmentType: 'image',
    fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileSize: asset.fileSize,
  };
}

export async function pickDocument(): Promise<PickedAttachment | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;

  const asset = result.assets[0];
  validateSize(asset.size ?? undefined, MENTORSHIP_ATTACHMENT_LIMITS.fileMaxBytes);

  const fileName = asset.name ?? `file_${Date.now()}`;
  return {
    uri: asset.uri,
    attachmentType: 'file',
    fileName,
    mimeType: asset.mimeType ?? 'application/octet-stream',
    fileSize: asset.size ?? undefined,
  };
}

export function attachmentErrorMessage(e: unknown): string {
  if (e instanceof AttachmentTooLargeError) {
    return e.message;
  }
  if (e instanceof Error) {
    if (e.message.includes('User cancelled')) return '';
    return e.message;
  }
  return 'Could not attach this file. Try again.';
}

export function showAttachmentError(e: unknown): void {
  const msg = attachmentErrorMessage(e);
  if (!msg) return;
  const title = e instanceof AttachmentTooLargeError ? 'File too large' : 'Upload failed';
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${msg}`);
  } else {
    Alert.alert(title, msg);
  }
}

export function maxBytesForType(type: MentorshipMessageAttachmentType): number {
  return type === 'image'
    ? MENTORSHIP_ATTACHMENT_LIMITS.imageMaxBytes
    : MENTORSHIP_ATTACHMENT_LIMITS.fileMaxBytes;
}

export function sizeLimitLabel(type: MentorshipMessageAttachmentType): string {
  return formatMaxAttachmentSize(maxBytesForType(type));
}
