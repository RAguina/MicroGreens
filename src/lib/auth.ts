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
    console.log('Making API call to:', `${API_BASE}/api/auth/login`);
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // CRÍTICO para JWT cookies
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    return data.user;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('getCurrentUser: Making request to:', `${API_BASE}/api/auth/me`);
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include'
      });
      
      console.log('getCurrentUser: Response status:', response.status);
      console.log('getCurrentUser: Response ok:', response.ok);
      
      if (!response.ok) {
        console.log('getCurrentUser: Response not ok, returning null');
        return null;
      }
      
      const data = await response.json();
      console.log('getCurrentUser: Response data:', data);
      return data.user;
    } catch (error) {
      console.error('getCurrentUser: Error caught:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  }
};