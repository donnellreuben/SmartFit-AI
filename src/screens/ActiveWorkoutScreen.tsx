import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SmartFitButton } from '../components/SmartFitButton';
import { SmartFitCard } from '../components/SmartFitCard';
import { VideoPlayer } from '../components/VideoPlayer';
import { useWorkoutStore } from '../store/workoutStore';
import { theme } from '../constants/theme';

type ActiveWorkoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ActiveWorkout'>;

interface ActiveWorkoutScreenProps {
  navigation: ActiveWorkoutScreenNavigationProp;
}

const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({ navigation }) => {
  const { currentWorkout, completeSet, completeExercise, endWorkout } = useWorkoutStore();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState(Date.now());
  const [showVideo, setShowVideo] = useState(false);
  
  const restTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!currentWorkout) {
      navigation.goBack();
      return;
    }
    
    setWorkoutStartTime(Date.now());
  }, [currentWorkout, navigation]);

  useEffect(() => {
    if (isResting && restTimeRemaining > 0) {
      restTimerRef.current = setTimeout(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            setIsResting(false);
            Vibration.vibrate([0, 500, 200, 500]); // Rest complete vibration
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restTimerRef.current) {
        clearTimeout(restTimerRef.current);
      }
    };
  }, [isResting, restTimeRemaining]);

  if (!currentWorkout) {
    return null;
  }

  const currentExercise = currentWorkout.exercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets[currentSetIndex];
  const isLastSet = currentSetIndex >= (currentExercise?.sets.length || 0) - 1;
  const isLastExercise = currentExerciseIndex >= currentWorkout.exercises.length - 1;

  const handleSetComplete = () => {
    if (!currentExercise || !currentSet) return;

    // Complete the current set
    completeSet(currentExercise.exerciseId, currentSet.setNumber, {
      reps: currentSet.reps,
      weight: currentSet.weight,
      completed: true,
    });

    // Move to next set or exercise
    if (isLastSet) {
      // Complete the exercise
      completeExercise(currentExercise.exerciseId);
      
      if (isLastExercise) {
        // Workout complete
        handleWorkoutComplete();
      } else {
        // Move to next exercise
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
        startRest(currentExercise.restTime);
      }
    } else {
      // Move to next set
      setCurrentSetIndex(prev => prev + 1);
      startRest(currentExercise.restTime);
    }
  };

  const startRest = (restTime: number) => {
    setIsResting(true);
    setRestTimeRemaining(restTime);
    Vibration.vibrate([0, 200, 100, 200]); // Rest start vibration
  };

  const handleWorkoutComplete = () => {
    const duration = Math.floor((Date.now() - workoutStartTime) / 60000);
    endWorkout();
    
    Alert.alert(
      'Workout Complete! 🎉',
      `Great job! You completed your workout in ${duration} minutes.`,
      [
        { text: 'View Summary', onPress: () => navigation.navigate('WorkoutSummary') },
        { text: 'Done', onPress: () => navigation.navigate('WorkoutPlan') }
      ]
    );
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimeRemaining(0);
  };

  const handlePauseWorkout = () => {
    Alert.alert(
      'Pause Workout',
      'What would you like to do?',
      [
        { text: 'Resume', style: 'cancel' },
        { text: 'End Workout', onPress: handleWorkoutComplete, style: 'destructive' }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWorkoutProgress = () => {
    const totalSets = currentWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completedSets = currentWorkout.exercises.reduce((acc, ex) => 
      acc + ex.sets.filter(set => set.completed).length, 0
    );
    return (completedSets / totalSets) * 100;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePauseWorkout} style={styles.pauseButton}>
              <Text style={styles.pauseButtonText}>⏸</Text>
            </TouchableOpacity>
            <Text style={styles.workoutTitle}>Active Workout</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{Math.round(getWorkoutProgress())}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${getWorkoutProgress()}%` }]}
              />
            </View>
          </View>

          {/* Current Exercise */}
          {currentExercise && (
            <View style={styles.exerciseSection}>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.setInfo}>
                Set {currentSetIndex + 1} of {currentExercise.sets.length}
              </Text>

              {/* Set Details */}
              <SmartFitCard style={styles.setCard}>
                <View style={styles.setDetails}>
                  <View style={styles.setInfoRow}>
                    <Text style={styles.setLabel}>Reps:</Text>
                    <Text style={styles.setValue}>{currentSet?.reps || 0}</Text>
                  </View>
                  <View style={styles.setInfoRow}>
                    <Text style={styles.setLabel}>Weight:</Text>
                    <Text style={styles.setValue}>{currentSet?.weight || 0} kg</Text>
                  </View>
                </View>

                <SmartFitButton
                  title="Complete Set"
                  onPress={handleSetComplete}
                  size="large"
                  style={styles.completeButton}
                />
              </SmartFitCard>

              {/* Video Button */}
              <TouchableOpacity
                style={styles.videoButton}
                onPress={() => setShowVideo(true)}
              >
                <Text style={styles.videoButtonText}>📹 Watch Exercise Video</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Rest Timer */}
          {isResting && (
            <SmartFitCard style={styles.restCard}>
              <Text style={styles.restTitle}>Rest Time</Text>
              <Text style={styles.restTime}>{formatTime(restTimeRemaining)}</Text>
              <Text style={styles.restSubtext}>Next: {currentExercise?.name}</Text>
              
              <View style={styles.restButtons}>
                <SmartFitButton
                  title="Skip Rest"
                  onPress={handleSkipRest}
                  variant="outline"
                  size="small"
                />
              </View>
            </SmartFitCard>
          )}

          {/* Next Exercise Preview */}
          {!isLastExercise && !isResting && (
            <SmartFitCard style={styles.nextExerciseCard}>
              <Text style={styles.nextExerciseTitle}>Next Exercise</Text>
              <Text style={styles.nextExerciseName}>
                {currentWorkout.exercises[currentExerciseIndex + 1]?.name}
              </Text>
              <Text style={styles.nextExerciseSets}>
                {currentWorkout.exercises[currentExerciseIndex + 1]?.sets.length} sets
              </Text>
            </SmartFitCard>
          )}

          {/* Workout Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.floor((Date.now() - workoutStartTime) / 60000)}
              </Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentWorkout.exercises.reduce((acc, ex) => 
                  acc + ex.sets.filter(set => set.completed).length, 0
                )}
              </Text>
              <Text style={styles.statLabel}>Sets Done</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentExerciseIndex + 1}/{currentWorkout.exercises.length}
              </Text>
              <Text style={styles.statLabel}>Exercise</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Video Modal */}
      {showVideo && currentExercise && (
        <View style={styles.videoModal}>
          <View style={styles.videoContainer}>
            <VideoPlayer
              videoUrl={currentExercise.videoUrl || 'https://example.com/video.mp4'}
              title={currentExercise.name}
              onClose={() => setShowVideo(false)}
              autoPlay={true}
              loop={true}
            />
          </View>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    color: theme.colors.text,
    fontSize: 18,
  },
  workoutTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  progressContainer: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.small,
  },
  progressText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: theme.spacing[6],
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
  },
  exerciseSection: {
    marginBottom: theme.spacing[6],
  },
  exerciseName: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  setInfo: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  setCard: {
    marginBottom: theme.spacing[4],
  },
  setDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing[4],
  },
  setInfoRow: {
    alignItems: 'center',
  },
  setLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[1],
  },
  setValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  completeButton: {
    marginTop: theme.spacing[2],
  },
  videoButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
  },
  videoButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  restCard: {
    backgroundColor: theme.colors.accent,
    marginBottom: theme.spacing[6],
    alignItems: 'center',
  },
  restTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[2],
  },
  restTime: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing[2],
  },
  restSubtext: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing[4],
  },
  restButtons: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  nextExerciseCard: {
    marginBottom: theme.spacing[6],
  },
  nextExerciseTitle: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[2],
  },
  nextExerciseName: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  nextExerciseSets: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    paddingVertical: theme.spacing[4],
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.accent,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  videoModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  videoContainer: {
    flex: 1,
    margin: theme.spacing[4],
  },
});

export default ActiveWorkoutScreen;
