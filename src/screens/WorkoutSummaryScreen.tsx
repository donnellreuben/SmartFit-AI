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
import { useWorkoutStore } from '../store/workoutStore';
import { theme } from '../constants/theme';

type WorkoutSummaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WorkoutSummary'>;

interface WorkoutSummaryScreenProps {
  navigation: WorkoutSummaryScreenNavigationProp;
}

const WorkoutSummaryScreen: React.FC<WorkoutSummaryScreenProps> = ({ navigation }) => {
  const { workoutHistory } = useWorkoutStore();
  const [workout, _setWorkout] = useState(workoutHistory[0]); // Most recent workout
  const [showNotes, setShowNotes] = useState(false);
  const [notes, _setNotes] = useState(workout?.notes || '');

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No workout data found</Text>
          <SmartFitButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveNotes = () => {
    // In a real app, this would save to the backend
    Alert.alert('Notes Saved', 'Your workout notes have been saved.');
    setShowNotes(false);
  };

  const handleShareWorkout = () => {
    Alert.alert(
      'Share Workout',
      'Share your workout progress with friends!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => Alert.alert('Shared!', 'Workout shared successfully.') }
      ]
    );
  };

  const getTotalSets = () => {
    return workout.exercises.reduce((acc, exercise) => acc + exercise.sets.length, 0);
  };

  const getCompletedSets = () => {
    return workout.exercises.reduce((acc, exercise) => 
      acc + exercise.sets.filter(set => set.completed).length, 0
    );
  };

  const getTotalWeight = () => {
    return workout.exercises.reduce((acc, exercise) => 
      acc + exercise.sets.reduce((setAcc, set) => 
        setAcc + (set.weight || 0) * (set.reps || 0), 0
      ), 0
    );
  };

  const getCompletionRate = () => {
    return Math.round((getCompletedSets() / getTotalSets()) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Workout Complete! 🎉</Text>
            <Text style={styles.subtitle}>
              Great job on completing your workout
            </Text>
            <Text style={styles.date}>{formatDate(workout.date)}</Text>
          </View>

          {/* Summary Stats */}
          <View style={styles.statsGrid}>
            <SmartFitCard style={styles.statCard}>
              <Text style={styles.statValue}>{workout.duration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </SmartFitCard>
            
            <SmartFitCard style={styles.statCard}>
              <Text style={styles.statValue}>{getCompletedSets()}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </SmartFitCard>
            
            <SmartFitCard style={styles.statCard}>
              <Text style={styles.statValue}>{workout.exercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </SmartFitCard>
            
            <SmartFitCard style={styles.statCard}>
              <Text style={styles.statValue}>{getCompletionRate()}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </SmartFitCard>
          </View>

          {/* Performance Highlights */}
          <SmartFitCard style={styles.highlightsCard}>
            <Text style={styles.cardTitle}>Performance Highlights</Text>
            
            <View style={styles.highlightItem}>
              <Text style={styles.highlightIcon}>💪</Text>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Total Weight Lifted</Text>
                <Text style={styles.highlightValue}>{getTotalWeight().toFixed(0)} kg</Text>
              </View>
            </View>
            
            <View style={styles.highlightItem}>
              <Text style={styles.highlightIcon}>🔥</Text>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Estimated Calories</Text>
                <Text style={styles.highlightValue}>{workout.totalCalories}</Text>
              </View>
            </View>
            
            <View style={styles.highlightItem}>
              <Text style={styles.highlightIcon}>⚡</Text>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightTitle}>Average Rest Time</Text>
                <Text style={styles.highlightValue}>90s</Text>
              </View>
            </View>
          </SmartFitCard>

          {/* Exercise Breakdown */}
          <SmartFitCard style={styles.exercisesCard}>
            <Text style={styles.cardTitle}>Exercise Breakdown</Text>
            
            {workout.exercises.map((exercise, _index) => (
              <View key={exercise.exerciseId} style={styles.exerciseItem}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseStatus}>
                    {exercise.completed ? '✅' : '⏳'}
                  </Text>
                </View>
                
                <View style={styles.exerciseStats}>
                  <Text style={styles.exerciseStat}>
                    {exercise.sets.filter(set => set.completed).length}/{exercise.sets.length} sets
                  </Text>
                  <Text style={styles.exerciseStat}>
                    {exercise.sets.reduce((acc, set) => acc + (set.reps || 0), 0)} total reps
                  </Text>
                </View>
              </View>
            ))}
          </SmartFitCard>

          {/* Notes Section */}
          <SmartFitCard style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Text style={styles.cardTitle}>Workout Notes</Text>
              <TouchableOpacity onPress={() => setShowNotes(!showNotes)}>
                <Text style={styles.editButton}>
                  {showNotes ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {showNotes ? (
              <View style={styles.notesInput}>
                <Text style={styles.notesPlaceholder}>
                  How did this workout feel? Any observations or improvements?
                </Text>
                <SmartFitButton
                  title="Save Notes"
                  onPress={handleSaveNotes}
                  size="small"
                />
              </View>
            ) : (
              <Text style={styles.notesText}>
                {notes || 'No notes added for this workout.'}
              </Text>
            )}
          </SmartFitCard>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <SmartFitButton
              title="View Progress"
              onPress={() => navigation.navigate('ProgressTracking')}
              style={styles.primaryButton}
            />
            
            <SmartFitButton
              title="Share Workout"
              onPress={handleShareWorkout}
              variant="outline"
              style={styles.secondaryButton}
            />
            
            <SmartFitButton
              title="Start New Workout"
              onPress={() => navigation.navigate('WorkoutPlan')}
              variant="secondary"
              style={styles.tertiaryButton}
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
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
  },
  errorText: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  backButton: {
    // Additional styles if needed
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.accent,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  highlightsCard: {
    marginBottom: theme.spacing[6],
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[4],
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  highlightIcon: {
    fontSize: 24,
    marginRight: theme.spacing[3],
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[1],
  },
  highlightValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  exercisesCard: {
    marginBottom: theme.spacing[6],
  },
  exerciseItem: {
    marginBottom: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  exerciseName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
  },
  exerciseStatus: {
    fontSize: 20,
  },
  exerciseStats: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  exerciseStat: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  notesCard: {
    marginBottom: theme.spacing[6],
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  editButton: {
    ...theme.typography.body,
    color: theme.colors.accent,
    fontWeight: '500',
  },
  notesInput: {
    // Additional styles for notes input
  },
  notesPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing[3],
  },
  notesText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
  },
  buttonSection: {
    gap: theme.spacing[3],
  },
  primaryButton: {
    marginBottom: theme.spacing[2],
  },
  secondaryButton: {
    // Additional styles if needed
  },
  tertiaryButton: {
    // Additional styles if needed
  },
});

export default WorkoutSummaryScreen;
