export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sets: number;
  reps: string; // "8-12" or "30 seconds"
  restTime: number; // seconds
  videoUrl: string;
  instructions: string[];
  tips: string[];
  alternatives: Exercise[];
}
