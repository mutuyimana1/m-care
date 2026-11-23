import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type ApiUser = { email: string; name: string; role: 'mother' | 'doctor' | 'chw' };
export type AuthResponse = { user: ApiUser; token: string };

function getApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) {
    if (Platform.OS !== 'web' && (configured.includes('localhost') || configured.includes('127.0.0.1'))) {
      const host = Constants.expoConfig?.hostUri?.split(':')[0];
      if (host) {
        return configured.replace('localhost', host).replace('127.0.0.1', host);
      }
    }
    return configured;
  }
  const host = (Platform.OS !== 'web' && Constants.expoConfig?.hostUri?.split(':')[0]) || 'localhost';
  return `http://${host}:8000/api.php`;
}

const API_URL = getApiUrl();
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(action: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}?action=${action}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Could not connect to server at ${API_URL}. Ensure the backend is running and your device is on the same network.`,
    );
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
  return result as T;
}

export const api = {
  signIn: (email: string, password: string) =>
    request<AuthResponse>('login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signUp: (name: string, email: string, password: string) =>
    request<AuthResponse>('signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  signOut: () => request<{ ok: boolean }>('logout', { method: 'POST', body: '{}' }),
  listRecords: async <T,>(type: string): Promise<T[]> => {
    const result = await request<{ records: T[] }>(`records&type=${encodeURIComponent(type)}`);
    return result.records;
  },
  createRecord: <T,>(type: string, record: T) =>
    request<{ record: T }>('records', { method: 'POST', body: JSON.stringify({ type, record }) }),
  updateRecord: <T extends { id: string }>(type: string, record: T) =>
    request<{ record: T }>(`records&type=${encodeURIComponent(type)}&id=${encodeURIComponent(record.id)}`, {
      method: 'PATCH', body: JSON.stringify({ record }),
    }),
};
