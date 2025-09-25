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
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('basic functionality', () => {
    it('should be able to set loading state', () => {
      const { setLoading } = useAuthStore.getState();

      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should be able to clear error', () => {
      const { clearError } = useAuthStore.getState();

      // Set an error first
      useAuthStore.setState({ error: 'Test error' });
      expect(useAuthStore.getState().error).toBe('Test error');

      // Clear error
      clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should be able to logout', () => {
      const { logout } = useAuthStore.getState();

      // Set some state first
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'test@test.com',
          name: 'Test',
          createdAt: '2024-01-01',
        },
        tokens: {
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresAt: Date.now(),
        },
        isAuthenticated: true,
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Logout
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
