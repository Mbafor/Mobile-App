import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { applyAuthSession } from '@/features/auth/utils/apply-auth-session';
import { authApi } from '@/services/api/auth.api';
import { parseSupabaseError } from '@/utils/errors';

import type { OAuthProvider } from '@/features/auth/types';
import type { Session } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

export function getAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'olivesforum',
    path: 'auth/callback',
    preferLocalhost: true,
  });
}

/** True when the URL looks like an OAuth or magic-link callback. */
export function urlHasAuthCallbackParams(url: string): boolean {
  return /[?&#](code|access_token|error)=/.test(url);
}

/** @deprecated Use urlHasAuthCallbackParams */
export const urlHasAuthParams = urlHasAuthCallbackParams;

export async function createSessionFromUrl(url: string): Promise<Session | null> {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const authError = params.error;
  if (authError) {
    const description = params.error_description ?? authError;
    throw new Error(description);
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

  return null;
}

/** Parse callback URL, persist session, and hydrate the auth store. */
export async function completeOAuthFromUrl(url: string): Promise<Session | null> {
  const session = await createSessionFromUrl(url);
  if (session) {
    await applyAuthSession(session);
  }
  return session;
}

export async function signInWithOAuthProvider(provider: OAuthProvider): Promise<Session | null> {
  const redirectTo = getAuthRedirectUri();
  if (__DEV__) {
    console.info(`[auth] OAuth redirect URI (${provider}):`, redirectTo);
  }
  const { data, error } = await authApi.signInWithOAuth(provider, redirectTo);

  if (error) {
    throw new Error(parseSupabaseError(error).message);
  }

  if (!data?.url) {
    throw new Error('Could not start sign-in. Check Supabase OAuth configuration.');
  }

  // Web/desktop: full-page redirect; session is finished on /auth/callback.
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.location.assign(data.url);
    }
    return null;
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
  });

  if (result.type === 'cancel') {
    throw new Error('Sign-in was cancelled');
  }

  if (result.type !== 'success' || !result.url) {
    throw new Error('Sign-in failed');
  }

  return completeOAuthFromUrl(result.url);
}

export async function signInWithAppleNative(): Promise<Session | null> {
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

  if (data.session) {
    await applyAuthSession(data.session);
  }

  return data.session;
}
