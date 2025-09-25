import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call (reduced for testing)
          await new Promise(resolve => setTimeout(resolve, 10));

          // Mock credential validation
          if (email === 'invalid@example.com' || password === 'wrongpassword') {
            throw new Error('Invalid credentials');
          }

          // Mock successful login
          const user: User = {
            id: '1',
            email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString(),
          };

          const tokens: AuthTokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresAt: Date.now() + 3600000, // 1 hour
          };

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Login failed. Please try again.',
          });
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call (reduced for testing)
          await new Promise(resolve => setTimeout(resolve, 10));

          // Mock successful registration
          const user: User = {
            id: '1',
            email,
            name,
            createdAt: new Date().toISOString(),
          };

          const tokens: AuthTokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresAt: Date.now() + 3600000, // 1 hour
          };

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Registration failed. Please try again.',
          });
        }
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshToken: async () => {
        const { tokens } = get();
        if (!tokens) return;

        try {
          // Simulate token refresh (reduced for testing)
          await new Promise(resolve => setTimeout(resolve, 10));

          const newTokens: AuthTokens = {
            accessToken: 'new-mock-access-token',
            refreshToken: 'new-mock-refresh-token',
            expiresAt: Date.now() + 3600000,
          };

          set({ tokens: newTokens });
        } catch (error) {
          set({ error: 'Token refresh failed' });
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setUser: (user: User) => set({ user }),
      setTokens: (tokens: AuthTokens) => set({ tokens }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
