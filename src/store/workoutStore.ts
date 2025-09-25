import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exercise } from '../components/ExerciseCard';

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
  isLoading: boolean;
  error: string | null;
}

interface WorkoutActions {
  startWorkout: (plan: WorkoutPlan) => void;
  endWorkout: () => void;
  updateCurrentWorkout: (updates: Partial<WorkoutSession>) => void;
  completeSet: (exerciseId: string, setNumber: number, data: Partial<WorkoutSet>) => void;
  completeExercise: (exerciseId: string) => void;
  addWorkoutToHistory: (workout: WorkoutSession) => void;
  generateWorkoutPlan: (equipment: string[], goals: string[], duration: number) => Promise<void>;
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
        });
      },

      endWorkout: () => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const completedWorkout = {
          ...currentWorkout,
          completed: true,
          duration: Math.floor((Date.now() - new Date(currentWorkout.date).getTime()) / 60000),
        };

        set({
          currentWorkout: null,
          isWorkoutActive: false,
          activePlan: null,
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

      completeSet: (exerciseId: string, setNumber: number, data: Partial<WorkoutSet>) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const updatedExercises = currentWorkout.exercises.map(exercise => {
          if (exercise.exerciseId === exerciseId) {
            const updatedSets = exercise.sets.map(set => {
              if (set.setNumber === setNumber) {
                return { ...set, ...data, completed: true };
              }
              return set;
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

      addWorkoutToHistory: (workout: WorkoutSession) => {
        set({
          workoutHistory: [workout, ...get().workoutHistory],
        });
      },

      generateWorkoutPlan: async (equipment: string[], goals: string[], duration: number) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate AI workout plan generation
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Mock workout plan based on equipment and goals
          const mockPlan: WorkoutPlan = {
            id: `plan-${Date.now()}`,
            name: 'AI Generated Workout',
            exercises: [], // Would be populated by AI
            estimatedDuration: duration,
            difficulty: 'intermediate',
            createdAt: new Date().toISOString(),
            isActive: true,
          };
          
          set({
            workoutPlans: [mockPlan, ...get().workoutPlans],
            activePlan: mockPlan,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to generate workout plan',
          });
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
      partialize: (state) => ({
        workoutHistory: state.workoutHistory,
        workoutPlans: state.workoutPlans,
        activePlan: state.activePlan,
      }),
    }
  )
);
