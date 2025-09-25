import { useWorkoutStore } from '../workoutStore';

describe('WorkoutStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    // Note: clearWorkout method doesn't exist in the store
    // The store will be reset automatically between tests
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
      const mockWorkout = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [
          {
            exerciseId: '1',
            name: 'Push-ups',
            sets: 3,
            reps: '10',
            restTime: 60,
            completed: false,
          },
        ],
        startTime: new Date().toISOString(),
        endTime: null,
        totalDuration: 0,
        caloriesBurned: 0,
        notes: '',
      };

      startWorkout(mockWorkout);

      const state = useWorkoutStore.getState();
      expect(state.currentWorkout).toEqual(mockWorkout);
      expect(state.isWorkoutActive).toBe(true);
      expect(state.currentExerciseIndex).toBe(0);
    });
  });

  describe('completeExercise', () => {
    it('should complete an exercise', () => {
      const { startWorkout, completeExercise } = useWorkoutStore.getState();
      const mockWorkout = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [
          {
            exerciseId: '1',
            name: 'Push-ups',
            sets: 3,
            reps: '10',
            restTime: 60,
            completed: false,
          },
        ],
        startTime: new Date().toISOString(),
        endTime: null,
        totalDuration: 0,
        caloriesBurned: 0,
        notes: '',
      };

      startWorkout(mockWorkout);
      completeExercise('1');

      const state = useWorkoutStore.getState();
      expect(state.currentWorkout?.exercises[0].completed).toBe(true);
    });
  });

  describe('nextExercise', () => {
    it('should move to next exercise', () => {
      const { startWorkout, nextExercise } = useWorkoutStore.getState();
      const mockWorkout = {
        id: 'test-workout',
        name: 'Test Workout',
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
        startTime: new Date().toISOString(),
        endTime: null,
        totalDuration: 0,
        caloriesBurned: 0,
        notes: '',
      };

      startWorkout(mockWorkout);
      nextExercise();

      const state = useWorkoutStore.getState();
      expect(state.currentExerciseIndex).toBe(1);
    });
  });

  describe('previousExercise', () => {
    it('should move to previous exercise', () => {
      const { startWorkout, nextExercise, previousExercise } =
        useWorkoutStore.getState();
      const mockWorkout = {
        id: 'test-workout',
        name: 'Test Workout',
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
        startTime: new Date().toISOString(),
        endTime: null,
        totalDuration: 0,
        caloriesBurned: 0,
        notes: '',
      };

      startWorkout(mockWorkout);
      nextExercise();
      previousExercise();

      const state = useWorkoutStore.getState();
      expect(state.currentExerciseIndex).toBe(0);
    });
  });

  describe('endWorkout', () => {
    it('should end current workout', () => {
      const { startWorkout, endWorkout } = useWorkoutStore.getState();
      const mockWorkout = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [
          {
            exerciseId: '1',
            name: 'Push-ups',
            sets: 3,
            reps: '10',
            restTime: 60,
            completed: false,
          },
        ],
        startTime: new Date().toISOString(),
        endTime: null,
        totalDuration: 0,
        caloriesBurned: 0,
        notes: '',
      };

      startWorkout(mockWorkout);
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
      const mockWorkout = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [],
        startTime: new Date().toISOString(),
        endTime: null,
        totalDuration: 0,
        caloriesBurned: 0,
        notes: '',
      };

      startWorkout(mockWorkout);
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
      const mockWorkout = {
        id: 'test-workout',
        name: 'Test Workout',
        exercises: [
          {
            exerciseId: '1',
            name: 'Push-ups',
            sets: 3,
            reps: '10',
            restTime: 60,
            completed: false,
          },
        ],
        startTime: new Date().toISOString(),
        endTime: null,
        totalDuration: 0,
        caloriesBurned: 0,
        notes: '',
      };

      startWorkout(mockWorkout);
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

      const plan = await generateWorkoutPlan({
        goals: ['strength', 'muscle_gain'],
        availableEquipment: ['dumbbells', 'bench'],
        duration: 45,
        difficulty: 'intermediate',
      });

      expect(plan).toBeDefined();
      expect(plan.exercises).toBeDefined();
      expect(Array.isArray(plan.exercises)).toBe(true);
    });
  });
});
