import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import { SmartFitButton } from './SmartFitButton';
import { SmartFitCard } from './SmartFitCard';
import { theme } from '../constants/theme';

export interface RestTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  onSkip?: () => void;
  onExtend?: () => void;
  exerciseName?: string;
  nextExercise?: string;
  style?: any;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  duration,
  onComplete,
  onSkip,
  onExtend,
  exerciseName,
  nextExercise,
  style,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, isPaused]);

  useEffect(() => {
    // Haptic feedback at specific intervals
    if (timeRemaining === 10 || timeRemaining === 5 || timeRemaining === 3) {
      Vibration.vibrate([0, 200, 100, 200]);
    }
  }, [timeRemaining]);

  const handleComplete = () => {
    setIsCompleted(true);
    Vibration.vibrate([0, 500, 200, 500, 200, 500]); // Completion vibration pattern
    onComplete();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    Vibration.vibrate([0, 100]); // Pause vibration
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Rest',
      'Are you sure you want to skip the rest period?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => {
          if (onSkip) onSkip();
          handleComplete();
        }}
      ]
    );
  };

  const handleExtend = () => {
    if (onExtend) {
      onExtend();
    } else {
      // Default: extend by 30 seconds
      setTimeRemaining(prev => prev + 30);
      Vibration.vibrate([0, 100, 50, 100]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((duration - timeRemaining) / duration) * 100;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 5) return theme.colors.error;
    if (timeRemaining <= 10) return theme.colors.warning;
    return theme.colors.accent;
  };

  return (
    <SmartFitCard style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Rest Time</Text>
        {exerciseName && (
          <Text style={styles.exerciseName}>Completed: {exerciseName}</Text>
        )}
      </View>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: getTimeColor() }]}>
          {formatTime(timeRemaining)}
        </Text>
        
        {!isCompleted && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: getTimeColor()
                  }
                ]}
              />
            </View>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>✅ Rest Complete!</Text>
            {nextExercise && (
              <Text style={styles.nextExerciseText}>
                Next: {nextExercise}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Controls */}
      {!isCompleted && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isPaused ? styles.pausedButton : styles.activeButton]}
            onPress={handlePause}
          >
            <Text style={styles.controlButtonText}>
              {isPaused ? '▶️' : '⏸️'}
            </Text>
            <Text style={styles.controlButtonLabel}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleSkip}
          >
            <Text style={styles.controlButtonText}>⏭️</Text>
            <Text style={styles.controlButtonLabel}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleExtend}
          >
            <Text style={styles.controlButtonText}>⏰</Text>
            <Text style={styles.controlButtonLabel}>+30s</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      {!isCompleted && (
        <View style={styles.quickActions}>
          <SmartFitButton
            title="Skip Rest"
            onPress={handleSkip}
            variant="outline"
            size="small"
            style={styles.skipButton}
          />
          <SmartFitButton
            title="Extend +30s"
            onPress={handleExtend}
            variant="secondary"
            size="small"
            style={styles.extendButton}
          />
        </View>
      )}
    </SmartFitCard>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.accent,
    marginVertical: theme.spacing[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  exerciseName: {
    ...theme.typography.body,
    color: theme.colors.text,
    opacity: 0.8,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  timerText: {
    ...theme.typography.h1,
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: theme.spacing[4],
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completedContainer: {
    alignItems: 'center',
  },
  completedText: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing[2],
  },
  nextExerciseText: {
    ...theme.typography.body,
    color: theme.colors.text,
    opacity: 0.8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing[4],
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  pausedButton: {
    backgroundColor: theme.colors.warning,
  },
  controlButtonText: {
    fontSize: 24,
    marginBottom: theme.spacing[1],
  },
  controlButtonLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    justifyContent: 'center',
  },
  skipButton: {
    flex: 1,
  },
  extendButton: {
    flex: 1,
  },
});

export default RestTimer;
