import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SmartFitButton } from './SmartFitButton';
import { SmartFitCard } from './SmartFitCard';
import { theme } from '../constants/theme';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'streak' | 'personal';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // days
  target: number;
  current: number;
  reward: string;
  isActive: boolean;
  isCompleted: boolean;
  startDate: string;
  endDate: string;
  participants?: number;
}

export interface ChallengeSystemProps {
  onJoinChallenge?: (challengeId: string) => void;
  onViewLeaderboard?: (challengeId: string) => void;
  style?: any;
}

export const ChallengeSystem: React.FC<ChallengeSystemProps> = ({
  onJoinChallenge,
  onViewLeaderboard,
  style,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'active' | 'completed'
  >('all');

  // Mock challenges data
  const challenges: Challenge[] = [
    {
      id: '1',
      title: '7-Day Workout Streak',
      description: 'Complete a workout every day for 7 consecutive days',
      type: 'streak',
      difficulty: 'medium',
      duration: 7,
      target: 7,
      current: 3,
      reward: 'Streak Master Badge',
      isActive: true,
      isCompleted: false,
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      participants: 1247,
    },
    {
      id: '2',
      title: '10,000 Steps Daily',
      description: 'Walk 10,000 steps every day this week',
      type: 'weekly',
      difficulty: 'easy',
      duration: 7,
      target: 7,
      current: 5,
      reward: 'Step Counter Badge',
      isActive: true,
      isCompleted: false,
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      participants: 892,
    },
    {
      id: '3',
      title: '100 Push-ups Challenge',
      description: 'Complete 100 push-ups in a single workout',
      type: 'personal',
      difficulty: 'hard',
      duration: 1,
      target: 100,
      current: 0,
      reward: 'Push-up Master Badge',
      isActive: false,
      isCompleted: false,
      startDate: '2024-01-20',
      endDate: '2024-01-20',
      participants: 456,
    },
    {
      id: '4',
      title: '30-Day Transformation',
      description: 'Complete 30 workouts in 30 days',
      type: 'monthly',
      difficulty: 'hard',
      duration: 30,
      target: 30,
      current: 30,
      reward: 'Transformation Badge',
      isActive: false,
      isCompleted: true,
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      participants: 2341,
    },
  ];

  const filteredChallenges = challenges.filter(challenge => {
    switch (selectedFilter) {
      case 'active':
        return challenge.isActive && !challenge.isCompleted;
      case 'completed':
        return challenge.isCompleted;
      default:
        return true;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'hard':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleJoinChallenge = (challenge: Challenge) => {
    if (challenge.isActive) {
      Alert.alert(
        'Join Challenge',
        `Are you ready to start "${challenge.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Join',
            onPress: () => {
              if (onJoinChallenge) onJoinChallenge(challenge.id);
              Alert.alert(
                'Joined!',
                `You've joined the ${challenge.title} challenge. Good luck!`,
              );
            },
          },
        ],
      );
    } else {
      Alert.alert(
        'Challenge Not Available',
        'This challenge is not currently active.',
      );
    }
  };

  const handleViewLeaderboard = (challenge: Challenge) => {
    if (onViewLeaderboard) {
      onViewLeaderboard(challenge.id);
    } else {
      Alert.alert('Leaderboard', `Viewing leaderboard for ${challenge.title}`);
    }
  };

  const renderChallengeCard = (challenge: Challenge) => (
    <SmartFitCard key={challenge.id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>
            {challenge.description}
          </Text>
        </View>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(challenge.difficulty) },
          ]}
        >
          <Text style={styles.difficultyText}>
            {challenge.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.challengeStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {challenge.current}/{challenge.target}
          </Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{challenge.participants}</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{challenge.duration}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${getProgressPercentage(
                  challenge.current,
                  challenge.target,
                )}%`,
                backgroundColor: challenge.isCompleted
                  ? theme.colors.success
                  : theme.colors.accent,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(
            getProgressPercentage(challenge.current, challenge.target),
          )}
          % Complete
        </Text>
      </View>

      {/* Reward */}
      <View style={styles.rewardContainer}>
        <Text style={styles.rewardLabel}>Reward:</Text>
        <Text style={styles.rewardText}>🏆 {challenge.reward}</Text>
      </View>

      {/* Actions */}
      <View style={styles.challengeActions}>
        {challenge.isActive && !challenge.isCompleted && (
          <SmartFitButton
            title="Join Challenge"
            onPress={() => handleJoinChallenge(challenge)}
            size="small"
            style={styles.joinButton}
          />
        )}

        {challenge.isCompleted && (
          <SmartFitButton
            title="Completed ✓"
            variant="outline"
            size="small"
            style={styles.completedButton}
            onPress={() => {}}
            disabled
          />
        )}

        <SmartFitButton
          title="Leaderboard"
          onPress={() => handleViewLeaderboard(challenge)}
          variant="secondary"
          size="small"
          style={styles.leaderboardButton}
        />
      </View>
    </SmartFitCard>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>
        <Text style={styles.subtitle}>
          Join challenges, compete with friends, and earn rewards!
        </Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'completed'] as const).map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Challenges List */}
      <ScrollView
        style={styles.challengesList}
        showsVerticalScrollIndicator={false}
      >
        {filteredChallenges.map(renderChallengeCard)}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <SmartFitButton
          title="Create Custom Challenge"
          onPress={() =>
            Alert.alert('Custom Challenge', 'Feature coming soon!')
          }
          variant="outline"
          style={styles.customButton}
        />
        <SmartFitButton
          title="View All Achievements"
          onPress={() =>
            Alert.alert('Achievements', 'View your earned badges and rewards!')
          }
          variant="secondary"
          style={styles.achievementsButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.accent,
  },
  filterButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: theme.colors.text,
  },
  challengesList: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  challengeCard: {
    marginBottom: theme.spacing.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  challengeInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  challengeTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  challengeDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  difficultyText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 10,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    marginBottom: theme.spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  rewardLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  rewardText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  challengeActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  joinButton: {
    flex: 1,
  },
  completedButton: {
    flex: 1,
  },
  leaderboardButton: {
    flex: 1,
  },
  quickActions: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  customButton: {
    marginBottom: theme.spacing.sm,
  },
  achievementsButton: {
    // Additional styles if needed
  },
});

export default ChallengeSystem;
