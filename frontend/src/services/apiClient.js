const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is required');
}

/**
 * Get CSRF token from cookies
 */
function getCsrfToken() {
  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
}

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.csrfToken = null;
  }

  /**
   * Ensure we have a CSRF token before state-changing requests
   */
  async ensureCsrfToken() {
    if (!this.csrfToken) {
      this.csrfToken = getCsrfToken();
    }
    
    if (!this.csrfToken) {
      // Make a GET request to obtain CSRF token
      await fetch(`${this.baseUrl}/api/auth/csrf`, {
        credentials: 'include',
      });
      this.csrfToken = getCsrfToken();
    }
    
    return this.csrfToken;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
      const csrfToken = await this.ensureCsrfToken();
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
    }

    const config = {
      credentials: 'include', // Send cookies for auth
      headers,
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    
    // Update CSRF token from response if present
    const newCsrfToken = response.headers.get('X-CSRF-Token');
    if (newCsrfToken) {
      this.csrfToken = newCsrfToken;
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new ApiError(response.status, error.message || 'Request failed', error);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = new ApiClient(API_URL);
export default apiClient;
