import axios from 'axios';

// Use absolute URL if provided, otherwise use relative path (for Vite proxy in dev)
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token if present
api.interceptors.request.use((config) => {
  try {
    // Try to get token from localStorage first
    let token = localStorage.getItem('token');

    // If no token in localStorage, try to get from Zustand store (if available)
    if (!token) {
      try {
        // Access Zustand store directly from localStorage (persisted state)
        const persistedState = localStorage.getItem('app-store');
        if (persistedState) {
          const parsed = JSON.parse(persistedState);
          token = parsed?.state?.token || null;
        }
      } catch (e) {
        // ignore
      }
    }

    // Trim and validate token before using
    if (token) {
      token = token.trim();
      if (token && token.length > 0) {
        // Ensure token doesn't already have "Bearer " prefix
        if (token.startsWith('Bearer ')) {
          token = token.substring(7).trim();
        }
        config.headers.Authorization = `Bearer ${token}`;

        // In dev mode, verify token looks like a JWT (has 3 parts separated by dots)
        if (import.meta.env.DEV) {
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.warn(
              '[API] Token does not appear to be a valid JWT format (expected 3 parts separated by dots)'
            );
          }
        }
      } else {
        // Token exists but is empty/whitespace
        if (import.meta.env.DEV) {
          console.warn('[API] Token found but is empty or whitespace only');
        }
      }
    } else {
      // No token found - this is expected for public endpoints but not for protected ones
      if (
        import.meta.env.DEV &&
        config.url &&
        !config.url.includes('/register') &&
        !config.url.includes('/login')
      ) {
        console.warn('[API] No token found for request:', config.method?.toUpperCase(), config.url);
      }
    }
  } catch (e) {
    // ignore
  }

  // Log request details in development (remove in production)
  if (import.meta.env.DEV) {
    const tokenPreview = (config.headers.Authorization || '').slice(0, 32);
    console.log('[API] →', config.method?.toUpperCase(), `${config.baseURL}${config.url}`, {
      hasAuth: !!config.headers.Authorization,
      tokenPreview: tokenPreview || '(no token)',
      data: config.data,
      params: config.params,
    });
  }

  return config;
});

// Response interceptor: handle common errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (import.meta.env.DEV) {
      console.error(
        '[API] ←',
        status,
        err.config?.method?.toUpperCase(),
        `${err.config?.baseURL || ''}${err.config?.url || ''}`,
        {
          data: err.response?.data,
          headers: err.response?.headers,
          hasAuth: !!err.config?.headers?.Authorization,
        }
      );
    }

    // Handle 401 Unauthorized - token might be missing, expired, or invalid
    if (status === 401) {
      const token = localStorage.getItem('token');
      if (!token || !token.trim()) {
        console.warn('[API] 401 Unauthorized: No token found in localStorage');
      } else {
        console.warn(
          '[API] 401 Unauthorized: Token may be expired or invalid. Token preview:',
          token.slice(0, 20) + '...'
        );

        // Clear potentially stale tokens from both storage locations
        try {
          localStorage.removeItem('token');
          // Also clear from Zustand persisted store
          const persistedState = localStorage.getItem('app-store');
          if (persistedState) {
            try {
              const parsed = JSON.parse(persistedState);
              if (parsed?.state) {
                parsed.state.token = null;
                parsed.state.user = null;
                localStorage.setItem('app-store', JSON.stringify(parsed));
              }
            } catch (e) {
              // If we can't parse it, just remove the whole thing
              localStorage.removeItem('app-store');
            }
          }
          console.warn('[API] Cleared stale token. Please log in again.');
        } catch (e) {
          console.error('[API] Error clearing token:', e);
        }
      }
    }

    // Do NOT auto-remove token on 401; surface error so caller can decide.
    return Promise.reject(err);
  }
);

export default api;
