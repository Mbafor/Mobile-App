import { env } from '@/config/env';

/**
 * HTTP client for making requests to the backend API.
 * Automatically uses the correct base URL:
 * - Expo on mobile: your machine's LAN IP (e.g., http://192.168.1.2:3000)
 * - Browser: localhost (e.g., http://localhost:3000)
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: Record<string, any> | FormData;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}

class HttpClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.API_BASE_URL;
  }

  /**
   * Get the full URL for an endpoint
   * @param endpoint - API endpoint (e.g., '/api/users')
   * @returns Full URL (e.g., 'http://192.168.1.2:3000/api/users')
   */
  private getUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  /**
   * Make an HTTP request to the API
   */
  async request<T = any>(
    endpoint: string,
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000,
    } = options;

    try {
      const url = this.getUrl(endpoint);
      
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      if (body) {
        if (body instanceof FormData) {
          // Remove Content-Type for FormData to let the browser set it
          delete (fetchOptions.headers as Record<string, any>)['Content-Type'];
          fetchOptions.body = body;
        } else {
          fetchOptions.body = JSON.stringify(body);
        }
      }

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      fetchOptions.signal = controller.signal;

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      let data: T | null = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (response.ok) {
        data = (await response.text()) as any;
      }

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          data: null,
          error: `HTTP ${response.status}: ${typeof data === 'object' && data && 'message' in data ? (data as any).message : response.statusText}`,
        };
      }

      return {
        ok: true,
        status: response.status,
        data,
        error: null,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      
      if (error.includes('abort')) {
        return {
          ok: false,
          status: 408,
          data: null,
          error: `Request timeout after ${timeout}ms. Make sure your API server is running at ${this.baseUrl}`,
        };
      }

      if (error.includes('Failed to fetch') || error.includes('Network')) {
        return {
          ok: false,
          status: 0,
          data: null,
          error: `Network error: Cannot reach ${this.baseUrl}. Make sure:\n1. Your API server is running\n2. Your mobile device is on the same Wi-Fi as your PC\n3. Your PC's firewall allows port ${env.API_PORT}`,
        };
      }

      return {
        ok: false,
        status: 0,
        data: null,
        error,
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: Record<string, any> | FormData, options?: Omit<HttpRequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: Record<string, any> | FormData, options?: Omit<HttpRequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: Record<string, any> | FormData, options?: Omit<HttpRequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const http = new HttpClient();
