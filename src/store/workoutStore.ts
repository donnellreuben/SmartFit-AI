import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exercise } from '../types/exercise';

export interface WorkoutSession {
  id: string;
  date: string;
  duration: number; // in minutes
  exercises: WorkoutExercise[];
  totalCalories: number;
  notes?: string;
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
  restTime: number;
  completed: boolean;
  videoUrl?: string;
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weight?: number; // in kg
  duration?: number; // in seconds for time-based exercises
  completed: boolean;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  exercises: Exercise[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  isActive: boolean;
}

interface WorkoutState {
  currentWorkout: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  workoutPlans: WorkoutPlan[];
  activePlan: WorkoutPlan | null;
  isWorkoutActive: boolean;
  currentExerciseIndex: number;
  isLoading: boolean;
  error: string | null;
}

interface WorkoutActions {
  startWorkout: (plan: WorkoutPlan) => void;
  endWorkout: () => void;
  updateCurrentWorkout: (updates: Partial<WorkoutSession>) => void;
  completeSet: (
    exerciseId: string,
    setNumber: number,
    data: Partial<WorkoutSet>,
  ) => void;
  completeExercise: (exerciseId: string) => void;
  nextExercise: () => void;
  previousExercise: () => void;
  updateSetData: (
    exerciseId: string,
    setNumber: number,
    data: Partial<WorkoutSet>,
  ) => void;
  clearWorkout: () => void;
  addWorkoutToHistory: (workout: WorkoutSession) => void;
  generateWorkoutPlan: (params: {
    goals: string[];
    availableEquipment: string[];
    duration: number;
    difficulty: string;
  }) => Promise<WorkoutPlan>;
  setActivePlan: (plan: WorkoutPlan | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useWorkoutStore = create<WorkoutState & WorkoutActions>()(
  persist(
    (set, get) => ({
      // State
      currentWorkout: null,
      workoutHistory: [],
      workoutPlans: [],
      activePlan: null,
      isWorkoutActive: false,
      currentExerciseIndex: 0,
      isLoading: false,
      error: null,

      // Actions
      startWorkout: (plan: WorkoutPlan) => {
        const workoutSession: WorkoutSession = {
          id: `workout-${Date.now()}`,
          date: new Date().toISOString(),
          duration: 0,
          exercises: plan.exercises.map(exercise => ({
            exerciseId: exercise.id,
            name: exercise.name,
            sets: Array.from({ length: exercise.sets }, (_, index) => ({
              setNumber: index + 1,
              reps: 0,
              weight: 0,
              completed: false,
            })),
            restTime: exercise.restTime,
            completed: false,
          })),
          totalCalories: 0,
          completed: false,
        };

        set({
          currentWorkout: workoutSession,
          isWorkoutActive: true,
          activePlan: plan,
          currentExerciseIndex: 0,
        });
      },

      endWorkout: () => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const completedWorkout = {
          ...currentWorkout,
          completed: true,
          duration: Math.floor(
            (Date.now() - new Date(currentWorkout.date).getTime()) / 60000,
          ),
        };

        set({
          currentWorkout: null,
          isWorkoutActive: false,
          activePlan: null,
          currentExerciseIndex: 0,
          workoutHistory: [completedWorkout, ...get().workoutHistory],
        });
      },

      updateCurrentWorkout: (updates: Partial<WorkoutSession>) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        set({
          currentWorkout: { ...currentWorkout, ...updates },
        });
      },

      completeSet: (
        exerciseId: string,
        setNumber: number,
        data: Partial<WorkoutSet>,
      ) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const updatedExercises = currentWorkout.exercises.map(exercise => {
          if (exercise.exerciseId === exerciseId) {
            const updatedSets = exercise.sets.map(setItem => {
              if (setItem.setNumber === setNumber) {
                return { ...setItem, ...data, completed: true };
              }
              return setItem;
            });
            return { ...exercise, sets: updatedSets };
          }
          return exercise;
        });

        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: updatedExercises,
          },
        });
      },

      completeExercise: (exerciseId: string) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const updatedExercises = currentWorkout.exercises.map(exercise => {
          if (exercise.exerciseId === exerciseId) {
            return { ...exercise, completed: true };
          }
          return exercise;
        });

        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: updatedExercises,
          },
        });
      },

      nextExercise: () => {
        const { currentWorkout, currentExerciseIndex } = get();
        if (!currentWorkout) return;

        const nextIndex = currentExerciseIndex + 1;
        if (nextIndex < currentWorkout.exercises.length) {
          set({ currentExerciseIndex: nextIndex });
        }
      },

      previousExercise: () => {
        const { currentExerciseIndex } = get();
        if (currentExerciseIndex > 0) {
          set({ currentExerciseIndex: currentExerciseIndex - 1 });
        }
      },

      updateSetData: (
        exerciseId: string,
        setNumber: number,
        data: Partial<WorkoutSet>,
      ) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const updatedExercises = currentWorkout.exercises.map(exercise => {
          if (exercise.exerciseId === exerciseId) {
            const updatedSets = exercise.sets.map(setItem => {
              if (setItem.setNumber === setNumber) {
                return { ...setItem, ...data };
              }
              return setItem;
            });
            return { ...exercise, sets: updatedSets };
          }
          return exercise;
        });

        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: updatedExercises,
          },
        });
      },

      clearWorkout: () => {
        set({
          currentWorkout: null,
          isWorkoutActive: false,
          activePlan: null,
          currentExerciseIndex: 0,
        });
      },

      addWorkoutToHistory: (workout: WorkoutSession) => {
        set({
          workoutHistory: [workout, ...get().workoutHistory],
        });
      },

      generateWorkoutPlan: async (params: {
        goals: string[];
        availableEquipment: string[];
        duration: number;
        difficulty: string;
      }) => {
        set({ isLoading: true, error: null });

        try {
          // Import AI service dynamically to avoid circular dependencies
          const { aiService } = await import('../services/aiService');

          // Use AI service to generate workout plan
          const aiPlan = await aiService.generateWorkoutPlan({
            equipment: params.availableEquipment,
            goals: params.goals,
            fitnessLevel: params.difficulty as
              | 'beginner'
              | 'intermediate'
              | 'advanced',
            availableTime: params.duration,
            preferences: {
              intensity: 'medium',
              focusAreas: ['Full Body'],
            },
          });

          // Convert AI plan to our workout plan format
          const workoutPlan: WorkoutPlan = {
            id: aiPlan.id,
            name: aiPlan.name,
            exercises: aiPlan.exercises,
            estimatedDuration: aiPlan.estimatedDuration,
            difficulty: aiPlan.difficulty,
            createdAt: aiPlan.createdAt,
            isActive: true,
          };

          set({
            workoutPlans: [workoutPlan, ...get().workoutPlans],
            activePlan: workoutPlan,
            isLoading: false,
          });

          return workoutPlan;
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to generate workout plan',
          });
          throw error;
        }
      },

      setActivePlan: (plan: WorkoutPlan | null) => {
        set({ activePlan: plan });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'workout-storage',
      partialize: state => ({
        workoutHistory: state.workoutHistory,
        workoutPlans: state.workoutPlans,
        activePlan: state.activePlan,
      }),
    },
  ),
);
