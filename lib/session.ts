import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "loop_access_token";
const EXPIRES_AT_KEY = "loop_access_expires_at";
const USER_KEY = "loop_user";

export type StoredUser = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
};

export async function saveSession(data: {
  accessToken: string;
  expiresAt?: string;
  user?: StoredUser;
}) {
  const items: [string, string][] = [[ACCESS_TOKEN_KEY, data.accessToken]];
  if (data.expiresAt) {
    items.push([EXPIRES_AT_KEY, data.expiresAt]);
  }
  if (data.user) {
    items.push([USER_KEY, JSON.stringify(data.user)]);
  }
  await AsyncStorage.multiSet(items);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, EXPIRES_AT_KEY, USER_KEY]);
}
