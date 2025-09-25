import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '../../navigation/AppNavigator';

// Mock the stores
jest.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    isLoading: false,
    error: null,
    user: { id: '1', email: 'test@example.com' },
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('../../store/userStore', () => ({
  useUserStore: () => ({
    user: { id: '1', email: 'test@example.com', height: 175, weight: 70 },
    isLoading: false,
    error: null,
    updateProfile: jest.fn(),
  }),
}));

jest.mock('../../store/workoutStore', () => ({
  useWorkoutStore: () => ({
    currentWorkout: null,
    activePlan: {
      id: '1',
      name: 'Test Workout Plan',
      exercises: [
        {
          exerciseId: '1',
          name: 'Push-ups',
          sets: 3,
          reps: '10',
          restTime: 60,
          completed: false,
        },
        {
          exerciseId: '2',
          name: 'Squats',
          sets: 3,
          reps: '15',
          restTime: 60,
          completed: false,
        },
      ],
    },
    workoutHistory: [],
    isWorkoutActive: false,
    startWorkout: jest.fn(),
    endWorkout: jest.fn(),
    completeExercise: jest.fn(),
    nextExercise: jest.fn(),
    previousExercise: jest.fn(),
  }),
}));

describe('Workout Flow Integration', () => {
  const renderWithNavigation = () => {
    return render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    );
  };

  describe('Workout Plan Screen', () => {
    it('should render workout plan screen with exercises', () => {
      const { getByText } = renderWithNavigation();
      
      expect(getByText('Your Workout Plan')).toBeTruthy();
      expect(getByText('Test Workout Plan')).toBeTruthy();
      expect(getByText('Push-ups')).toBeTruthy();
      expect(getByText('Squats')).toBeTruthy();
    });

    it('should display exercise details', () => {
      const { getByText } = renderWithNavigation();
      
      expect(getByText('3 sets')).toBeTruthy();
      expect(getByText('10 reps')).toBeTruthy();
      expect(getByText('60s rest')).toBeTruthy();
    });

    it('should handle start workout button', () => {
      const { getByText } = renderWithNavigation();
      
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
    });

    it('should handle generate AI plan button', () => {
      const { getByText } = renderWithNavigation();
      
      const generateButton = getByText('Generate AI Plan');
      fireEvent.press(generateButton);
    });
  });

  describe('Active Workout Screen', () => {
    it('should render active workout screen when workout is started', () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to workout plan
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      // Should navigate to active workout screen
      expect(getByText('Active Workout')).toBeTruthy();
    });

    it('should display current exercise information', () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to active workout
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      expect(getByText('Push-ups')).toBeTruthy();
      expect(getByText('Set 1 of 3')).toBeTruthy();
      expect(getByText('10 reps')).toBeTruthy();
    });

    it('should handle exercise completion', () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to active workout
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      const completeButton = getByText('Complete Set');
      fireEvent.press(completeButton);
    });

    it('should handle next exercise navigation', () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to active workout
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      const nextButton = getByText('Next Exercise');
      fireEvent.press(nextButton);
    });

    it('should handle previous exercise navigation', () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to active workout
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      const previousButton = getByText('Previous Exercise');
      fireEvent.press(previousButton);
    });

    it('should handle workout completion', () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to active workout
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      const finishButton = getByText('Finish Workout');
      fireEvent.press(finishButton);
    });
  });

  describe('Workout Summary Screen', () => {
    it('should render workout summary after completion', () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate through workout flow
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      const finishButton = getByText('Finish Workout');
      fireEvent.press(finishButton);
      
      // Should navigate to workout summary
      expect(getByText('Workout Complete')).toBeTruthy();
    });

    it('should display workout statistics', () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to workout summary
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      const finishButton = getByText('Finish Workout');
      fireEvent.press(finishButton);
      
      expect(getByText('Workout Summary')).toBeTruthy();
      expect(getByText('Duration')).toBeTruthy();
      expect(getByText('Exercises Completed')).toBeTruthy();
      expect(getByText('Calories Burned')).toBeTruthy();
    });

    it('should handle workout notes', () => {
      const { getByText, getByPlaceholderText } = renderWithNavigation();
      
      // Navigate to workout summary
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      const finishButton = getByText('Finish Workout');
      fireEvent.press(finishButton);
      
      const notesInput = getByPlaceholderText('Add notes about your workout...');
      fireEvent.changeText(notesInput, 'Great workout!');
    });

    it('should handle save workout', () => {
      const { getByText } = renderWithNavigation();
      
      // Navigate to workout summary
      const startButton = getByText('Start Workout');
      fireEvent.press(startButton);
      
      const finishButton = getByText('Finish Workout');
      fireEvent.press(finishButton);
      
      const saveButton = getByText('Save Workout');
      fireEvent.press(saveButton);
    });
  });

  describe('Progress Tracking Screen', () => {
    it('should render progress tracking screen', () => {
      const { getByText } = renderWithNavigation();
      
      expect(getByText('Progress Tracking')).toBeTruthy();
    });

    it('should display workout history', () => {
      const { getByText } = renderWithNavigation();
      
      expect(getByText('Workout History')).toBeTruthy();
    });

    it('should display progress charts', () => {
      const { getByText } = renderWithNavigation();
      
      expect(getByText('Weight Progression')).toBeTruthy();
    });

    it('should handle filter options', () => {
      const { getByText } = renderWithNavigation();
      
      const filterButton = getByText('Filter');
      fireEvent.press(filterButton);
    });
  });
});
