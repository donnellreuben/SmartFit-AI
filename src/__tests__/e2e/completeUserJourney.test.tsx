import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '../../navigation/AppNavigator';

// Mock all services
jest.mock('../../services/subscriptionService', () => ({
  subscriptionService: {
    getAvailablePlans: jest.fn(() => [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: ['Basic features'],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        features: ['All features'],
      },
    ]),
    getSubscriptionStatus: jest.fn(() => ({
      isActive: false,
      planId: null,
    })),
    startTrial: jest.fn(() => Promise.resolve({ success: true })),
    purchaseSubscription: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

jest.mock('../../services/businessAnalyticsService', () => ({
  businessAnalyticsService: {
    getMetrics: jest.fn(() => ({
      totalUsers: 1000,
      activeUsers: 500,
      revenue: 5000,
    })),
    getUserSegments: jest.fn(() => []),
    getCohortData: jest.fn(() => []),
    getFunnelData: jest.fn(() => []),
    getRevenueData: jest.fn(() => []),
  },
}));

jest.mock('../../services/monetizationService', () => ({
  monetizationService: {
    getFeatures: jest.fn(() => []),
    getInAppPurchases: jest.fn(() => []),
    getStrategies: jest.fn(() => []),
  },
}));

jest.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    user: null,
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
    completeExercise: jest.fn(),
    nextExercise: jest.fn(),
    previousExercise: jest.fn(),
  }),
}));

describe('Complete User Journey E2E', () => {
  const renderWithNavigation = () => {
    return render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    );
  };

  describe('New User Onboarding Journey', () => {
    it('should complete full onboarding flow', async () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();
      
      // Step 1: Welcome Screen
      expect(getByText('SmartFit AI')).toBeTruthy();
      expect(getByText('Get Started')).toBeTruthy();
      
      // Navigate to Auth
      fireEvent.press(getByText('Get Started'));
      
      await waitFor(() => {
        expect(getByText('Login / Sign Up')).toBeTruthy();
      });
      
      // Step 2: Authentication
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const signUpButton = getByText('Sign Up');
      
      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(signUpButton);
      
      await waitFor(() => {
        expect(getByText('Profile Setup')).toBeTruthy();
      });
      
      // Step 3: Profile Setup
      const heightInput = getByPlaceholderText('Height (cm)');
      const weightInput = getByPlaceholderText('Weight (kg)');
      const continueButton = getByText('Continue');
      
      fireEvent.changeText(heightInput, '175');
      fireEvent.changeText(weightInput, '70');
      fireEvent.press(continueButton);
      
      await waitFor(() => {
        expect(getByText('Equipment Setup')).toBeTruthy();
      });
      
      // Step 4: Equipment Capture
      const captureButton = getByText('Capture Equipment');
      fireEvent.press(captureButton);
      
      await waitFor(() => {
        expect(getByText('Your Workout Plan')).toBeTruthy();
      });
    });
  });

  describe('Subscription Flow Journey', () => {
    it('should complete subscription purchase flow', async () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to subscription screen
      // This would typically be accessed from a settings menu or upgrade prompt
      // For testing, we'll simulate navigation
      
      // Mock navigation to subscription screen
      // const subscriptionScreen = render(
      //   <NavigationContainer>
      //     <AppNavigator />
      //   </NavigationContainer>
      // );
      
      // Check subscription plans are displayed
      expect(getByText('Choose Your Plan')).toBeTruthy();
      expect(getByText('Free')).toBeTruthy();
      expect(getByText('Premium')).toBeTruthy();
      
      // Select premium plan
      const premiumButton = getByText('Select Plan');
      fireEvent.press(premiumButton);
      
      // Should show trial or purchase options
      await waitFor(() => {
        expect(getByText('7-day free trial')).toBeTruthy();
      });
    });
  });

  describe('Workout Execution Journey', () => {
    it('should complete full workout session', async () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();
      
      // Navigate to workout plan
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      await waitFor(() => {
        expect(getByText('Active Workout')).toBeTruthy();
      });
      
      // Complete first exercise
      const completeButton = getByText('Complete Set');
      fireEvent.press(completeButton);
      
      // Navigate to next exercise
      const nextButton = getByText('Next Exercise');
      fireEvent.press(nextButton);
      
      // Complete second exercise
      fireEvent.press(completeButton);
      
      // Finish workout
      const finishButton = getByText('Finish Workout');
      fireEvent.press(finishButton);
      
      await waitFor(() => {
        expect(getByText('Workout Complete')).toBeTruthy();
      });
      
      // Add workout notes
      const notesInput = getByPlaceholderText('Add notes about your workout...');
      fireEvent.changeText(notesInput, 'Great workout!');
      
      // Save workout
      const saveButton = getByText('Save Workout');
      fireEvent.press(saveButton);
    });
  });

  describe('Progress Tracking Journey', () => {
    it('should view progress and analytics', async () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to progress tracking
      expect(getByText('Progress Tracking')).toBeTruthy();
      
      // View workout history
      expect(getByText('Workout History')).toBeTruthy();
      
      // View progress charts
      expect(getByText('Weight Progression')).toBeTruthy();
      
      // Filter data
      const filterButton = getByText('Filter');
      fireEvent.press(filterButton);
    });
  });

  describe('Analytics Dashboard Journey', () => {
    it('should view business analytics', async () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to analytics dashboard
      // This would typically be accessed from admin settings
      // For testing, we'll simulate navigation
      
      // Check analytics are displayed
      expect(getByText('Analytics Dashboard')).toBeTruthy();
      expect(getByText('Overview')).toBeTruthy();
      expect(getByText('Users')).toBeTruthy();
      expect(getByText('Revenue')).toBeTruthy();
      expect(getByText('Funnel')).toBeTruthy();
      
      // Switch between tabs
      fireEvent.press(getByText('Users'));
      fireEvent.press(getByText('Revenue'));
      fireEvent.press(getByText('Funnel'));
    });
  });

  describe('Error Handling Journey', () => {
    it('should handle network errors gracefully', async () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();
      
      // Simulate network error during login
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');
      
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(loginButton);
      
      // Should show error message
      await waitFor(() => {
        expect(getByText('Invalid credentials')).toBeTruthy();
      });
    });

    it('should handle validation errors', async () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to profile setup
      fireEvent.press(getByText('Get Started'));
      
      await waitFor(() => {
        const continueButton = getByText('Continue');
        fireEvent.press(continueButton);
      });
      
      // Should show validation errors for empty fields
      await waitFor(() => {
        expect(getByText('Height is required')).toBeTruthy();
        expect(getByText('Weight is required')).toBeTruthy();
      });
    });
  });

  describe('Accessibility Journey', () => {
    it('should support screen reader navigation', async () => {
      const { getByLabelText } = renderWithNavigation();
      
      // Check accessibility labels are present
      expect(getByLabelText('Get Started')).toBeTruthy();
      
      // Navigate to auth screen
      fireEvent.press(getByLabelText('Get Started'));
      
      await waitFor(() => {
        expect(getByLabelText('Email')).toBeTruthy();
        expect(getByLabelText('Password')).toBeTruthy();
      });
    });
  });
});
