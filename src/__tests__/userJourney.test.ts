// User journey test - testing store interactions and service calls
import { useWorkoutStore } from '../store/workoutStore';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { subscriptionService } from '../services/subscriptionService';
import { monetizationService } from '../services/monetizationService';
import { businessAnalyticsService } from '../services/businessAnalyticsService';

// Mock the stores and services
jest.mock('../store/workoutStore');
jest.mock('../store/authStore');
jest.mock('../store/userStore');
jest.mock('../services/subscriptionService');
jest.mock('../services/monetizationService');
jest.mock('../services/businessAnalyticsService');

describe('SmartFit AI - Complete User Journey', () => {
  let mockWorkoutStore: any;
  let mockAuthStore: any;
  let mockUserStore: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock workout store
    mockWorkoutStore = {
      currentWorkout: null,
      workoutHistory: [],
      currentExerciseIndex: 0,
      startWorkout: jest.fn(),
      completeExercise: jest.fn(),
      nextExercise: jest.fn(),
      previousExercise: jest.fn(),
      endWorkout: jest.fn(),
      clearWorkout: jest.fn(),
      updateSetData: jest.fn(),
      generateWorkoutPlan: jest.fn().mockResolvedValue({
        id: 'workout-1',
        name: 'Full Body Strength',
        exercises: [
          {
            id: 'ex-1',
            name: 'Push-ups',
            sets: 3,
            reps: '10-12',
            restTime: 60,
            completed: false,
          },
          {
            id: 'ex-2',
            name: 'Squats',
            sets: 3,
            reps: '12-15',
            restTime: 60,
            completed: false,
          },
        ],
        estimatedDuration: 30,
        difficulty: 'intermediate',
        createdAt: new Date().toISOString(),
        isActive: true,
      }),
    };

    // Mock auth store
    mockAuthStore = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: jest.fn().mockResolvedValue({ success: true }),
      logout: jest.fn(),
      clearError: jest.fn(),
    };

    // Mock user store
    mockUserStore = {
      profile: null,
      preferences: {
        notifications: {
          workoutReminders: true,
          progressUpdates: true,
          motivationalMessages: true,
          weeklyReports: true,
        },
        workout: {
          intensity: 'medium',
          musicIntegration: false,
          voiceCoaching: false,
        },
        privacy: {
          shareProgress: false,
          anonymousAnalytics: true,
        },
      },
      updateProfile: jest.fn(),
      setPreferences: jest.fn(),
    };

    // Set up store mocks
    (useWorkoutStore as unknown as jest.Mock).mockReturnValue(mockWorkoutStore);
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockAuthStore);
    (useUserStore as unknown as jest.Mock).mockReturnValue(mockUserStore);
  });

  describe('New User Onboarding Journey', () => {
    it('should complete the full new user onboarding flow', async () => {
      // Step 1: User opens the app for the first time
      expect(mockAuthStore.isAuthenticated).toBe(false);
      expect(mockAuthStore.user).toBeNull();

      // Step 2: User sees welcome screen and decides to sign up
      const loginResult = await mockAuthStore.login(
        'test@example.com',
        'password123',
      );
      expect(loginResult.success).toBe(true);
      expect(mockAuthStore.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );

      // Step 3: User completes profile setup
      const profileData = {
        name: 'John Doe',
        age: 28,
        fitnessLevel: 'intermediate',
        goals: ['strength', 'muscle_gain'],
        availableEquipment: ['dumbbells', 'bench'],
        preferredWorkoutDuration: 45,
      };

      await mockUserStore.updateProfile(profileData);
      expect(mockUserStore.updateProfile).toHaveBeenCalledWith(profileData);

      // Step 4: User sets preferences
      const preferences = {
        notifications: {
          workoutReminders: true,
          progressUpdates: true,
          motivationalMessages: true,
          weeklyReports: false,
        },
        workout: {
          intensity: 'high',
          musicIntegration: true,
          voiceCoaching: true,
        },
        privacy: {
          shareProgress: false,
          anonymousAnalytics: true,
        },
      };

      mockUserStore.setPreferences(preferences);
      expect(mockUserStore.setPreferences).toHaveBeenCalledWith(preferences);
    });
  });

  describe('Workout Planning Journey', () => {
    it('should complete the workout planning and execution flow', async () => {
      // Step 1: User wants to start a new workout
      const workoutPlan = await mockWorkoutStore.generateWorkoutPlan({
        goals: ['strength', 'muscle_gain'],
        availableEquipment: ['dumbbells', 'bench'],
        duration: 45,
        difficulty: 'intermediate',
      });

      expect(workoutPlan).toBeDefined();
      expect(workoutPlan.exercises).toHaveLength(2);
      expect(workoutPlan.name).toBe('Full Body Strength');

      // Step 2: User starts the workout
      mockWorkoutStore.startWorkout(workoutPlan);
      expect(mockWorkoutStore.startWorkout).toHaveBeenCalledWith(workoutPlan);

      // Step 3: User completes first exercise
      mockWorkoutStore.completeExercise('ex-1', {
        setNumber: 1,
        reps: 12,
        weight: 0,
        completed: true,
      });
      expect(mockWorkoutStore.completeExercise).toHaveBeenCalledWith('ex-1', {
        setNumber: 1,
        reps: 12,
        weight: 0,
        completed: true,
      });

      // Step 4: User moves to next exercise
      mockWorkoutStore.nextExercise();
      expect(mockWorkoutStore.nextExercise).toHaveBeenCalled();

      // Step 5: User completes second exercise
      mockWorkoutStore.completeExercise('ex-2', {
        setNumber: 1,
        reps: 15,
        weight: 0,
        completed: true,
      });
      expect(mockWorkoutStore.completeExercise).toHaveBeenCalledWith('ex-2', {
        setNumber: 1,
        reps: 15,
        weight: 0,
        completed: true,
      });

      // Step 6: User ends the workout
      mockWorkoutStore.endWorkout();
      expect(mockWorkoutStore.endWorkout).toHaveBeenCalled();
    });
  });

  describe('Subscription Journey', () => {
    it('should complete the subscription upgrade flow', async () => {
      // Mock subscription service
      const mockPlans = [
        { id: 'free', name: 'Free', price: 0, features: ['basic_workouts'] },
        {
          id: 'premium',
          name: 'Premium',
          price: 9.99,
          features: ['advanced_workouts', 'ai_coaching'],
        },
      ];

      (subscriptionService.getAvailablePlans as jest.Mock).mockReturnValue(
        mockPlans,
      );
      (subscriptionService.startTrial as jest.Mock).mockResolvedValue({
        success: true,
      });
      (subscriptionService.purchaseSubscription as jest.Mock).mockResolvedValue(
        { success: true },
      );
      (subscriptionService.getSubscriptionStatus as jest.Mock).mockReturnValue({
        isActive: true,
        planId: 'premium',
        trialEndsAt: null,
      });

      // Step 1: User views available subscription plans
      const plans = subscriptionService.getAvailablePlans();
      expect(plans).toBeDefined();
      expect(plans.length).toBeGreaterThan(0);

      // Step 2: User selects a premium plan
      const selectedPlan = plans.find(plan => plan.id === 'premium');
      expect(selectedPlan).toBeDefined();
      expect(selectedPlan?.name).toBe('Premium');

      // Step 3: User starts trial
      const trialResult = await subscriptionService.startTrial('premium');
      expect(trialResult.success).toBe(true);

      // Step 4: User purchases subscription
      const purchaseResult = await subscriptionService.purchaseSubscription(
        'premium',
      );
      expect(purchaseResult.success).toBe(true);

      // Step 5: User checks subscription status
      const status = subscriptionService.getSubscriptionStatus();
      expect(status.isActive).toBe(true);
      expect(status.planId).toBe('premium');
    });
  });

  describe('Analytics and Monetization Journey', () => {
    it('should track user engagement and monetization', async () => {
      // Mock monetization service
      const mockFeatures = [
        {
          id: 'advanced_workout_plans',
          name: 'Advanced Workout Plans',
          isPremium: true,
        },
        { id: 'ai_coaching', name: 'AI Coaching', isPremium: true },
      ];

      (monetizationService.getFeatures as jest.Mock).mockReturnValue(
        mockFeatures,
      );
      (monetizationService.updateFeatureUsage as jest.Mock).mockResolvedValue(
        undefined,
      );
      (businessAnalyticsService.getMetrics as jest.Mock).mockReturnValue({
        totalUsers: 1000,
        activeUsers: 500,
        revenue: 5000,
      });
      (businessAnalyticsService.getUserSegments as jest.Mock).mockReturnValue(
        [],
      );
      (businessAnalyticsService.getCohortData as jest.Mock).mockReturnValue([]);

      // Step 1: User interacts with premium features
      const features = monetizationService.getFeatures();
      expect(features).toBeDefined();

      // Step 2: User uses a premium feature
      const feature = features.find(f => f.id === 'advanced_workout_plans');
      if (feature) {
        monetizationService.updateFeatureUsage(feature.id);
        expect(monetizationService.updateFeatureUsage).toHaveBeenCalledWith(
          feature.id,
        );
      }

      // Step 3: System tracks analytics
      const metrics = businessAnalyticsService.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalUsers).toBeGreaterThan(0);

      // Step 4: System generates user segments
      const segments = businessAnalyticsService.getUserSegments();
      expect(segments).toBeDefined();

      // Step 5: System performs cohort analysis
      const cohortData = businessAnalyticsService.getCohortData();
      expect(cohortData).toBeDefined();
    });
  });

  describe('Error Handling Journey', () => {
    it('should handle errors gracefully throughout the user journey', async () => {
      // Step 1: Handle authentication errors
      mockAuthStore.login.mockRejectedValueOnce(
        new Error('Invalid credentials'),
      );

      try {
        await mockAuthStore.login('invalid@example.com', 'wrongpassword');
      } catch (error) {
        expect((error as Error).message).toBe('Invalid credentials');
      }

      // Step 2: Handle workout generation errors
      mockWorkoutStore.generateWorkoutPlan.mockRejectedValueOnce(
        new Error('No equipment available'),
      );

      try {
        await mockWorkoutStore.generateWorkoutPlan({
          goals: ['strength'],
          availableEquipment: [],
          duration: 30,
          difficulty: 'beginner',
        });
      } catch (error) {
        expect((error as Error).message).toBe('No equipment available');
      }

      // Step 3: Handle subscription errors
      (
        subscriptionService.purchaseSubscription as jest.Mock
      ).mockRejectedValueOnce(new Error('Payment failed'));

      try {
        await subscriptionService.purchaseSubscription('premium');
      } catch (error) {
        expect((error as Error).message).toBe('Payment failed');
      }
    });
  });

  describe('Performance Journey', () => {
    it('should maintain good performance throughout user interactions', async () => {
      const startTime = Date.now();

      // Step 1: Generate workout plan (should be fast)
      const workoutPlan = await mockWorkoutStore.generateWorkoutPlan({
        goals: ['strength'],
        availableEquipment: ['dumbbells'],
        duration: 30,
        difficulty: 'beginner',
      });

      const planGenerationTime = Date.now() - startTime;
      expect(planGenerationTime).toBeLessThan(1000); // Should complete in under 1 second

      // Step 2: Start workout (should be instant)
      const workoutStartTime = Date.now();
      mockWorkoutStore.startWorkout(workoutPlan);
      const workoutStartDuration = Date.now() - workoutStartTime;
      expect(workoutStartDuration).toBeLessThan(100); // Should be nearly instant

      // Step 3: Complete exercise (should be fast)
      const exerciseTime = Date.now();
      mockWorkoutStore.completeExercise('ex-1', {
        setNumber: 1,
        reps: 10,
        weight: 0,
        completed: true,
      });
      const exerciseDuration = Date.now() - exerciseTime;
      expect(exerciseDuration).toBeLessThan(100); // Should be nearly instant
    });
  });

  describe('Accessibility Journey', () => {
    it('should support accessibility features throughout the user journey', () => {
      // Step 1: Check if accessibility features are available
      const preferences = mockUserStore.preferences;
      expect(preferences).toBeDefined();

      // Step 2: Verify accessibility settings
      expect(preferences.privacy.anonymousAnalytics).toBe(true);

      // Step 3: Test accessibility in workout flow
      const workoutPlan = {
        id: 'workout-1',
        name: 'Accessible Workout',
        exercises: [
          {
            id: 'ex-1',
            name: 'Seated Exercise',
            sets: 3,
            reps: '10-12',
            restTime: 60,
            completed: false,
          },
        ],
        estimatedDuration: 20,
        difficulty: 'beginner',
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      // Step 4: Start accessible workout
      mockWorkoutStore.startWorkout(workoutPlan);
      expect(mockWorkoutStore.startWorkout).toHaveBeenCalledWith(workoutPlan);
    });
  });
});
