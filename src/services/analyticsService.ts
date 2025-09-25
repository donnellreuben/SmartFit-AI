import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';

export interface AnalyticsEvent {
  id: string;
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties: { [key: string]: any };
  timestamp: string;
  userId: string;
  sessionId: string;
  deviceId: string;
  platform: string;
  version: string;
}

export interface UserBehavior {
  userId: string;
  sessionDuration: number;
  screenViews: number;
  workoutCompletions: number;
  exerciseCompletions: number;
  socialInteractions: number;
  aiInteractions: number;
  lastActive: string;
  totalSessions: number;
  averageSessionDuration: number;
  favoriteExercises: string[];
  workoutStreak: number;
  achievements: string[];
}

export interface BusinessMetrics {
  totalUsers: number;
  activeUsers: number;
  retentionRate: number;
  conversionRate: number;
  averageRevenuePerUser: number;
  churnRate: number;
  engagementScore: number;
  featureAdoption: { [key: string]: number };
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: {
    control: string;
    test: string;
  };
  trafficAllocation: number;
  startDate: string;
  endDate?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  metrics: string[];
  results?: {
    control: { [key: string]: number };
    test: { [key: string]: number };
    significance: number;
  };
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private currentSessionId: string = '';
  private userId: string = '';
  private deviceId: string = '';
  private isInitialized: boolean = false;
  private abTests: ABTest[] = [];

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  constructor() {
    this.initializeAnalytics();
  }

  private async initializeAnalytics() {
    try {
      await this.loadAnalyticsData();
      await this.generateDeviceId();
      await this.startNewSession();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private async loadAnalyticsData() {
    try {
      const eventsData = await AsyncStorage.getItem('analytics_events');
      if (eventsData) {
        this.events = JSON.parse(eventsData);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  }

  private async saveAnalyticsData() {
    try {
      await AsyncStorage.setItem('analytics_events', JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  private async generateDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      this.deviceId = deviceId;
    } catch (error) {
      console.error('Failed to generate device ID:', error);
    }
  }

  private async startNewSession() {
    try {
      this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.trackEvent('session_start', 'user', 'session_started', 'app_launch');
    } catch (error) {
      console.error('Failed to start new session:', error);
    }
  }

  // MARK: - Event Tracking
  async trackEvent(
    name: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: { [key: string]: any }
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        category,
        action,
        label,
        value,
        properties: properties || {},
        timestamp: new Date().toISOString(),
        userId: this.userId,
        sessionId: this.currentSessionId,
        deviceId: this.deviceId,
        platform: Platform.OS,
        version: '1.0.0',
      };

      this.events.push(event);
      await this.saveAnalyticsData();
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // MARK: - Screen Tracking
  async trackScreenView(screenName: string, properties?: { [key: string]: any }): Promise<void> {
    await this.trackEvent(
      'screen_view',
      'navigation',
      'screen_viewed',
      screenName,
      undefined,
      { screenName, ...properties }
    );
  }

  // MARK: - User Actions
  async trackUserAction(action: string, properties?: { [key: string]: any }): Promise<void> {
    await this.trackEvent(
      'user_action',
      'user',
      action,
      undefined,
      undefined,
      properties
    );
  }

  async trackWorkoutStart(workoutId: string, workoutName: string): Promise<void> {
    await this.trackEvent(
      'workout_start',
      'workout',
      'workout_started',
      workoutName,
      undefined,
      { workoutId, workoutName }
    );
  }

  async trackWorkoutComplete(workoutId: string, duration: number, calories: number): Promise<void> {
    await this.trackEvent(
      'workout_complete',
      'workout',
      'workout_completed',
      undefined,
      duration,
      { workoutId, duration, calories }
    );
  }

  async trackExerciseComplete(exerciseId: string, exerciseName: string, sets: number, reps: number): Promise<void> {
    await this.trackEvent(
      'exercise_complete',
      'workout',
      'exercise_completed',
      exerciseName,
      sets,
      { exerciseId, exerciseName, sets, reps }
    );
  }

  async trackEquipmentCapture(equipmentCount: number, equipmentTypes: string[]): Promise<void> {
    await this.trackEvent(
      'equipment_capture',
      'ai',
      'equipment_captured',
      undefined,
      equipmentCount,
      { equipmentCount, equipmentTypes }
    );
  }

  async trackAIInteraction(interactionType: string, query: string, responseTime: number): Promise<void> {
    await this.trackEvent(
      'ai_interaction',
      'ai',
      interactionType,
      undefined,
      responseTime,
      { interactionType, query, responseTime }
    );
  }

  async trackSocialAction(action: string, targetId: string, targetType: string): Promise<void> {
    await this.trackEvent(
      'social_action',
      'social',
      action,
      targetType,
      undefined,
      { targetId, targetType }
    );
  }

  // MARK: - Error Tracking
  async trackError(error: string, errorCode: string, stackTrace?: string): Promise<void> {
    await this.trackEvent(
      'error',
      'error',
      'error_occurred',
      errorCode,
      undefined,
      { error, errorCode, stackTrace }
    );
  }

  // MARK: - Performance Tracking
  async trackPerformance(metric: string, value: number, unit: string): Promise<void> {
    await this.trackEvent(
      'performance',
      'performance',
      metric,
      unit,
      value,
      { metric, value, unit }
    );
  }

  // MARK: - User Behavior Analysis
  async analyzeUserBehavior(userId: string): Promise<UserBehavior> {
    try {
      const userEvents = this.events.filter(event => event.userId === userId);
      const sessions = this.getUserSessions(userId);
      
      const behavior: UserBehavior = {
        userId,
        sessionDuration: this.calculateAverageSessionDuration(sessions),
        screenViews: userEvents.filter(e => e.name === 'screen_view').length,
        workoutCompletions: userEvents.filter(e => e.name === 'workout_complete').length,
        exerciseCompletions: userEvents.filter(e => e.name === 'exercise_complete').length,
        socialInteractions: userEvents.filter(e => e.category === 'social').length,
        aiInteractions: userEvents.filter(e => e.category === 'ai').length,
        lastActive: this.getLastActiveTime(userEvents),
        totalSessions: sessions.length,
        averageSessionDuration: this.calculateAverageSessionDuration(sessions),
        favoriteExercises: this.getFavoriteExercises(userEvents),
        workoutStreak: this.calculateWorkoutStreak(userEvents),
        achievements: this.getUserAchievements(userEvents),
      };

      return behavior;
    } catch (error) {
      console.error('Failed to analyze user behavior:', error);
      throw error;
    }
  }

  private getUserSessions(userId: string): string[] {
    const userEvents = this.events.filter(event => event.userId === userId);
    const sessionIds = new Set(userEvents.map(event => event.sessionId));
    return Array.from(sessionIds);
  }

  private calculateAverageSessionDuration(sessions: string[]): number {
    // Simplified calculation - in a real app, you'd calculate actual session durations
    return sessions.length * 30; // 30 minutes per session
  }

  private getLastActiveTime(userEvents: AnalyticsEvent[]): string {
    if (userEvents.length === 0) return new Date().toISOString();
    
    const sortedEvents = userEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return sortedEvents[0].timestamp;
  }

  private getFavoriteExercises(userEvents: AnalyticsEvent[]): string[] {
    const exerciseEvents = userEvents.filter(e => e.name === 'exercise_complete');
    const exerciseCounts: { [key: string]: number } = {};
    
    exerciseEvents.forEach(event => {
      const exerciseName = event.properties.exerciseName;
      if (exerciseName) {
        exerciseCounts[exerciseName] = (exerciseCounts[exerciseName] || 0) + 1;
      }
    });
    
    return Object.entries(exerciseCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([exercise]) => exercise);
  }

  private calculateWorkoutStreak(userEvents: AnalyticsEvent[]): number {
    // Simplified calculation - in a real app, you'd calculate actual streak
    return userEvents.filter(e => e.name === 'workout_complete').length;
  }

  private getUserAchievements(userEvents: AnalyticsEvent[]): string[] {
    const achievements: string[] = [];
    const workoutCompletions = userEvents.filter(e => e.name === 'workout_complete').length;
    
    if (workoutCompletions >= 1) achievements.push('first_workout');
    if (workoutCompletions >= 10) achievements.push('workout_warrior');
    if (workoutCompletions >= 50) achievements.push('fitness_champion');
    
    return achievements;
  }

  // MARK: - Business Metrics
  async calculateBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      const uniqueUsers = new Set(this.events.map(event => event.userId));
      const activeUsers = this.getActiveUsers();
      const retentionRate = this.calculateRetentionRate();
      const conversionRate = this.calculateConversionRate();
      const churnRate = this.calculateChurnRate();
      const engagementScore = this.calculateEngagementScore();
      const featureAdoption = this.calculateFeatureAdoption();

      return {
        totalUsers: uniqueUsers.size,
        activeUsers,
        retentionRate,
        conversionRate,
        averageRevenuePerUser: 0, // Would be calculated from subscription data
        churnRate,
        engagementScore,
        featureAdoption,
      };
    } catch (error) {
      console.error('Failed to calculate business metrics:', error);
      throw error;
    }
  }

  private getActiveUsers(): number {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp) > lastWeek
    );
    
    const uniqueUsers = new Set(recentEvents.map(event => event.userId));
    return uniqueUsers.size;
  }

  private calculateRetentionRate(): number {
    // Simplified calculation
    return 0.7; // 70% retention rate
  }

  private calculateConversionRate(): number {
    // Simplified calculation
    return 0.15; // 15% conversion rate
  }

  private calculateChurnRate(): number {
    // Simplified calculation
    return 0.05; // 5% churn rate
  }

  private calculateEngagementScore(): number {
    const totalEvents = this.events.length;
    const uniqueUsers = new Set(this.events.map(event => event.userId)).size;
    return totalEvents / uniqueUsers; // Events per user
  }

  private calculateFeatureAdoption(): { [key: string]: number } {
    const features = ['workout', 'ai', 'social', 'progress'];
    const adoption: { [key: string]: number } = {};
    
    features.forEach(feature => {
      const featureEvents = this.events.filter(event => 
        event.category === feature || event.properties.feature === feature
      );
      adoption[feature] = featureEvents.length / this.events.length;
    });
    
    return adoption;
  }

  // MARK: - A/B Testing
  async createABTest(test: Omit<ABTest, 'id' | 'status'>): Promise<string> {
    try {
      const abTest: ABTest = {
        ...test,
        id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'draft',
      };
      
      this.abTests.push(abTest);
      await this.saveABTests();
      
      return abTest.id;
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      throw error;
    }
  }

  async startABTest(testId: string): Promise<void> {
    try {
      const test = this.abTests.find(t => t.id === testId);
      if (test) {
        test.status = 'running';
        await this.saveABTests();
      }
    } catch (error) {
      console.error('Failed to start A/B test:', error);
    }
  }

  async getABTestVariant(testId: string, userId: string): Promise<string> {
    try {
      const test = this.abTests.find(t => t.id === testId);
      if (!test || test.status !== 'running') {
        return 'control';
      }

      // Simple hash-based assignment
      const hash = this.hashString(userId + testId);
      const allocation = test.trafficAllocation / 100;
      
      return hash < allocation ? 'test' : 'control';
    } catch (error) {
      console.error('Failed to get A/B test variant:', error);
      return 'control';
    }
  }

  async trackABTestEvent(testId: string, variant: string, eventName: string, properties?: { [key: string]: any }): Promise<void> {
    await this.trackEvent(
      'ab_test_event',
      'ab_test',
      eventName,
      testId,
      undefined,
      { testId, variant, ...properties }
    );
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  private async saveABTests() {
    try {
      await AsyncStorage.setItem('ab_tests', JSON.stringify(this.abTests));
    } catch (error) {
      console.error('Failed to save A/B tests:', error);
    }
  }

  // MARK: - Data Export
  async exportAnalyticsData(): Promise<AnalyticsEvent[]> {
    return [...this.events];
  }

  async clearAnalyticsData(): Promise<void> {
    try {
      this.events = [];
      await AsyncStorage.removeItem('analytics_events');
    } catch (error) {
      console.error('Failed to clear analytics data:', error);
    }
  }

  // MARK: - User Management
  setUserId(userId: string): void {
    this.userId = userId;
  }

  getUserId(): string {
    return this.userId;
  }

  getSessionId(): string {
    return this.currentSessionId;
  }

  getDeviceId(): string {
    return this.deviceId;
  }
}

export const analyticsService = AnalyticsService.getInstance();
