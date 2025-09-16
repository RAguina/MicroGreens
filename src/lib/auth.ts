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
  async login(credentials: LoginCredentials): Promise<{ user: User; accessToken: string }> {
    const response = await csrfAPI.fetchWithCSRF(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorText = await response.text();

      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Login failed');
      } catch {
        throw new Error(`Login failed: ${response.status}`);
      }
    }

    const data = await response.json();

    return {
      user: data.user,
      accessToken: data.accessToken || data.token || ''
    };
  },

  async refreshToken(): Promise<{ user: User; accessToken: string } | null> {
    try {
      const response = await csrfAPI.fetchWithCSRF(`${API_BASE}/api/auth/refresh`, {
        method: 'POST'
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return {
        user: data.user,
        accessToken: data.accessToken || data.token || ''
      };
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // Try refresh first to get valid access token
      const refreshResult = await this.refreshToken();
      if (!refreshResult) {
        return null;
      }

      return refreshResult.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await csrfAPI.fetchWithCSRF(`${API_BASE}/api/auth/logout`, {
        method: 'POST'
      });

      // Clear CSRF token on logout
      csrfAPI.clearToken();
    } catch {
      // Clear CSRF token even on error
      csrfAPI.clearToken();
    }
  }
};