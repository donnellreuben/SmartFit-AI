import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  injuries?: string[];
  availableTime?: number; // minutes per session
  workoutDays?: number[]; // 0-6, Sunday to Saturday
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: {
    workoutReminders: boolean;
    progressUpdates: boolean;
    motivationalMessages: boolean;
    weeklyReports: boolean;
  };
  workout: {
    intensity: 'low' | 'medium' | 'high';
    musicIntegration: boolean;
    voiceCoaching: boolean;
  };
  privacy: {
    shareProgress: boolean;
    anonymousAnalytics: boolean;
  };
}

interface UserState {
  profile: UserProfile | null;
  isProfileComplete: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  updateProfile: (updates: Partial<UserProfile>) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetProfile: () => void;
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      // State
      profile: null,
      isProfileComplete: false,
      isLoading: false,
      error: null,

      // Actions
      updateProfile: (updates: Partial<UserProfile>) => {
        const { profile } = get();
        if (!profile) return;

        const updatedProfile = {
          ...profile,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        // Check if profile is complete
        const isComplete = !!(
          updatedProfile.name &&
          updatedProfile.age &&
          updatedProfile.gender &&
          updatedProfile.height &&
          updatedProfile.weight &&
          updatedProfile.fitnessLevel &&
          updatedProfile.goals &&
          updatedProfile.goals.length > 0
        );

        set({
          profile: updatedProfile,
          isProfileComplete: isComplete,
        });
      },

      setPreferences: (preferences: Partial<UserPreferences>) => {
        const { profile } = get();
        if (!profile) return;

        const updatedPreferences: UserPreferences = {
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
          ...profile.preferences,
          ...preferences,
        };

        set({
          profile: {
            ...profile,
            preferences: updatedPreferences,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      resetProfile: () =>
        set({
          profile: null,
          isProfileComplete: false,
          error: null,
        }),
    }),
    {
      name: 'user-storage',
      partialize: state => ({
        profile: state.profile,
        isProfileComplete: state.isProfileComplete,
      }),
    },
  ),
);
