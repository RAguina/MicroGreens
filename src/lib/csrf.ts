// CSRF Token management
let csrfToken: string | null = null;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://micro-greens-backend.vercel.app';

export const csrfAPI = {
  async getCSRFToken(): Promise<string> {
    console.log('CSRF: Getting token from /api/auth/csrf endpoint');

    const response = await fetch(`${API_BASE}/api/auth/csrf`, {
      credentials: 'include'
    });

    console.log('CSRF: Response headers:', Object.fromEntries(response.headers.entries()));

    const token = response.headers.get('X-CSRF-Token');
    console.log('CSRF: Token received:', token ? 'YES' : 'NO');

    if (!token) {
      console.error('CSRF: No token in headers. Available headers:', [...response.headers.keys()]);
      throw new Error('CSRF token not found in response headers - backend might need Access-Control-Expose-Headers');
    }

    csrfToken = token;
    console.log('CSRF: Token stored');
    return token;
  },

  getCachedToken(): string | null {
    return csrfToken;
  },

  async ensureToken(): Promise<string> {
    if (!csrfToken) {
      console.log('CSRF: No cached token, fetching new one');
      return await this.getCSRFToken();
    }
    console.log('CSRF: Using cached token');
    return csrfToken;
  },

  clearToken(): void {
    console.log('CSRF: Clearing cached token');
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

      console.log(`CSRF: Making ${method} request to ${url} with token`);

      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers
      });

      // If CSRF error, clear token and retry once
      if (response.status === 403) {
        const errorText = await response.text();
        if (errorText.includes('CSRF') || errorText.includes('token')) {
          console.log('CSRF: Token invalid, clearing and retrying');
          this.clearToken();

          const newToken = await this.getCSRFToken();
          const retryHeaders = {
            ...options.headers,
            'X-CSRF-Token': newToken
          };

          console.log(`CSRF: Retrying ${method} request with new token`);
          return fetch(url, {
            ...options,
            credentials: 'include',
            headers: retryHeaders
          });
        }
      }

      return response;
    } else {
      // GET requests don't need CSRF token
      console.log(`CSRF: Making ${method} request to ${url} (no token needed)`);
      return fetch(url, {
        ...options,
        credentials: 'include'
      });
    }
  }
};