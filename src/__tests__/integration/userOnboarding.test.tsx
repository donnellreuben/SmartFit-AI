import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '../../navigation/AppNavigator';

// Mock the stores
jest.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('../../store/userStore', () => ({
  useUserStore: () => ({
    user: null,
    isLoading: false,
    error: null,
    updateProfile: jest.fn(),
  }),
}));

jest.mock('../../store/workoutStore', () => ({
  useWorkoutStore: () => ({
    currentWorkout: null,
    activePlan: null,
    workoutHistory: [],
    isWorkoutActive: false,
    startWorkout: jest.fn(),
    endWorkout: jest.fn(),
  }),
}));

describe('User Onboarding Flow', () => {
  const renderWithNavigation = () => {
    return render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>,
    );
  };

  describe('Welcome Screen', () => {
    it('should render welcome screen initially', () => {
      const { getByText } = renderWithNavigation();

      expect(getByText('SmartFit AI')).toBeTruthy();
      expect(getByText('Get Started')).toBeTruthy();
    });

    it('should navigate to auth screen when get started is pressed', async () => {
      const { getByText } = renderWithNavigation();

      fireEvent.press(getByText('Get Started'));

      await waitFor(() => {
        expect(getByText('Login / Sign Up')).toBeTruthy();
      });
    });
  });

  describe('Authentication Flow', () => {
    it('should render auth screen with login form', async () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();

      // Navigate to auth screen
      fireEvent.press(getByText('Get Started'));

      await waitFor(() => {
        expect(getByText('Login / Sign Up')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByText('Login')).toBeTruthy();
        expect(getByText('Sign Up')).toBeTruthy();
      });
    });

    it('should handle login form submission', async () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();

      // Navigate to auth screen
      fireEvent.press(getByText('Get Started'));

      await waitFor(() => {
        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');
        const loginButton = getByText('Login');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent.press(loginButton);
      });
    });

    it('should handle sign up form submission', async () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();

      // Navigate to auth screen
      fireEvent.press(getByText('Get Started'));

      await waitFor(() => {
        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');
        const signUpButton = getByText('Sign Up');

        fireEvent.changeText(emailInput, 'newuser@example.com');
        fireEvent.changeText(passwordInput, 'newpassword123');
        fireEvent.press(signUpButton);
      });
    });
  });

  describe('Profile Setup Flow', () => {
    it('should render profile setup screen after authentication', async () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();

      // Navigate through auth flow
      fireEvent.press(getByText('Get Started'));

      await waitFor(() => {
        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');
        const loginButton = getByText('Login');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent.press(loginButton);
      });

      // Should navigate to profile setup
      await waitFor(() => {
        expect(getByText('Profile Setup')).toBeTruthy();
        expect(getByPlaceholderText('Height (cm)')).toBeTruthy();
        expect(getByPlaceholderText('Weight (kg)')).toBeTruthy();
      });
    });

    it('should handle profile setup form submission', async () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();

      // Navigate to profile setup
      fireEvent.press(getByText('Get Started'));

      await waitFor(() => {
        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');
        const loginButton = getByText('Login');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent.press(loginButton);
      });

      await waitFor(() => {
        const heightInput = getByPlaceholderText('Height (cm)');
        const weightInput = getByPlaceholderText('Weight (kg)');
        const continueButton = getByText('Continue');

        fireEvent.changeText(heightInput, '175');
        fireEvent.changeText(weightInput, '70');
        fireEvent.press(continueButton);
      });
    });
  });

  describe('Equipment Capture Flow', () => {
    it('should render equipment capture screen after profile setup', async () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();

      // Navigate through complete flow
      fireEvent.press(getByText('Get Started'));

      await waitFor(() => {
        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');
        const loginButton = getByText('Login');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent.press(loginButton);
      });

      await waitFor(() => {
        const heightInput = getByPlaceholderText('Height (cm)');
        const weightInput = getByPlaceholderText('Weight (kg)');
        const continueButton = getByText('Continue');

        fireEvent.changeText(heightInput, '175');
        fireEvent.changeText(weightInput, '70');
        fireEvent.press(continueButton);
      });

      // Should navigate to equipment capture
      await waitFor(() => {
        expect(getByText('Equipment Setup')).toBeTruthy();
        expect(getByText('Capture Equipment')).toBeTruthy();
      });
    });

    it('should handle equipment capture', async () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();

      // Navigate to equipment capture
      fireEvent.press(getByText('Get Started'));

      await waitFor(() => {
        const emailInput = getByPlaceholderText('Email');
        const passwordInput = getByPlaceholderText('Password');
        const loginButton = getByText('Login');

        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        fireEvent.press(loginButton);
      });

      await waitFor(() => {
        const heightInput = getByPlaceholderText('Height (cm)');
        const weightInput = getByPlaceholderText('Weight (kg)');
        const continueButton = getByText('Continue');

        fireEvent.changeText(heightInput, '175');
        fireEvent.changeText(weightInput, '70');
        fireEvent.press(continueButton);
      });

      await waitFor(() => {
        const captureButton = getByText('Capture Equipment');
        fireEvent.press(captureButton);
      });
    });
  });
});
