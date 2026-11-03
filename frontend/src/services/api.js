const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.') || window.location.port === '5173'))
  ? 'http://127.0.0.1:8000/api/v1'
  : (import.meta.env.VITE_API_URL || 'https://powderblue-trout-993647.hostingersite.com/api/v1');

// In-flight request deduplication map: key -> Promise
const inFlightRequests = new Map();

// Client-side TTL reference cache: key -> { data, expiresAt }
const referenceCache = new Map();

// Shared reference endpoint patterns that are safe to cache for 120 seconds
const CACHEABLE_PATTERNS = [
  /\/admin\/academic\/classes/,
  /\/academic\/classes/,
  /\/admin\/academic\/subjects/,
  /\/leave-types/,
  /\/hr\/leave-types/,
  /\/admin\/fee-structures/,
  /\/academic-years/,
  /\/schools\/branches/,
];

const DEFAULT_CACHE_TTL_MS = 120 * 1000; // 2 minutes

function isReferenceEndpoint(url) {
  return CACHEABLE_PATTERNS.some((pat) => pat.test(url));
}

function invalidateCacheForMutation(endpoint) {
  const ep = endpoint.toLowerCase();
  for (const key of referenceCache.keys()) {
    const k = key.toLowerCase();
    if (
      (ep.includes('class') && k.includes('class')) ||
      (ep.includes('subject') && k.includes('subject')) ||
      (ep.includes('leave') && k.includes('leave')) ||
      (ep.includes('fee') && k.includes('fee')) ||
      (ep.includes('year') && k.includes('year')) ||
      (ep.includes('branch') && k.includes('branch')) ||
      (ep.includes('admission') && (k.includes('admission') || k.includes('student')))
    ) {
      referenceCache.delete(key);
    }
  }
}

/**
 * Universal API Request Helper with In-flight Deduplication & Reference Caching
 */
export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const token = localStorage.getItem('auth_token');
  const activeSchoolId = localStorage.getItem('active_school_id');
  const activeAcademicYearId = localStorage.getItem('active_academic_year_id');
  const activeLang = localStorage.getItem('app_language') || 'en';

  const headers = {
    'Accept': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    'Accept-Language': activeLang,
    ...(activeSchoolId ? { 'X-School-Id': activeSchoolId } : {}),
    ...(activeAcademicYearId ? { 'X-Academic-Year-Id': activeAcademicYearId } : {}),
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    method,
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

  // Cache key incorporates method, URL, and tenant scope context
  const cacheKey = `${method}:${finalUrl}:S${activeSchoolId || 'default'}:Y${activeAcademicYearId || 'default'}`;

  // 1. Check client-side memory cache for GET reference requests (unless bypassCache is true)
  if (method === 'GET' && !options.bypassCache && isReferenceEndpoint(finalUrl)) {
    const cached = referenceCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
  }

  // 2. Deduplicate in-flight GET requests
  if (method === 'GET' && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Invalidate relevant caches on mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    invalidateCacheForMutation(endpoint);
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(finalUrl, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `API error: ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      // Populate reference cache on successful GET
      if (method === 'GET' && isReferenceEndpoint(finalUrl)) {
        referenceCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + (options.cacheTtlMs || DEFAULT_CACHE_TTL_MS),
        });
      }

      // Dispatch action event on state-changing operations
      if (typeof window !== 'undefined') {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !endpoint.includes('/notifications')) {
          window.dispatchEvent(
            new CustomEvent('app:action-performed', {
              detail: { endpoint, method, timestamp: Date.now() },
            })
          );
        }
      }

      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  if (method === 'GET') {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

/**
 * Manually clear the client-side API memory cache
 */
export function clearApiCache(endpointFilter = null) {
  if (!endpointFilter) {
    referenceCache.clear();
  } else {
    for (const key of referenceCache.keys()) {
      if (key.includes(endpointFilter)) {
        referenceCache.delete(key);
      }
    }
  }
}

/**
 * Manually trigger a notification refresh across the application
 */
export function triggerNotificationRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:notification-refresh'));
  }
}

// Convenience helpers
apiRequest.get = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' });
apiRequest.post = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body });
apiRequest.put = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body });
apiRequest.patch = (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body });
apiRequest.delete = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' });

export const api = apiRequest;
export default apiRequest;
