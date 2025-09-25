import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SmartFitButton } from '../components/SmartFitButton';
import { ExerciseCard } from '../components/ExerciseCard';
import { Exercise } from '../types/exercise';
import { useWorkoutStore } from '../store/workoutStore';
import { theme } from '../constants/theme';

type WorkoutPlanScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WorkoutPlan'
>;

interface WorkoutPlanScreenProps {
  navigation: WorkoutPlanScreenNavigationProp;
}

// Mock data for demonstration
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Dumbbell Press',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    equipment: ['Dumbbells'],
    difficulty: 'Intermediate',
    sets: 4,
    reps: '8-12',
    restTime: 90,
    videoUrl: 'https://example.com/video1',
    instructions: [
      'Lie on a bench with dumbbells in each hand',
      'Press the dumbbells up until arms are extended',
      'Lower with control to chest level',
      'Repeat for desired reps',
    ],
    tips: [
      'Keep your core tight throughout the movement',
      "Don't bounce the weights off your chest",
      'Focus on controlled movement',
    ],
    alternatives: [],
  },
  {
    id: '2',
    name: 'Squats',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    sets: 3,
    reps: '12-15',
    restTime: 60,
    videoUrl: 'https://example.com/video2',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep your chest up and core tight',
      'Return to starting position',
    ],
    tips: [
      'Keep your knees in line with your toes',
      "Don't let your knees cave inward",
      'Go as low as comfortable',
    ],
    alternatives: [],
  },
  {
    id: '3',
    name: 'Pull-ups',
    muscleGroups: ['Back', 'Biceps'],
    equipment: ['Pull-up Bar'],
    difficulty: 'Advanced',
    sets: 3,
    reps: '5-8',
    restTime: 120,
    videoUrl: 'https://example.com/video3',
    instructions: [
      'Hang from a pull-up bar with overhand grip',
      'Pull your body up until chin clears the bar',
      'Lower with control to full extension',
      'Repeat for desired reps',
    ],
    tips: [
      'Engage your lats to initiate the movement',
      'Keep your core tight',
      'Use a full range of motion',
    ],
    alternatives: [],
  },
  {
    id: '4',
    name: 'Plank',
    muscleGroups: ['Core', 'Shoulders'],
    equipment: ['Bodyweight'],
    difficulty: 'Beginner',
    sets: 3,
    reps: '30 seconds',
    restTime: 45,
    videoUrl: 'https://example.com/video4',
    instructions: [
      'Start in push-up position',
      'Lower to forearms',
      'Keep body in straight line',
      'Hold for desired time',
    ],
    tips: [
      "Don't let your hips sag",
      'Keep your head neutral',
      'Breathe normally',
    ],
    alternatives: [],
  },
];

const WorkoutPlanScreen: React.FC<WorkoutPlanScreenProps> = ({
  navigation,
}) => {
  const [_selectedExercises, _setSelectedExercises] = useState<string[]>([]);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const { startWorkout, activePlan, generateWorkoutPlan } = useWorkoutStore();

  const handleExercisePress = (exercise: Exercise) => {
    Alert.alert(
      exercise.name,
      `Instructions:\n${exercise.instructions.join(
        '\n',
      )}\n\nTips:\n${exercise.tips.join('\n')}`,
      [
        { text: 'Watch Video', onPress: () => handleVideoPress(exercise) },
        { text: 'Close', style: 'cancel' },
      ],
    );
  };

  const handleVideoPress = (exercise: Exercise) => {
    Alert.alert('Video Player', `Playing video for ${exercise.name}`);
  };

  const handleStartWorkout = async () => {
    if (!activePlan) {
      await handleGeneratePlan();
      return;
    }

    startWorkout(activePlan);
    setWorkoutStarted(true);
    navigation.navigate('ActiveWorkout');
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);

    try {
      // Mock equipment and goals - in real app, these would come from user data
      const equipment = ['Dumbbells', 'Bench', 'Barbell'];
      const goals = ['Muscle Gain', 'Strength'];
      const duration = 45;

      // Generate workout plan using AI service (handled in store)
      await generateWorkoutPlan({
        goals,
        availableEquipment: equipment,
        duration,
        difficulty: 'intermediate',
      });

      Alert.alert('Plan Generated!', 'Your AI-powered workout plan is ready!', [
        { text: 'View Plan', onPress: () => {} },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to generate workout plan. Please try again.',
      );
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleProgressTracking = () => {
    navigation.navigate('ProgressTracking');
  };

  const getWorkoutDuration = () => {
    const totalRestTime = mockExercises.reduce(
      (acc, exercise) => acc + exercise.restTime * (exercise.sets - 1),
      0,
    );
    const estimatedDuration = Math.ceil((totalRestTime + 1800) / 60); // Add 30 min for exercises
    return estimatedDuration;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Workout Plan</Text>
            <Text style={styles.subtitle}>
              {mockExercises.length} exercises • ~{getWorkoutDuration()} minutes
            </Text>
          </View>

          {/* Workout Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockExercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getWorkoutDuration()}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {mockExercises.reduce((acc, ex) => acc + ex.sets, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Sets</Text>
            </View>
          </View>

          {/* Exercise List */}
          <View style={styles.exercisesSection}>
            <Text style={styles.sectionTitle}>Today's Exercises</Text>
            {mockExercises.map((exercise, _index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onPress={() => handleExercisePress(exercise)}
                onVideoPress={() => handleVideoPress(exercise)}
                style={styles.exerciseCard}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            {!workoutStarted ? (
              <View style={styles.workoutButtons}>
                <SmartFitButton
                  title={activePlan ? 'Start Workout' : 'Generate AI Plan'}
                  onPress={handleStartWorkout}
                  loading={isGeneratingPlan}
                  size="large"
                  style={styles.startButton}
                />
                {!activePlan && (
                  <SmartFitButton
                    title="Use Sample Plan"
                    onPress={() =>
                      Alert.alert('Sample Plan', 'Using sample workout plan')
                    }
                    variant="outline"
                    style={styles.sampleButton}
                  />
                )}
              </View>
            ) : (
              <View style={styles.activeWorkoutButtons}>
                <SmartFitButton
                  title="Continue Workout"
                  onPress={() =>
                    Alert.alert('Workout', 'Continue your workout')
                  }
                  size="large"
                  style={styles.continueButton}
                />
                <SmartFitButton
                  title="End Workout"
                  onPress={() => setWorkoutStarted(false)}
                  variant="outline"
                  style={styles.endButton}
                />
              </View>
            )}

            <SmartFitButton
              title="View Progress"
              onPress={handleProgressTracking}
              variant="secondary"
              style={styles.progressButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  exercisesSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  exerciseCard: {
    // Additional styles if needed
  },
  buttonSection: {
    gap: theme.spacing.md,
  },
  startButton: {
    marginBottom: theme.spacing.sm,
  },
  activeWorkoutButtons: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  continueButton: {
    // Additional styles if needed
  },
  endButton: {
    // Additional styles if needed
  },
  progressButton: {
    // Additional styles if needed
  },
  workoutButtons: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sampleButton: {
    // Additional styles if needed
  },
});

export default WorkoutPlanScreen;
