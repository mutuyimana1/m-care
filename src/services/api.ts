export type ApiUser = { email: string; name: string; role: 'mother' | 'doctor' | 'chw' };
export type AuthResponse = { user: ApiUser; token: string };

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api.php';
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(action: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}?action=${action}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
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
