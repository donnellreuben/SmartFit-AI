import { businessAnalyticsService } from '../businessAnalyticsService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock analyticsService
jest.mock('../analyticsService', () => ({
  analyticsService: {
    calculateBusinessMetrics: jest.fn(),
    exportAnalyticsData: jest.fn(),
  },
}));

describe('BusinessAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMetrics', () => {
    it('should return business metrics', () => {
      const metrics = businessAnalyticsService.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.totalUsers).toBeDefined();
      expect(metrics.activeUsers).toBeDefined();
      expect(metrics.retentionRate).toBeDefined();
      expect(metrics.churnRate).toBeDefined();
      expect(metrics.engagementScore).toBeDefined();
      expect(metrics.averageSessionDuration).toBeDefined();
      expect(metrics.totalSessions).toBeDefined();
      expect(metrics.conversionRate).toBeDefined();
      expect(metrics.revenue).toBeDefined();
      expect(metrics.averageRevenuePerUser).toBeDefined();
      expect(metrics.lifetimeValue).toBeDefined();
      expect(metrics.costPerAcquisition).toBeDefined();
      expect(metrics.returnOnInvestment).toBeDefined();
    });
  });

  describe('createUserSegments', () => {
    it('should create user segments', async () => {
      const segments = await businessAnalyticsService.createUserSegments();
      
      expect(segments).toBeDefined();
      expect(Array.isArray(segments)).toBe(true);
      
      if (segments.length > 0) {
        const segment = segments[0];
        expect(segment.id).toBeDefined();
        expect(segment.name).toBeDefined();
        expect(segment.description).toBeDefined();
        expect(segment.criteria).toBeDefined();
        expect(segment.userCount).toBeDefined();
        expect(segment.percentage).toBeDefined();
      }
    });
  });

  describe('performCohortAnalysis', () => {
    it('should perform cohort analysis', async () => {
      const cohorts = await businessAnalyticsService.performCohortAnalysis();
      
      expect(cohorts).toBeDefined();
      expect(Array.isArray(cohorts)).toBe(true);
      
      if (cohorts.length > 0) {
        const cohort = cohorts[0];
        expect(cohort.cohort).toBeDefined();
        expect(cohort.period).toBeDefined();
        expect(cohort.users).toBeDefined();
        expect(cohort.retention).toBeDefined();
        expect(cohort.revenue).toBeDefined();
      }
    });
  });

  describe('performFunnelAnalysis', () => {
    it('should perform funnel analysis', async () => {
      const funnel = await businessAnalyticsService.performFunnelAnalysis();
      
      expect(funnel).toBeDefined();
      expect(Array.isArray(funnel)).toBe(true);
      
      if (funnel.length > 0) {
        const stage = funnel[0];
        expect(stage.stage).toBeDefined();
        expect(stage.users).toBeDefined();
        expect(stage.conversionRate).toBeDefined();
        expect(stage.dropOffRate).toBeDefined();
      }
    });
  });

  describe('performRevenueAnalysis', () => {
    it('should perform revenue analysis', async () => {
      const revenue = await businessAnalyticsService.performRevenueAnalysis();
      
      expect(revenue).toBeDefined();
      expect(Array.isArray(revenue)).toBe(true);
      
      if (revenue.length > 0) {
        const period = revenue[0];
        expect(period.period).toBeDefined();
        expect(period.totalRevenue).toBeDefined();
        expect(period.subscriptionRevenue).toBeDefined();
        expect(period.inAppPurchaseRevenue).toBeDefined();
        expect(period.adRevenue).toBeDefined();
        expect(period.refunds).toBeDefined();
        expect(period.netRevenue).toBeDefined();
        expect(period.growthRate).toBeDefined();
      }
    });
  });

  describe('getUserSegments', () => {
    it('should return user segments', () => {
      const segments = businessAnalyticsService.getUserSegments();
      
      expect(segments).toBeDefined();
      expect(Array.isArray(segments)).toBe(true);
    });
  });

  describe('getCohortData', () => {
    it('should return cohort data', () => {
      const cohorts = businessAnalyticsService.getCohortData();
      
      expect(cohorts).toBeDefined();
      expect(Array.isArray(cohorts)).toBe(true);
    });
  });

  describe('getFunnelData', () => {
    it('should return funnel data', () => {
      const funnel = businessAnalyticsService.getFunnelData();
      
      expect(funnel).toBeDefined();
      expect(Array.isArray(funnel)).toBe(true);
    });
  });

  describe('getRevenueData', () => {
    it('should return revenue data', () => {
      const revenue = businessAnalyticsService.getRevenueData();
      
      expect(revenue).toBeDefined();
      expect(Array.isArray(revenue)).toBe(true);
    });
  });

  describe('refreshAnalytics', () => {
    it('should refresh all analytics data', async () => {
      await expect(businessAnalyticsService.refreshAnalytics()).resolves.not.toThrow();
    });
  });
});
