import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginAdmin } from '../services/admin';
import { updateSeller } from '../services/sellers';

const useAppStore = create(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      mobileSidebarOpen: false,
      openMobileSidebar: () => set({ mobileSidebarOpen: true }),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      user: null,
      token: null,
      setAuth: (user, token) => {
        try {
          if (token) {
            localStorage.setItem('token', token);
          } else {
            localStorage.removeItem('token');
          }
        } catch { /* ignore */ }
        set({ user, token });
      },
      logout: () => {
        try {
          localStorage.removeItem('token');
        } catch { /* ignore */ }
        set({ user: null, token: null });
      },
      loading: false,
      setLoading: (loading) => set({ loading }),
      isAuthenticated: () => !!get().token,
      // Async actions
      login: async (credentials) => {
        set({ loading: true });
        try {
          // Ensure no stale auth header interferes with login
          try {
            localStorage.removeItem('token');
            // Also clear from persisted Zustand store
            const persistedState = localStorage.getItem('app-store');
            if (persistedState) {
              try {
                const parsed = JSON.parse(persistedState);
                if (parsed?.state) {
                  parsed.state.token = null;
                  parsed.state.user = null;
                  localStorage.setItem('app-store', JSON.stringify(parsed));
                }
              } catch {
                // If we can't parse it, just remove it
                localStorage.removeItem('app-store');
              }
            }
          } catch { /* ignore */ }
          set({ token: null, user: null });

          const data = await loginAdmin({
            username: (credentials.username || '').trim(),
            password: credentials.password,
          });

          // Validate token exists
          if (!data || !data.token) {
            throw new Error('Login failed: No token received from server');
          }

          // Store token in both places for redundancy
          const token = data.token.trim();
          set({ user: data.user, token });
          try {
            localStorage.setItem('token', token);
            if (import.meta.env.DEV) {
              console.log('[Auth] Token stored successfully. Preview:', token.slice(0, 20) + '...');
            }
          } catch (e) {
            console.error('[Auth] Failed to store token in localStorage:', e);
          }
          return data;
        } catch (err) {
          // Extract detailed error message
          let message = 'Login failed';

          if (err.response) {
            // Server responded with error status
            const status = err.response.status;
            const errorData = err.response.data;

            // Handle 404 specifically - endpoint not found
            if (status === 404) {
              message = errorData?.message ||
                `Login endpoint not found (404). Please verify the backend server is running at ${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'} and the /api/admin/login endpoint exists.`;
            } else if (status === 401 || status === 403) {
              message = errorData?.message || errorData?.error || 'Invalid username or password.';
            } else if (status === 500) {
              console.error('Server Error (500) Details:', errorData);
              message = errorData?.message || errorData?.error ||
                'Server error occurred. Please check the backend logs.';
            } else {
              message =
                errorData?.message ||
                errorData?.error ||
                errorData?.detail ||
                `Server error: ${status} ${err.response.statusText}`;
            }
          } else if (err.request) {
            // Request was made but no response received
            message = 'No response from server. Please check if the backend is running at ' +
              (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000') + '.';
          } else {
            message = err.message || 'Login failed';
          }

          throw new Error(message);
        } finally {
          set({ loading: false });
        }
      },
      approveSeller: async (id) => {
        set({ loading: true });
        try {
          const data = await updateSeller(id, { approved: true });
          return data;
        } catch (err) {
          // Extract detailed error message
          let message = 'Failed to approve seller';

          if (err.response) {
            const errorData = err.response.data;
            message =
              errorData?.message ||
              errorData?.error ||
              errorData?.detail ||
              `Server error: ${err.response.status} ${err.response.statusText}`;

            if (err.response.status === 404) {
              message = errorData?.message || 'Seller not found';
            } else if (err.response.status === 401 || err.response.status === 403) {
              message = errorData?.message || errorData?.error || 'Unauthorized. Please log in again.';
            } else if (err.response.status === 500) {
              console.error('Server Error (500) Details:', errorData);
              message = errorData?.message || errorData?.error ||
                'Server error occurred. Please check the backend logs.';
            }
          } else if (err.request) {
            message = 'No response from server. Please check if the backend is running.';
          } else {
            message = err.message || 'Failed to approve seller';
          }

          throw new Error(message);
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: 'app-store' }
  )
);

export default useAppStore;
