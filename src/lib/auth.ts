import { csrfAPI } from './csrf';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://micro-greens-backend.vercel.app';

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<User> {
    console.log('Auth: Making login API call to:', `${API_BASE}/api/auth/login`);
    console.log('Auth: Current origin:', window.location.origin);

    const response = await csrfAPI.fetchWithCSRF(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    console.log('Auth: Login response status:', response.status);
    console.log('Auth: Login response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Auth: Login error response:', errorText);

      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Login failed');
      } catch {
        throw new Error(`Login failed: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('Auth: Login successful, data:', data);

    // Check cookies after login
    setTimeout(() => {
      console.log('Auth: Cookies after login:', document.cookie);
    }, 100);

    return data.user;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('Auth: Getting current user from:', `${API_BASE}/api/auth/me`);
      console.log('Auth: Current origin:', window.location.origin);
      console.log('Auth: Document cookies:', document.cookie);

      // GET request doesn't need CSRF token
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include'
      });

      console.log('Auth: getCurrentUser response status:', response.status);
      console.log('Auth: getCurrentUser response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Auth: getCurrentUser error response:', errorText);
        return null;
      }

      const data = await response.json();
      console.log('Auth: getCurrentUser success, data:', data);
      return data.user;
    } catch (error) {
      console.error('Auth: getCurrentUser error caught:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    console.log('Auth: Logging out');

    try {
      const response = await csrfAPI.fetchWithCSRF(`${API_BASE}/api/auth/logout`, {
        method: 'POST'
      });

      console.log('Auth: Logout response status:', response.status);

      // Clear CSRF token on logout
      csrfAPI.clearToken();
    } catch (error) {
      console.error('Auth: Logout error:', error);
      // Clear CSRF token even on error
      csrfAPI.clearToken();
    }
  }
};