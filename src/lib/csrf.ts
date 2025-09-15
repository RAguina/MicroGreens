// CSRF Token management
let csrfToken: string | null = null;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://micro-greens-backend.vercel.app';

export const csrfAPI = {
  async getCSRFToken(): Promise<string> {
    const response = await fetch(`${API_BASE}/api/auth/csrf`, {
      credentials: 'include'
    });

    const token = response.headers.get('X-CSRF-Token');

    if (!token) {
      throw new Error('CSRF token not found in response headers - backend might need Access-Control-Expose-Headers');
    }

    csrfToken = token;
    return token;
  },

  getCachedToken(): string | null {
    return csrfToken;
  },

  async ensureToken(): Promise<string> {
    if (!csrfToken) {
      const token = await this.getCSRFToken();
      // Small delay to ensure token is properly set
      await new Promise(resolve => setTimeout(resolve, 50));
      return token;
    }
    return csrfToken;
  },

  clearToken(): void {
    csrfToken = null;
  },

  async fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
    const method = options.method || 'GET';

    // Only add CSRF token for mutating methods
    if (['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
      const token = await this.ensureToken();

      const headers = {
        ...options.headers,
        'X-CSRF-Token': token
      };

      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers
      });

      // If 403 error, always retry once with fresh token (especially for incognito mode)
      if (response.status === 403) {
        this.clearToken();

        try {
          // Wait a bit to ensure any cookie operations complete
          await new Promise(resolve => setTimeout(resolve, 100));

          const newToken = await this.getCSRFToken();
          const retryHeaders = {
            ...options.headers,
            'X-CSRF-Token': newToken
          };

          return fetch(url, {
            ...options,
            credentials: 'include',
            headers: retryHeaders
          });
        } catch (retryError) {
          // Return original response if retry fails
          return response;
        }
      }

      return response;
    } else {
      // GET requests don't need CSRF token
      return fetch(url, {
        ...options,
        credentials: 'include'
      });
    }
  }
};