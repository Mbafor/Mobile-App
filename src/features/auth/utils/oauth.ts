import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { authApi } from '@/services/api/auth.api';
import { parseSupabaseError } from '@/utils/errors';

import type { OAuthProvider } from '@/features/auth/types';

WebBrowser.maybeCompleteAuthSession();

export function getAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'olivesforum',
    path: 'auth/callback',
  });
}

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  if (params.code) {
    const { data, error } = await authApi.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data.session;
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (accessToken && refreshToken) {
    const { data, error } = await authApi.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return data.session;
  }

  throw new Error('No auth credentials returned from provider');
}

export async function signInWithOAuthProvider(provider: OAuthProvider) {
  const redirectTo = getAuthRedirectUri();
  const { data, error } = await authApi.signInWithOAuth(provider, redirectTo);

  if (error) {
    throw new Error(parseSupabaseError(error).message);
  }

  if (!data?.url) {
    throw new Error('Could not start sign-in. Check Supabase OAuth configuration.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
  });

  if (result.type === 'cancel') {
    throw new Error('Sign-in was cancelled');
  }

  if (result.type !== 'success') {
    throw new Error('Sign-in failed');
  }

  return createSessionFromUrl(result.url);
}

export async function signInWithAppleNative() {
  if (Platform.OS !== 'ios') {
    return signInWithOAuthProvider('apple');
  }

  const available = await AppleAuthentication.isAvailableAsync();

  if (!available) {
    return signInWithOAuthProvider('apple');
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple Sign-In did not return an identity token');
  }

  const { data, error } = await authApi.signInWithAppleIdToken(credential.identityToken);

  if (error) {
    throw new Error(parseSupabaseError(error).message);
  }

  return data.session;
}
