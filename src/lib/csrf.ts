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
      const token = await this.getCSRFToken();
      // Small delay to ensure token is properly set
      await new Promise(resolve => setTimeout(resolve, 50));
      return token;
    }
    console.log('CSRF: Using cached token:', csrfToken?.substring(0, 16) + '...');
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
      console.log('CSRF: Request headers being sent:', headers);

      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers
      });

      console.log(`CSRF: Response status: ${response.status}`);
      console.log('CSRF: Response headers:', Object.fromEntries(response.headers.entries()));

      // If 403 error, always retry once with fresh token (especially for incognito mode)
      if (response.status === 403) {
        console.log('CSRF: 403 error detected, clearing token and retrying with fresh token');
        this.clearToken();

        try {
          // Wait a bit to ensure any cookie operations complete
          await new Promise(resolve => setTimeout(resolve, 100));

          const newToken = await this.getCSRFToken();
          const retryHeaders = {
            ...options.headers,
            'X-CSRF-Token': newToken
          };

          console.log(`CSRF: Retrying ${method} request with fresh token:`, newToken?.substring(0, 16) + '...');
          console.log('CSRF: Retry headers:', retryHeaders);

          return fetch(url, {
            ...options,
            credentials: 'include',
            headers: retryHeaders
          });
        } catch (retryError) {
          console.error('CSRF: Error during retry:', retryError);
          // Return original response if retry fails
          return response;
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