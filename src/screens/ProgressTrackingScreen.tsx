import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SmartFitButton } from '../components/SmartFitButton';
import { SmartFitCard } from '../components/SmartFitCard';
import { ProgressChart } from '../components/ProgressChart';
import { theme } from '../constants/theme';

type ProgressTrackingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProgressTracking'
>;

interface ProgressTrackingScreenProps {
  navigation: ProgressTrackingScreenNavigationProp;
}

// Mock data for demonstration
const mockWorkoutHistory = [
  {
    id: '1',
    date: '2024-01-15',
    duration: 45,
    exercises: 4,
    calories: 320,
    notes: 'Great workout, felt strong today',
  },
  {
    id: '2',
    date: '2024-01-13',
    duration: 38,
    exercises: 3,
    calories: 280,
    notes: 'Focused on upper body',
  },
  {
    id: '3',
    date: '2024-01-11',
    duration: 52,
    exercises: 5,
    calories: 380,
    notes: 'Leg day, really pushed myself',
  },
  {
    id: '4',
    date: '2024-01-09',
    duration: 41,
    exercises: 4,
    calories: 295,
    notes: 'Quick morning session',
  },
];

const mockWeightProgression = [
  { date: '2024-01-01', weight: 75.2, exercise: 'Bench Press' },
  { date: '2024-01-08', weight: 77.5, exercise: 'Bench Press' },
  { date: '2024-01-15', weight: 80.0, exercise: 'Bench Press' },
];

const ProgressTrackingScreen: React.FC<ProgressTrackingScreenProps> = ({
  navigation: _navigation,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'week' | 'month' | 'year'
  >('month');

  const getTotalWorkouts = () => {
    return mockWorkoutHistory.length;
  };

  const getTotalDuration = () => {
    return mockWorkoutHistory.reduce(
      (acc, workout) => acc + workout.duration,
      0,
    );
  };

  const getTotalCalories = () => {
    return mockWorkoutHistory.reduce(
      (acc, workout) => acc + workout.calories,
      0,
    );
  };

  // const getAverageWorkoutDuration = () => {
  //   return Math.round(getTotalDuration() / mockWorkoutHistory.length);
  // };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStreakDays = () => {
    // Mock calculation - in real app, this would be calculated from actual data
    return 7;
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
            <Text style={styles.title}>Progress Tracking</Text>
            <Text style={styles.subtitle}>
              Track your fitness journey and celebrate your achievements
            </Text>
          </View>

          {/* Timeframe Selector */}
          <View style={styles.timeframeSelector}>
            {(['week', 'month', 'year'] as const).map(timeframe => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.timeframeButton,
                  selectedTimeframe === timeframe &&
                    styles.timeframeButtonActive,
                ]}
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text
                  style={[
                    styles.timeframeButtonText,
                    selectedTimeframe === timeframe &&
                      styles.timeframeButtonTextActive,
                  ]}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Overview */}
          <View style={styles.statsGrid}>
            <SmartFitCard style={styles.statCard}>
              <Text style={styles.statValue}>{getTotalWorkouts()}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </SmartFitCard>

            <SmartFitCard style={styles.statCard}>
              <Text style={styles.statValue}>{getTotalDuration()}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </SmartFitCard>

            <SmartFitCard style={styles.statCard}>
              <Text style={styles.statValue}>{getTotalCalories()}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </SmartFitCard>

            <SmartFitCard style={styles.statCard}>
              <Text style={styles.statValue}>{getStreakDays()}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </SmartFitCard>
          </View>

          {/* Weight Progression Chart */}
          <ProgressChart
            data={mockWeightProgression.map(entry => ({
              date: entry.date,
              value: entry.weight,
              label: entry.exercise,
            }))}
            title="Weight Progression"
            yAxisLabel="Weight (kg)"
            xAxisLabel="Date"
            color={theme.colors.accent}
            showTrend={true}
            style={styles.chartCard}
          />

          {/* Recent Workouts */}
          <View style={styles.recentWorkoutsSection}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {mockWorkoutHistory.map(workout => (
              <SmartFitCard key={workout.id} style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <Text style={styles.workoutDate}>
                    {formatDate(workout.date)}
                  </Text>
                  <Text style={styles.workoutDuration}>
                    {workout.duration} min
                  </Text>
                </View>

                <View style={styles.workoutStats}>
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatValue}>
                      {workout.exercises}
                    </Text>
                    <Text style={styles.workoutStatLabel}>Exercises</Text>
                  </View>
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatValue}>
                      {workout.calories}
                    </Text>
                    <Text style={styles.workoutStatLabel}>Calories</Text>
                  </View>
                </View>

                {workout.notes && (
                  <Text style={styles.workoutNotes}>{workout.notes}</Text>
                )}
              </SmartFitCard>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <SmartFitButton
              title="Add Workout"
              onPress={() => Alert.alert('Add Workout', 'Feature coming soon!')}
              style={styles.addWorkoutButton}
            />

            <SmartFitButton
              title="View Detailed Analytics"
              onPress={() =>
                Alert.alert('Analytics', 'Detailed analytics coming soon!')
              }
              variant="outline"
              style={styles.analyticsButton}
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
    lineHeight: 24,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  timeframeButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  timeframeButtonTextActive: {
    color: theme.colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
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
  chartCard: {
    marginBottom: theme.spacing.xl,
  },
  recentWorkoutsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  workoutCard: {
    marginBottom: theme.spacing.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  workoutDate: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  workoutDuration: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  workoutStat: {
    alignItems: 'center',
  },
  workoutStatValue: {
    ...theme.typography.h3,
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  workoutStatLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  workoutNotes: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  buttonSection: {
    gap: theme.spacing.md,
  },
  addWorkoutButton: {
    marginBottom: theme.spacing.sm,
  },
  analyticsButton: {
    // Additional styles if needed
  },
});

export default ProgressTrackingScreen;
