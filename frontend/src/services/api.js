const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Universal API Request Helper
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Accept': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  // Handle params if passed in options
  let finalUrl = `${API_BASE_URL}${endpoint}`;
  if (options.params && typeof options.params === 'object') {
    const cleanParams = Object.fromEntries(
      Object.entries(options.params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const qs = new URLSearchParams(cleanParams).toString();
    if (qs) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs;
    }
  }

  const response = await fetch(finalUrl, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `API error: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Convenience helpers
apiRequest.get = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' });
apiRequest.post = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body });
apiRequest.put = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body });
apiRequest.patch = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body });
apiRequest.delete = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' });

export const api = apiRequest;
export default apiRequest;
