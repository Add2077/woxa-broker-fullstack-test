import { User } from '@/types/broker';

const tokenKey = 'woxa_access_token';
const userKey = 'woxa_user';

export function saveSession(accessToken: string, user: User) {
  localStorage.setItem(tokenKey, accessToken);
  localStorage.setItem(userKey, JSON.stringify(user));
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(tokenKey);
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(userKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
}
