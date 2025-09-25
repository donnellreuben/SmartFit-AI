import { subscriptionService } from '../subscriptionService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('SubscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset subscription status to default state
    subscriptionService.subscriptionStatus = {
      isActive: false,
      planId: null,
      startDate: null,
      endDate: null,
      isTrial: false,
      trialEndDate: null,
      autoRenew: false,
      platform: 'ios',
    };
  });

  describe('getAvailablePlans', () => {
    it('should return all available subscription plans', () => {
      const plans = subscriptionService.getAvailablePlans();

      expect(plans).toHaveLength(4);
      expect(plans[0].id).toBe('free');
      expect(plans[1].id).toBe('premium');
      expect(plans[2].id).toBe('premium_yearly');
      expect(plans[3].id).toBe('elite');
    });

    it('should have correct plan structure', () => {
      const plans = subscriptionService.getAvailablePlans();
      const premiumPlan = plans.find(plan => plan.id === 'premium');

      expect(premiumPlan).toBeDefined();
      expect(premiumPlan?.name).toBe('Premium');
      expect(premiumPlan?.price).toBe(9.99);
      expect(premiumPlan?.interval).toBe('monthly');
      expect(premiumPlan?.trialDays).toBe(7);
      expect(premiumPlan?.isPopular).toBe(true);
    });
  });

  describe('getPlanById', () => {
    it('should return correct plan for valid ID', () => {
      const plan = subscriptionService.getPlanById('premium');

      expect(plan).toBeDefined();
      expect(plan?.id).toBe('premium');
      expect(plan?.name).toBe('Premium');
    });

    it('should return undefined for invalid ID', () => {
      const plan = subscriptionService.getPlanById('invalid');

      expect(plan).toBeUndefined();
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return current subscription status', () => {
      const status = subscriptionService.getSubscriptionStatus();

      expect(status).toBeDefined();
      expect(status.isActive).toBe(false);
      expect(status.planId).toBeNull();
      expect(status.isTrial).toBe(false);
    });
  });

  describe('isSubscriptionActive', () => {
    it('should return false for inactive subscription', () => {
      const isActive = subscriptionService.isSubscriptionActive();

      expect(isActive).toBe(false);
    });
  });

  describe('hasFeatureAccess', () => {
    it('should return false for premium features on free plan', () => {
      const hasAccess =
        subscriptionService.hasFeatureAccess('unlimitedWorkouts');

      expect(hasAccess).toBe(false);
    });

    it('should return true for basic features on free plan', () => {
      const hasAccess = subscriptionService.hasFeatureAccess('socialFeatures');

      expect(hasAccess).toBe(true);
    });
  });

  describe('startTrial', () => {
    it('should start trial for premium plan', async () => {
      const result = await subscriptionService.startTrial('premium');

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
    });

    it('should fail for plan without trial', async () => {
      const result = await subscriptionService.startTrial('free');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('purchaseSubscription', () => {
    it('should simulate successful purchase', async () => {
      const result = await subscriptionService.purchaseSubscription('premium');

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
    });

    it('should fail for invalid plan', async () => {
      const result = await subscriptionService.purchaseSubscription('invalid');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const result = await subscriptionService.cancelSubscription();

      expect(result).toBe(true);
    });
  });

  describe('restorePurchases', () => {
    it('should restore purchases successfully', async () => {
      const result = await subscriptionService.restorePurchases();

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
    });
  });

  describe('getAvailableFeatures', () => {
    it('should return feature access for current plan', () => {
      const features = subscriptionService.getAvailableFeatures();

      expect(features).toBeDefined();
      expect(features.unlimitedWorkouts).toBe(false);
      expect(features.socialFeatures).toBe(true);
    });
  });

  describe('trackUsage', () => {
    it('should track feature usage', async () => {
      await expect(
        subscriptionService.trackUsage('workout', 'start'),
      ).resolves.not.toThrow();
    });
  });

  describe('getSubscriptionAnalytics', () => {
    it('should return subscription analytics', async () => {
      const analytics = await subscriptionService.getSubscriptionAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.totalRevenue).toBeDefined();
      expect(analytics.activeSubscriptions).toBeDefined();
      expect(analytics.trialConversions).toBeDefined();
      expect(analytics.churnRate).toBeDefined();
      expect(analytics.averageRevenuePerUser).toBeDefined();
    });
  });
});
