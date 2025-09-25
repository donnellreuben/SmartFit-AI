import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SmartFitButton } from './SmartFitButton';
import { SmartFitCard } from './SmartFitCard';
import { theme } from '../constants/theme';

export interface WorkoutShareData {
  workoutName: string;
  duration: number;
  exercises: number;
  sets: number;
  calories: number;
  date: string;
  notes?: string;
}

export interface SocialShareProps {
  workoutData: WorkoutShareData;
  onClose?: () => void;
  style?: any;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  workoutData,
  onClose,
  style,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [includePhoto, setIncludePhoto] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const generateShareText = () => {
    const baseText = `🏋️ Just completed "${workoutData.workoutName}"!\n\n` +
      `⏱️ Duration: ${workoutData.duration} minutes\n` +
      `💪 Exercises: ${workoutData.exercises}\n` +
      `🔢 Sets: ${workoutData.sets}\n` +
      `🔥 Calories: ${workoutData.calories}\n\n` +
      `#SmartFitAI #Fitness #Workout`;

    return customMessage ? `${customMessage}\n\n${baseText}` : baseText;
  };

  const handleShare = async (platform: string) => {
    try {
      const shareText = generateShareText();
      
      if (platform === 'native') {
        await Share.share({
          message: shareText,
          title: 'My Workout Achievement',
        });
      } else {
        // Simulate sharing to specific platforms
        Alert.alert(
          'Share to ' + platform,
          'This would open the ' + platform + ' app to share your workout.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Share', onPress: () => {
              Alert.alert('Shared!', `Workout shared to ${platform} successfully.`);
              if (onClose) onClose();
            }}
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share workout. Please try again.');
    }
  };

  const handleQuickShare = () => {
    Alert.alert(
      'Quick Share',
      'Share your workout achievement with friends!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => handleShare('native') }
      ]
    );
  };

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366' },
    { id: 'native', name: 'More Options', icon: '📤', color: theme.colors.accent },
  ];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Share Your Achievement</Text>
        <Text style={styles.subtitle}>
          Celebrate your workout with friends and stay motivated!
        </Text>
      </View>

      {/* Workout Summary */}
      <SmartFitCard style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Workout Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutData.duration}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutData.exercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutData.sets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutData.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </SmartFitCard>

      {/* Custom Message */}
      <SmartFitCard style={styles.messageCard}>
        <Text style={styles.messageTitle}>Add a Personal Message</Text>
        <Text style={styles.messagePlaceholder}>
          "Feeling stronger every day! 💪"
        </Text>
        <SmartFitButton
          title="Customize Message"
          onPress={() => Alert.alert('Custom Message', 'Message customization coming soon!')}
          variant="outline"
          size="small"
        />
      </SmartFitCard>

      {/* Photo Options */}
      <SmartFitCard style={styles.photoCard}>
        <Text style={styles.photoTitle}>Include Progress Photo</Text>
        <View style={styles.photoOptions}>
          <TouchableOpacity
            style={[
              styles.photoOption,
              !includePhoto && styles.photoOptionSelected
            ]}
            onPress={() => setIncludePhoto(false)}
          >
            <Text style={styles.photoOptionText}>No Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.photoOption,
              includePhoto && styles.photoOptionSelected
            ]}
            onPress={() => setIncludePhoto(true)}
          >
            <Text style={styles.photoOptionText}>Include Photo</Text>
          </TouchableOpacity>
        </View>
      </SmartFitCard>

      {/* Share Platforms */}
      <View style={styles.platformsSection}>
        <Text style={styles.platformsTitle}>Share to:</Text>
        <View style={styles.platformsGrid}>
          {platforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={[
                styles.platformButton,
                { backgroundColor: platform.color }
              ]}
              onPress={() => handleShare(platform.id)}
            >
              <Text style={styles.platformIcon}>{platform.icon}</Text>
              <Text style={styles.platformName}>{platform.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Share Button */}
      <SmartFitButton
        title="Quick Share"
        onPress={handleQuickShare}
        size="large"
        style={styles.quickShareButton}
      />

      {/* Privacy Notice */}
      <Text style={styles.privacyNotice}>
        🔒 Your personal data is never shared. Only workout stats and your message are shared.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryCard: {
    marginBottom: theme.spacing[4],
  },
  summaryTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[4],
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  messageCard: {
    marginBottom: theme.spacing[4],
  },
  messageTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[3],
  },
  messagePlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing[3],
    textAlign: 'center',
  },
  photoCard: {
    marginBottom: theme.spacing[4],
  },
  photoTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[3],
  },
  photoOptions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  photoOption: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  photoOptionSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  photoOptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  platformsSection: {
    marginBottom: theme.spacing[6],
  },
  platformsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[4],
  },
  platformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  platformButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  platformIcon: {
    fontSize: 24,
    marginBottom: theme.spacing[1],
  },
  platformName: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
  },
  quickShareButton: {
    marginBottom: theme.spacing[4],
  },
  privacyNotice: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SocialShare;
