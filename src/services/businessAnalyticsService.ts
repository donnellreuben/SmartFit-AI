import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from './analyticsService';

export interface BusinessMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  retentionRate: number;
  churnRate: number;
  engagementScore: number;
  averageSessionDuration: number;
  totalSessions: number;
  conversionRate: number;
  revenue: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  costPerAcquisition: number;
  returnOnInvestment: number;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    minSessions?: number;
    maxSessions?: number;
    minRevenue?: number;
    maxRevenue?: number;
    lastActiveDays?: number;
    subscriptionStatus?: string;
  };
  userCount: number;
  percentage: number;
}

export interface CohortAnalysis {
  cohort: string;
  period: string;
  users: number;
  retention: number[];
  revenue: number[];
}

export interface FunnelAnalysis {
  stage: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface RevenueAnalysis {
  period: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  inAppPurchaseRevenue: number;
  adRevenue: number;
  refunds: number;
  netRevenue: number;
  growthRate: number;
}

class BusinessAnalyticsService {
  private static instance: BusinessAnalyticsService;
  private metrics: BusinessMetrics;
  private userSegments: UserSegment[];
  private cohortData: CohortAnalysis[];
  private funnelData: FunnelAnalysis[];
  private revenueData: RevenueAnalysis[];

  static getInstance(): BusinessAnalyticsService {
    if (!BusinessAnalyticsService.instance) {
      BusinessAnalyticsService.instance = new BusinessAnalyticsService();
    }
    return BusinessAnalyticsService.instance;
  }

  constructor() {
    this.metrics = {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      returningUsers: 0,
      retentionRate: 0,
      churnRate: 0,
      engagementScore: 0,
      averageSessionDuration: 0,
      totalSessions: 0,
      conversionRate: 0,
      revenue: 0,
      averageRevenuePerUser: 0,
      lifetimeValue: 0,
      costPerAcquisition: 0,
      returnOnInvestment: 0,
    };

    this.userSegments = [];
    this.cohortData = [];
    this.funnelData = [];
    this.revenueData = [];

    this.initializeAnalytics();
  }

  private async initializeAnalytics() {
    try {
      await this.loadAnalyticsData();
      await this.calculateMetrics();
    } catch (error) {
      console.error('Failed to initialize business analytics:', error);
    }
  }

  private async loadAnalyticsData() {
    try {
      const metricsData = await AsyncStorage.getItem('business_metrics');
      if (metricsData) {
        this.metrics = { ...this.metrics, ...JSON.parse(metricsData) };
      }

      const segmentsData = await AsyncStorage.getItem('user_segments');
      if (segmentsData) {
        this.userSegments = JSON.parse(segmentsData);
      }

      const cohortData = await AsyncStorage.getItem('cohort_analysis');
      if (cohortData) {
        this.cohortData = JSON.parse(cohortData);
      }

      const funnelData = await AsyncStorage.getItem('funnel_analysis');
      if (funnelData) {
        this.funnelData = JSON.parse(funnelData);
      }

      const revenueData = await AsyncStorage.getItem('revenue_analysis');
      if (revenueData) {
        this.revenueData = JSON.parse(revenueData);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  }

  private async saveAnalyticsData() {
    try {
      await AsyncStorage.setItem(
        'business_metrics',
        JSON.stringify(this.metrics),
      );
      await AsyncStorage.setItem(
        'user_segments',
        JSON.stringify(this.userSegments),
      );
      await AsyncStorage.setItem(
        'cohort_analysis',
        JSON.stringify(this.cohortData),
      );
      await AsyncStorage.setItem(
        'funnel_analysis',
        JSON.stringify(this.funnelData),
      );
      await AsyncStorage.setItem(
        'revenue_analysis',
        JSON.stringify(this.revenueData),
      );
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  // MARK: - Metrics Calculation
  private async calculateMetrics() {
    try {
      // const analyticsData = await analyticsService.calculateBusinessMetrics();
      const events = await analyticsService.exportAnalyticsData();

      // Calculate user metrics
      const uniqueUsers = new Set(events.map(event => event.userId));
      const activeUsers = this.calculateActiveUsers(events);
      const newUsers = this.calculateNewUsers(events);
      const returningUsers = this.calculateReturningUsers(events);

      // Calculate engagement metrics
      const engagementScore = this.calculateEngagementScore(events);
      const averageSessionDuration =
        this.calculateAverageSessionDuration(events);
      const totalSessions = this.calculateTotalSessions(events);

      // Calculate retention and churn
      const retentionRate = this.calculateRetentionRate(events);
      const churnRate = this.calculateChurnRate(events);

      // Calculate conversion metrics
      const conversionRate = this.calculateConversionRate(events);

      // Calculate revenue metrics
      const revenue = this.calculateRevenue(events);
      const averageRevenuePerUser = revenue / Math.max(uniqueUsers.size, 1);
      const lifetimeValue = this.calculateLifetimeValue(events);

      // Calculate acquisition metrics
      const costPerAcquisition = this.calculateCostPerAcquisition();
      const returnOnInvestment = this.calculateReturnOnInvestment(
        revenue,
        costPerAcquisition,
      );

      this.metrics = {
        totalUsers: uniqueUsers.size,
        activeUsers,
        newUsers,
        returningUsers,
        retentionRate,
        churnRate,
        engagementScore,
        averageSessionDuration,
        totalSessions,
        conversionRate,
        revenue,
        averageRevenuePerUser,
        lifetimeValue,
        costPerAcquisition,
        returnOnInvestment,
      };

      await this.saveAnalyticsData();
    } catch (error) {
      console.error('Failed to calculate metrics:', error);
    }
  }

  private calculateActiveUsers(events: any[]): number {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentEvents = events.filter(
      event => new Date(event.timestamp) > lastWeek,
    );

    const uniqueUsers = new Set(recentEvents.map(event => event.userId));
    return uniqueUsers.size;
  }

  private calculateNewUsers(events: any[]): number {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const newUserEvents = events.filter(
      event =>
        new Date(event.timestamp) > lastWeek &&
        event.name === 'user_registration',
    );

    return newUserEvents.length;
  }

  private calculateReturningUsers(events: any[]): number {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentEvents = events.filter(
      event => new Date(event.timestamp) > lastWeek,
    );

    const uniqueUsers = new Set(recentEvents.map(event => event.userId));
    return uniqueUsers.size;
  }

  private calculateEngagementScore(events: any[]): number {
    const uniqueUsers = new Set(events.map(event => event.userId));
    return events.length / Math.max(uniqueUsers.size, 1);
  }

  private calculateAverageSessionDuration(events: any[]): number {
    const sessionEvents = events.filter(
      event => event.name === 'session_start',
    );
    return sessionEvents.length > 0 ? 30 : 0; // Mock 30 minutes average
  }

  private calculateTotalSessions(events: any[]): number {
    return events.filter(event => event.name === 'session_start').length;
  }

  private calculateRetentionRate(_events: any[]): number {
    // Simplified calculation - in a real app, you'd use cohort analysis
    return 0.7; // 70% retention rate
  }

  private calculateChurnRate(_events: any[]): number {
    // Simplified calculation
    return 0.05; // 5% churn rate
  }

  private calculateConversionRate(events: any[]): number {
    const totalUsers = new Set(events.map(event => event.userId)).size;
    const convertedUsers = events.filter(
      event => event.name === 'subscription_purchase',
    ).length;

    return totalUsers > 0 ? convertedUsers / totalUsers : 0;
  }

  private calculateRevenue(events: any[]): number {
    const revenueEvents = events.filter(
      event =>
        event.name === 'subscription_purchase' ||
        event.name === 'in_app_purchase',
    );

    return revenueEvents.reduce((total, event) => {
      return total + (event.value || 0);
    }, 0);
  }

  private calculateLifetimeValue(events: any[]): number {
    const revenue = this.calculateRevenue(events);
    const uniqueUsers = new Set(events.map(event => event.userId)).size;

    return uniqueUsers > 0 ? revenue / uniqueUsers : 0;
  }

  private calculateCostPerAcquisition(): number {
    // Mock calculation - in a real app, you'd track marketing spend
    return 5.0; // $5 per acquisition
  }

  private calculateReturnOnInvestment(revenue: number, cost: number): number {
    return cost > 0 ? (revenue - cost) / cost : 0;
  }

  // MARK: - User Segmentation
  async createUserSegments(): Promise<UserSegment[]> {
    try {
      const events = await analyticsService.exportAnalyticsData();
      const segments: UserSegment[] = [
        {
          id: 'power_users',
          name: 'Power Users',
          description: 'Highly engaged users with high activity',
          criteria: {
            minSessions: 50,
            minRevenue: 100,
            lastActiveDays: 7,
          },
          userCount: 0,
          percentage: 0,
        },
        {
          id: 'regular_users',
          name: 'Regular Users',
          description: 'Consistent users with moderate activity',
          criteria: {
            minSessions: 10,
            maxSessions: 49,
            lastActiveDays: 14,
          },
          userCount: 0,
          percentage: 0,
        },
        {
          id: 'casual_users',
          name: 'Casual Users',
          description: 'Occasional users with low activity',
          criteria: {
            maxSessions: 9,
            lastActiveDays: 30,
          },
          userCount: 0,
          percentage: 0,
        },
        {
          id: 'premium_users',
          name: 'Premium Users',
          description: 'Users with active subscriptions',
          criteria: {
            subscriptionStatus: 'premium',
            lastActiveDays: 30,
          },
          userCount: 0,
          percentage: 0,
        },
        {
          id: 'churned_users',
          name: 'Churned Users',
          description: 'Users who have stopped using the app',
          criteria: {
            lastActiveDays: 90,
          },
          userCount: 0,
          percentage: 0,
        },
      ];

      // Calculate segment sizes
      const totalUsers = new Set(events.map(event => event.userId)).size;

      for (const segment of segments) {
        const segmentUsers = this.calculateSegmentUsers(
          events,
          segment.criteria,
        );
        segment.userCount = segmentUsers;
        segment.percentage =
          totalUsers > 0 ? (segmentUsers / totalUsers) * 100 : 0;
      }

      this.userSegments = segments;
      await this.saveAnalyticsData();

      return segments;
    } catch (error) {
      console.error('Failed to create user segments:', error);
      return [];
    }
  }

  private calculateSegmentUsers(events: any[], criteria: any): number {
    // Simplified calculation - in a real app, you'd have more sophisticated logic
    const uniqueUsers = new Set(events.map(event => event.userId));
    let count = 0;

    for (const userId of uniqueUsers) {
      const userEvents = events.filter(event => event.userId === userId);
      const sessionCount = userEvents.filter(
        event => event.name === 'session_start',
      ).length;
      const lastActive = this.getLastActiveDate(userEvents);
      const daysSinceActive = lastActive
        ? (new Date().getTime() - new Date(lastActive).getTime()) /
          (1000 * 60 * 60 * 24)
        : 999;

      let matches = true;

      if (criteria.minSessions && sessionCount < criteria.minSessions)
        matches = false;
      if (criteria.maxSessions && sessionCount > criteria.maxSessions)
        matches = false;
      if (criteria.lastActiveDays && daysSinceActive > criteria.lastActiveDays)
        matches = false;

      if (matches) count++;
    }

    return count;
  }

  private getLastActiveDate(userEvents: any[]): string | null {
    if (userEvents.length === 0) return null;

    const sortedEvents = userEvents.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return sortedEvents[0].timestamp;
  }

  // MARK: - Cohort Analysis
  async performCohortAnalysis(): Promise<CohortAnalysis[]> {
    try {
      const events = await analyticsService.exportAnalyticsData();
      const cohorts: CohortAnalysis[] = [];

      // Group users by registration month
      const userCohorts = new Map<string, Set<string>>();

      events.forEach(event => {
        if (event.name === 'user_registration') {
          const cohort = new Date(event.timestamp)
            .toISOString()
            .substring(0, 7); // YYYY-MM
          if (!userCohorts.has(cohort)) {
            userCohorts.set(cohort, new Set());
          }
          userCohorts.get(cohort)!.add(event.userId);
        }
      });

      // Calculate retention for each cohort
      for (const [cohort, users] of userCohorts) {
        const retention = this.calculateCohortRetention(events, users, cohort);
        const revenue = this.calculateCohortRevenue(events, users);

        cohorts.push({
          cohort,
          period: cohort,
          users: users.size,
          retention,
          revenue,
        });
      }

      this.cohortData = cohorts;
      await this.saveAnalyticsData();

      return cohorts;
    } catch (error) {
      console.error('Failed to perform cohort analysis:', error);
      return [];
    }
  }

  private calculateCohortRetention(
    events: any[],
    users: Set<string>,
    _cohort: string,
  ): number[] {
    const retention: number[] = [];
    const cohortDate = new Date(_cohort + '-01');

    // Calculate retention for months 0-12
    for (let month = 0; month <= 12; month++) {
      const targetDate = new Date(cohortDate);
      targetDate.setMonth(targetDate.getMonth() + month);

      const activeUsers = new Set<string>();

      events.forEach(event => {
        if (users.has(event.userId)) {
          const eventDate = new Date(event.timestamp);
          if (
            eventDate >= targetDate &&
            eventDate <
              new Date(targetDate.getTime() + 30 * 24 * 60 * 60 * 1000)
          ) {
            activeUsers.add(event.userId);
          }
        }
      });

      retention.push(activeUsers.size / users.size);
    }

    return retention;
  }

  private calculateCohortRevenue(_events: any[], users: Set<string>): number[] {
    const revenue: number[] = [];

    // Calculate revenue for months 0-12
    for (let month = 0; month <= 12; month++) {
      let monthRevenue = 0;

      _events.forEach((event: any) => {
        if (
          users.has(event.userId) &&
          (event.name === 'subscription_purchase' ||
            event.name === 'in_app_purchase')
        ) {
          const eventDate = new Date(event.timestamp);
          const cohortDate = new Date();
          cohortDate.setMonth(cohortDate.getMonth() - month);

          if (eventDate >= cohortDate) {
            monthRevenue += event.value || 0;
          }
        }
      });

      revenue.push(monthRevenue);
    }

    return revenue;
  }

  // MARK: - Funnel Analysis
  async performFunnelAnalysis(): Promise<FunnelAnalysis[]> {
    try {
      const events = await analyticsService.exportAnalyticsData();
      const funnel: FunnelAnalysis[] = [
        {
          stage: 'App Install',
          users: 0,
          conversionRate: 0,
          dropOffRate: 0,
        },
        {
          stage: 'Registration',
          users: 0,
          conversionRate: 0,
          dropOffRate: 0,
        },
        {
          stage: 'First Workout',
          users: 0,
          conversionRate: 0,
          dropOffRate: 0,
        },
        {
          stage: 'Subscription',
          users: 0,
          conversionRate: 0,
          dropOffRate: 0,
        },
      ];

      // Calculate funnel metrics
      const installs = events.filter(
        event => event.name === 'app_install',
      ).length;
      const registrations = events.filter(
        event => event.name === 'user_registration',
      ).length;
      const firstWorkouts = events.filter(
        event => event.name === 'workout_start',
      ).length;
      const subscriptions = events.filter(
        event => event.name === 'subscription_purchase',
      ).length;

      funnel[0].users = installs;
      funnel[1].users = registrations;
      funnel[2].users = firstWorkouts;
      funnel[3].users = subscriptions;

      // Calculate conversion rates
      funnel[1].conversionRate = installs > 0 ? registrations / installs : 0;
      funnel[2].conversionRate =
        registrations > 0 ? firstWorkouts / registrations : 0;
      funnel[3].conversionRate =
        firstWorkouts > 0 ? subscriptions / firstWorkouts : 0;

      // Calculate drop-off rates
      funnel[0].dropOffRate = 0;
      funnel[1].dropOffRate =
        installs > 0 ? (installs - registrations) / installs : 0;
      funnel[2].dropOffRate =
        registrations > 0 ? (registrations - firstWorkouts) / registrations : 0;
      funnel[3].dropOffRate =
        firstWorkouts > 0 ? (firstWorkouts - subscriptions) / firstWorkouts : 0;

      this.funnelData = funnel;
      await this.saveAnalyticsData();

      return funnel;
    } catch (error) {
      console.error('Failed to perform funnel analysis:', error);
      return [];
    }
  }

  // MARK: - Revenue Analysis
  async performRevenueAnalysis(): Promise<RevenueAnalysis[]> {
    try {
      const events = await analyticsService.exportAnalyticsData();
      const revenueData: RevenueAnalysis[] = [];

      // Group events by month
      const monthlyRevenue = new Map<
        string,
        {
          total: number;
          subscription: number;
          inApp: number;
          ads: number;
          refunds: number;
        }
      >();

      events.forEach(event => {
        if (
          event.name === 'subscription_purchase' ||
          event.name === 'in_app_purchase'
        ) {
          const month = new Date(event.timestamp).toISOString().substring(0, 7);
          if (!monthlyRevenue.has(month)) {
            monthlyRevenue.set(month, {
              total: 0,
              subscription: 0,
              inApp: 0,
              ads: 0,
              refunds: 0,
            });
          }

          const revenue = event.value || 0;
          const data = monthlyRevenue.get(month)!;

          data.total += revenue;
          if (event.name === 'subscription_purchase') {
            data.subscription += revenue;
          } else {
            data.inApp += revenue;
          }
        }
      });

      // Convert to array and calculate growth rates
      let previousRevenue = 0;

      for (const [month, data] of monthlyRevenue) {
        const growthRate =
          previousRevenue > 0
            ? ((data.total - previousRevenue) / previousRevenue) * 100
            : 0;

        revenueData.push({
          period: month,
          totalRevenue: data.total,
          subscriptionRevenue: data.subscription,
          inAppPurchaseRevenue: data.inApp,
          adRevenue: data.ads,
          refunds: data.refunds,
          netRevenue: data.total - data.refunds,
          growthRate,
        });

        previousRevenue = data.total;
      }

      this.revenueData = revenueData;
      await this.saveAnalyticsData();

      return revenueData;
    } catch (error) {
      console.error('Failed to perform revenue analysis:', error);
      return [];
    }
  }

  // MARK: - Public Methods
  getMetrics(): BusinessMetrics {
    return { ...this.metrics };
  }

  getUserSegments(): UserSegment[] {
    return [...this.userSegments];
  }

  getCohortData(): CohortAnalysis[] {
    return [...this.cohortData];
  }

  getFunnelData(): FunnelAnalysis[] {
    return [...this.funnelData];
  }

  getRevenueData(): RevenueAnalysis[] {
    return [...this.revenueData];
  }

  async refreshAnalytics(): Promise<void> {
    await this.calculateMetrics();
    await this.createUserSegments();
    await this.performCohortAnalysis();
    await this.performFunnelAnalysis();
    await this.performRevenueAnalysis();
  }

  // MARK: - Revenue Analysis
  async getRevenueAnalysis(): Promise<any> {
    // Mock implementation
    return {
      totalRevenue: 0,
      monthlyRevenue: [],
      revenueBySource: {},
    };
  }
}

export const businessAnalyticsService = BusinessAnalyticsService.getInstance();
