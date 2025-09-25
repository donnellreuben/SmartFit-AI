import { useWorkoutStore } from '../workoutStore';

describe('WorkoutStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { clearWorkout } = useWorkoutStore.getState();
    clearWorkout();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useWorkoutStore.getState();

      expect(state.currentWorkout).toBeNull();
      expect(state.activePlan).toBeNull();
      expect(state.workoutHistory).toEqual([]);
      expect(state.isWorkoutActive).toBe(false);
      expect(state.currentExerciseIndex).toBe(0);
    });
  });

  describe('startWorkout', () => {
    it('should start a new workout', () => {
      const { startWorkout } = useWorkoutStore.getState();
      const mockWorkoutPlan = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [
          {
            id: '1',
            name: 'Push-ups',
            muscleGroups: ['chest', 'triceps'],
            equipment: [],
            difficulty: 'Beginner' as const,
            sets: 3,
            reps: '10',
            restTime: 60,
            videoUrl: '',
            instructions: ['Start in plank position'],
            tips: ['Keep core tight'],
            alternatives: [],
          },
        ],
        estimatedDuration: 30,
        difficulty: 'beginner' as const,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      startWorkout(mockWorkoutPlan);

      const state = useWorkoutStore.getState();
      expect(state.currentWorkout).toBeDefined();
      expect(state.isWorkoutActive).toBe(true);
      expect(state.currentExerciseIndex).toBe(0);
    });
  });

  describe('completeExercise', () => {
    it('should complete an exercise', () => {
      const { startWorkout, completeExercise } = useWorkoutStore.getState();
      const mockWorkoutPlan = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [
          {
            id: '1',
            name: 'Push-ups',
            muscleGroups: ['chest', 'triceps'],
            equipment: [],
            difficulty: 'Beginner' as const,
            sets: 3,
            reps: '10',
            restTime: 60,
            videoUrl: '',
            instructions: ['Start in plank position'],
            tips: ['Keep core tight'],
            alternatives: [],
          },
        ],
        estimatedDuration: 30,
        difficulty: 'beginner' as const,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      startWorkout(mockWorkoutPlan);
      completeExercise('1');

      const state = useWorkoutStore.getState();
      expect(state.currentWorkout?.exercises[0].completed).toBe(true);
    });
  });

  describe('nextExercise', () => {
    it('should move to next exercise', () => {
      const { startWorkout, nextExercise } = useWorkoutStore.getState();
      const mockWorkoutPlan = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [
          {
            id: '1',
            name: 'Push-ups',
            muscleGroups: ['chest', 'triceps'],
            equipment: [],
            difficulty: 'Beginner' as const,
            sets: 3,
            reps: '10',
            restTime: 60,
            videoUrl: '',
            instructions: ['Start in plank position'],
            tips: ['Keep core tight'],
            alternatives: [],
          },
          {
            id: '2',
            name: 'Squats',
            muscleGroups: ['legs', 'glutes'],
            equipment: [],
            difficulty: 'Beginner' as const,
            sets: 3,
            reps: '15',
            restTime: 60,
            videoUrl: '',
            instructions: ['Stand with feet shoulder-width apart'],
            tips: ['Keep knees behind toes'],
            alternatives: [],
          },
        ],
        estimatedDuration: 30,
        difficulty: 'beginner' as const,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      startWorkout(mockWorkoutPlan);
      nextExercise();

      const state = useWorkoutStore.getState();
      expect(state.currentExerciseIndex).toBe(1);
    });
  });

  describe('previousExercise', () => {
    it('should move to previous exercise', () => {
      const { startWorkout, nextExercise, previousExercise } =
        useWorkoutStore.getState();
      const mockWorkoutPlan = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [
          {
            id: '1',
            name: 'Push-ups',
            muscleGroups: ['chest', 'triceps'],
            equipment: [],
            difficulty: 'Beginner' as const,
            sets: 3,
            reps: '10',
            restTime: 60,
            videoUrl: '',
            instructions: ['Start in plank position'],
            tips: ['Keep core tight'],
            alternatives: [],
          },
          {
            id: '2',
            name: 'Squats',
            muscleGroups: ['legs', 'glutes'],
            equipment: [],
            difficulty: 'Beginner' as const,
            sets: 3,
            reps: '15',
            restTime: 60,
            videoUrl: '',
            instructions: ['Stand with feet shoulder-width apart'],
            tips: ['Keep knees behind toes'],
            alternatives: [],
          },
        ],
        estimatedDuration: 30,
        difficulty: 'beginner' as const,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      startWorkout(mockWorkoutPlan);
      nextExercise();
      previousExercise();

      const state = useWorkoutStore.getState();
      expect(state.currentExerciseIndex).toBe(0);
    });
  });

  describe('endWorkout', () => {
    it('should end current workout', () => {
      const { startWorkout, endWorkout } = useWorkoutStore.getState();
      const mockWorkoutPlan = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [
          {
            id: '1',
            name: 'Push-ups',
            muscleGroups: ['chest', 'triceps'],
            equipment: [],
            difficulty: 'Beginner' as const,
            sets: 3,
            reps: '10',
            restTime: 60,
            videoUrl: '',
            instructions: ['Start in plank position'],
            tips: ['Keep core tight'],
            alternatives: [],
          },
        ],
        estimatedDuration: 30,
        difficulty: 'beginner' as const,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      startWorkout(mockWorkoutPlan);
      endWorkout();

      const state = useWorkoutStore.getState();
      expect(state.currentWorkout).toBeNull();
      expect(state.isWorkoutActive).toBe(false);
      expect(state.workoutHistory.length).toBe(1);
    });
  });

  describe('clearWorkout', () => {
    it('should clear current workout', () => {
      const { startWorkout, clearWorkout } = useWorkoutStore.getState();
      const mockWorkoutPlan = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [],
        estimatedDuration: 30,
        difficulty: 'beginner' as const,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      startWorkout(mockWorkoutPlan);
      clearWorkout();

      const state = useWorkoutStore.getState();
      expect(state.currentWorkout).toBeNull();
      expect(state.isWorkoutActive).toBe(false);
      expect(state.currentExerciseIndex).toBe(0);
    });
  });

  describe('updateSetData', () => {
    it('should update set data for exercise', () => {
      const { startWorkout, updateSetData } = useWorkoutStore.getState();
      const mockWorkoutPlan = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [
          {
            id: '1',
            name: 'Push-ups',
            muscleGroups: ['chest', 'triceps'],
            equipment: [],
            difficulty: 'Beginner' as const,
            sets: 3,
            reps: '10',
            restTime: 60,
            videoUrl: '',
            instructions: ['Start in plank position'],
            tips: ['Keep core tight'],
            alternatives: [],
          },
        ],
        estimatedDuration: 30,
        difficulty: 'beginner' as const,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      startWorkout(mockWorkoutPlan);
      updateSetData('1', 1, { weight: 50, reps: 12, completed: true });

      const state = useWorkoutStore.getState();
      expect(state.currentWorkout?.exercises[0].sets[0].weight).toBe(50);
      expect(state.currentWorkout?.exercises[0].sets[0].reps).toBe(12);
      expect(state.currentWorkout?.exercises[0].sets[0].completed).toBe(true);
    });
  });

  describe('generateWorkoutPlan', () => {
    it('should generate a workout plan', async () => {
      const { generateWorkoutPlan } = useWorkoutStore.getState();

      // Mock the setTimeout to resolve immediately
      const originalSetTimeout = (global as any).setTimeout;
      (global as any).setTimeout = jest.fn((callback: () => void) => {
        callback();
        return 1 as any;
      });

      try {
        const plan = await generateWorkoutPlan({
          goals: ['strength', 'muscle_gain'],
          availableEquipment: ['dumbbells', 'bench'],
          duration: 45,
          difficulty: 'intermediate',
        });

        expect(plan).toBeDefined();
        expect(plan.exercises).toBeDefined();
        expect(Array.isArray(plan.exercises)).toBe(true);
      } finally {
        // Restore original setTimeout
        (global as any).setTimeout = originalSetTimeout;
      }
    });
  });
});
