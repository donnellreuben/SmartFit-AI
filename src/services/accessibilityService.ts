import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilitySettings {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface AccessibilityAnnouncement {
  message: string;
  priority: 'low' | 'medium' | 'high';
  delay?: number;
}

class AccessibilityService {
  private static instance: AccessibilityService;
  private settings: AccessibilitySettings;
  private announcementQueue: AccessibilityAnnouncement[] = [];

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  constructor() {
    this.settings = {
      isScreenReaderEnabled: false,
      isReduceMotionEnabled: false,
      isReduceTransparencyEnabled: false,
      isInvertColorsEnabled: false,
      isBoldTextEnabled: false,
      isGrayscaleEnabled: false,
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
    };
    
    this.initializeAccessibility();
  }

  private async initializeAccessibility() {
    try {
      await this.loadAccessibilitySettings();
      await this.checkScreenReaderStatus();
      await this.checkMotionPreferences();
    } catch (error) {
      console.error('Failed to initialize accessibility:', error);
    }
  }

  private async loadAccessibilitySettings() {
    // In a real app, you'd load from AsyncStorage or user preferences
    console.log('Loading accessibility settings...');
  }

  private async checkScreenReaderStatus() {
    try {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.settings.isScreenReaderEnabled = isEnabled;
    } catch (error) {
      console.error('Failed to check screen reader status:', error);
    }
  }

  private async checkMotionPreferences() {
    try {
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      this.settings.isReduceMotionEnabled = isReduceMotionEnabled;
      this.settings.reducedMotion = isReduceMotionEnabled;
    } catch (error) {
      console.error('Failed to check motion preferences:', error);
    }
  }

  // MARK: - Screen Reader Support
  announce(message: string, priority: 'low' | 'medium' | 'high' = 'medium', delay: number = 0) {
    if (!this.settings.isScreenReaderEnabled) return;

    const announcement: AccessibilityAnnouncement = {
      message,
      priority,
      delay,
    };

    if (delay > 0) {
      setTimeout(() => {
        this.processAnnouncement(announcement);
      }, delay);
    } else {
      this.processAnnouncement(announcement);
    }
  }

  private processAnnouncement(announcement: AccessibilityAnnouncement) {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(announcement.message);
    } else {
      // Android TalkBack
      AccessibilityInfo.announceForAccessibility(announcement.message);
    }
  }

  announceWorkoutStart(workoutName: string) {
    this.announce(
      `Starting workout: ${workoutName}. Tap to begin your first exercise.`,
      'high'
    );
  }

  announceExerciseChange(exerciseName: string, setNumber: number, totalSets: number) {
    this.announce(
      `Exercise: ${exerciseName}. Set ${setNumber} of ${totalSets}.`,
      'high'
    );
  }

  announceSetComplete(setNumber: number, totalSets: number) {
    this.announce(
      `Set ${setNumber} of ${totalSets} complete.`,
      'medium'
    );
  }

  announceRestStart(duration: number) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const timeString = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} seconds` : `${seconds} seconds`;
    
    this.announce(
      `Rest time: ${timeString}. Tap to skip rest or extend time.`,
      'medium'
    );
  }

  announceRestComplete() {
    this.announce(
      'Rest time complete. Ready for next set.',
      'high'
    );
  }

  announceWorkoutComplete(totalDuration: number) {
    const minutes = Math.floor(totalDuration / 60);
    const seconds = totalDuration % 60;
    
    this.announce(
      `Workout complete! Total time: ${minutes} minutes and ${seconds} seconds. Great job!`,
      'high'
    );
  }

  announceProgressUpdate(metric: string, value: string) {
    this.announce(
      `${metric}: ${value}`,
      'low'
    );
  }

  // MARK: - Accessibility Labels and Hints
  getExerciseAccessibilityLabel(exercise: any): string {
    const { name, sets, reps, restTime } = exercise;
    return `${name}. ${sets} sets of ${reps} reps. ${restTime} seconds rest between sets.`;
  }

  getSetButtonAccessibilityLabel(currentSet: number, totalSets: number, isComplete: boolean): string {
    if (isComplete) {
      return `Set ${currentSet} of ${totalSets} completed. Tap to start next set.`;
    }
    return `Set ${currentSet} of ${totalSets}. Tap to complete this set.`;
  }

  getRestTimerAccessibilityLabel(timeRemaining: number): string {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timeString = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} seconds` : `${seconds} seconds`;
    
    return `Rest time remaining: ${timeString}. Tap to skip or extend rest.`;
  }

  getProgressChartAccessibilityLabel(chartType: string, data: any): string {
    switch (chartType) {
      case 'weight':
        return `Weight progression chart. Current weight: ${data.current} pounds.`;
      case 'strength':
        return `Strength progression chart. Showing improvement over time.`;
      case 'endurance':
        return `Endurance progression chart. Displaying workout duration trends.`;
      default:
        return `Progress chart showing ${chartType} data.`;
    }
  }

  // MARK: - High Contrast Support
  getHighContrastColors() {
    if (this.settings.highContrast) {
      return {
        primary: '#FFFFFF',
        secondary: '#000000',
        background: '#000000',
        surface: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        border: '#FFFFFF',
        accent: '#00FF00',
        success: '#00FF00',
        warning: '#FFFF00',
        error: '#FF0000',
      };
    }
    
    return {
      primary: '#1A1A1A',
      secondary: '#666666',
      background: '#0A0A0A',
      surface: '#1A1A1A',
      text: '#FFFFFF',
      textSecondary: '#CCCCCC',
      border: '#333333',
      accent: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
    };
  }

  // MARK: - Font Size Support
  getScaledFontSize(baseSize: number): number {
    const scaleFactors = {
      small: 0.8,
      medium: 1.0,
      large: 1.2,
      'extra-large': 1.4,
    };
    
    return baseSize * scaleFactors[this.settings.fontSize];
  }

  getAccessibilityFontSize(fontSize: 'small' | 'medium' | 'large' | 'extra-large') {
    this.settings.fontSize = fontSize;
  }

  // MARK: - Motion Preferences
  getAnimationDuration(baseDuration: number): number {
    if (this.settings.reducedMotion) {
      return 0; // Disable animations
    }
    return baseDuration;
  }

  getAnimationScale(): number {
    if (this.settings.reducedMotion) {
      return 1; // No scaling effects
    }
    return 1;
  }

  // MARK: - Focus Management
  setAccessibilityFocus(componentRef: any) {
    if (this.settings.isScreenReaderEnabled && componentRef) {
      // In a real app, you'd use AccessibilityInfo.setAccessibilityFocus
      console.log('Setting accessibility focus');
    }
  }

  // MARK: - Gesture Support
  getAccessibilityActions() {
    return [
      { name: 'activate', label: 'Activate' },
      { name: 'longpress', label: 'Long press for options' },
      { name: 'swipeleft', label: 'Swipe left' },
      { name: 'swiperight', label: 'Swipe right' },
      { name: 'swipeup', label: 'Swipe up' },
      { name: 'swipedown', label: 'Swipe down' },
    ];
  }

  // MARK: - Settings Management
  updateAccessibilitySettings(newSettings: Partial<AccessibilitySettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveAccessibilitySettings();
  }

  getAccessibilitySettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  private async saveAccessibilitySettings() {
    // In a real app, you'd save to AsyncStorage
    console.log('Saving accessibility settings:', this.settings);
  }

  // MARK: - Workout-Specific Accessibility
  getWorkoutAccessibilityInstructions(): string {
    return `Welcome to SmartFit AI workout. Use swipe gestures to navigate between exercises. Tap to complete sets. Double tap to start or pause workout.`;
  }

  getExerciseInstructions(exercise: any): string {
    const { name, instructions } = exercise;
    return `${name}. Instructions: ${instructions.join('. ')}. Tap to complete set.`;
  }

  getRestInstructions(): string {
    return `Rest time. Use this time to recover. Tap to skip rest or extend time. Swipe to see next exercise.`;
  }

  // MARK: - Progress Tracking Accessibility
  getProgressAccessibilityLabel(metric: string, current: number, previous: number): string {
    const change = current - previous;
    const changeText = change > 0 ? `increased by ${change}` : 
                      change < 0 ? `decreased by ${Math.abs(change)}` : 
                      'unchanged';
    
    return `${metric}: ${current}. ${changeText} from previous measurement.`;
  }

  // MARK: - Error Handling
  announceError(error: string) {
    this.announce(`Error: ${error}. Please try again.`, 'high');
  }

  announceSuccess(message: string) {
    this.announce(`Success: ${message}`, 'medium');
  }

  // MARK: - Navigation Accessibility
  getNavigationAccessibilityLabel(screenName: string, isActive: boolean): string {
    return `${screenName} screen. ${isActive ? 'Currently active' : 'Tap to navigate'}.`;
  }

  getTabAccessibilityLabel(tabName: string, isSelected: boolean): string {
    return `${tabName} tab. ${isSelected ? 'Selected' : 'Tap to select'}.`;
  }
}

export const accessibilityService = AccessibilityService.getInstance();
