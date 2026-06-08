import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'inexia_token';
const USER_KEY = 'inexia_user';

function getWebStorage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function saveUser(user: unknown) {
  const payload = JSON.stringify(user);

  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(USER_KEY, payload);
    return;
  }

  await SecureStore.setItemAsync(USER_KEY, payload);
}

export async function getToken() {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(TOKEN_KEY) ?? null;
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getUser<T = unknown>() {
  const user =
    Platform.OS === 'web'
      ? getWebStorage()?.getItem(USER_KEY) ?? null
      : await SecureStore.getItemAsync(USER_KEY);

  return user ? (JSON.parse(user) as T) : null;
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function clearUser() {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(USER_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(USER_KEY);
}
