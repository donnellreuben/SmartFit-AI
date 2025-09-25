import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SmartFitCard } from './SmartFitCard';
import { theme } from '../constants/theme';

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

export interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  onVideoPress?: () => void;
  style?: any;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
  onVideoPress,
  style,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return theme.colors.success;
      case 'Intermediate':
        return theme.colors.warning;
      case 'Advanced':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatRestTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <SmartFitCard
      onPress={onPress}
      style={[styles.card, style]}
      variant="elevated"
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={styles.muscleGroups}>
              {exercise.muscleGroups.map((muscle, index) => (
                <View key={index} style={styles.muscleTag}>
                  <Text style={styles.muscleText}>{muscle}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Video Thumbnail */}
          <TouchableOpacity
            style={styles.videoContainer}
            onPress={onVideoPress}
            activeOpacity={0.8}
          >
            <View style={styles.videoThumbnail}>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Exercise Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sets:</Text>
            <Text style={styles.detailValue}>{exercise.sets}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reps:</Text>
            <Text style={styles.detailValue}>{exercise.reps}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rest:</Text>
            <Text style={styles.detailValue}>{formatRestTime(exercise.restTime)}</Text>
          </View>
        </View>

        {/* Equipment and Difficulty */}
        <View style={styles.footer}>
          <View style={styles.equipmentContainer}>
            <Text style={styles.equipmentLabel}>Equipment:</Text>
            <Text style={styles.equipmentText}>
              {exercise.equipment.length > 0 ? exercise.equipment.join(', ') : 'Bodyweight'}
            </Text>
          </View>
          
          <View style={styles.difficultyContainer}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
              <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
            </View>
          </View>
        </View>
      </View>
    </SmartFitCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing[4],
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing[3],
  },
  exerciseName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[1],
  },
  muscleTag: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.small,
  },
  muscleText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontSize: 12,
  },
  videoContainer: {
    width: 80,
    height: 60,
  },
  videoThumbnail: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: theme.colors.text,
    fontSize: 12,
    marginLeft: 2,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
    paddingHorizontal: theme.spacing[1],
  },
  detailRow: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[1],
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipmentContainer: {
    flex: 1,
    marginRight: theme.spacing[2],
  },
  equipmentLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[1],
  },
  equipmentText: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  difficultyContainer: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.small,
  },
  difficultyText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
});
