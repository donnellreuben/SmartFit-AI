import { useAuthStore } from '../authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('login', () => {
    it('should handle successful login', async () => {
      const { login } = useAuthStore.getState();
      
      await login('test@example.com', 'password123');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toBeDefined();
      expect(state.accessToken).toBeDefined();
      expect(state.refreshToken).toBeDefined();
      expect(state.error).toBeNull();
    });

    it('should handle login failure', async () => {
      const { login } = useAuthStore.getState();
      
      // Mock a failed login by using invalid credentials
      await login('invalid@example.com', 'wrongpassword');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should clear all auth data', async () => {
      const { login, logout } = useAuthStore.getState();
      
      // First login
      await login('test@example.com', 'password123');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      
      // Then logout
      logout();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const { login, refreshToken } = useAuthStore.getState();
      
      // First login
      await login('test@example.com', 'password123');
      const originalToken = useAuthStore.getState().accessToken;
      
      // Refresh token
      await refreshToken();
      
      const state = useAuthStore.getState();
      expect(state.accessToken).toBeDefined();
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const { login, clearError } = useAuthStore.getState();
      
      // Trigger an error
      await login('invalid@example.com', 'wrongpassword');
      expect(useAuthStore.getState().error).toBeDefined();
      
      // Clear error
      clearError();
      
      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });
});
