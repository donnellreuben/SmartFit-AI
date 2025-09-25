import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  trialDays?: number;
  productId: string; // For App Store/Play Store
}

export interface SubscriptionStatus {
  isActive: boolean;
  planId: string | null;
  startDate: string | null;
  endDate: string | null;
  isTrial: boolean;
  trialEndDate: string | null;
  autoRenew: boolean;
  platform: 'ios' | 'android' | 'web';
  receiptData?: string;
  originalTransactionId?: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  receipt?: string;
  error?: string;
}

export interface SubscriptionFeatures {
  unlimitedWorkouts: boolean;
  aiCoaching: boolean;
  advancedAnalytics: boolean;
  socialFeatures: boolean;
  customWorkouts: boolean;
  videoLibrary: boolean;
  nutritionTracking: boolean;
  progressPhotos: boolean;
  exportData: boolean;
  prioritySupport: boolean;
}

class SubscriptionService {
  private static instance: SubscriptionService;
  private subscriptionStatus: SubscriptionStatus;
  private availablePlans: SubscriptionPlan[];

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  constructor() {
    this.subscriptionStatus = {
      isActive: false,
      planId: null,
      startDate: null,
      endDate: null,
      isTrial: false,
      trialEndDate: null,
      autoRenew: false,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    };

    this.availablePlans = [
      {
        id: 'free',
        name: 'Free',
        description: 'Basic workout tracking and limited features',
        price: 0,
        currency: 'USD',
        interval: 'monthly',
        features: [
          '3 workouts per week',
          'Basic progress tracking',
          'Limited AI coaching',
          'Community access',
        ],
        productId: 'free_plan',
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Unlimited workouts with AI coaching',
        price: 9.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Unlimited workouts',
          'AI-powered coaching',
          'Advanced analytics',
          'Custom workout plans',
          'Video exercise library',
          'Social features',
          'Progress photos',
        ],
        isPopular: true,
        trialDays: 7,
        productId: 'premium_monthly',
      },
      {
        id: 'premium_yearly',
        name: 'Premium (Yearly)',
        description: 'Best value - Save 40% with yearly subscription',
        price: 71.99,
        currency: 'USD',
        interval: 'yearly',
        features: [
          'Unlimited workouts',
          'AI-powered coaching',
          'Advanced analytics',
          'Custom workout plans',
          'Video exercise library',
          'Social features',
          'Progress photos',
          'Priority support',
        ],
        isPopular: false,
        trialDays: 7,
        productId: 'premium_yearly',
      },
      {
        id: 'elite',
        name: 'Elite',
        description: 'Everything in Premium plus exclusive features',
        price: 19.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Everything in Premium',
          'Personal trainer consultation',
          'Nutrition tracking',
          'Advanced body composition analysis',
          'Custom meal plans',
          'Priority customer support',
          'Early access to new features',
          'Export data',
        ],
        productId: 'elite_monthly',
      },
    ];

    this.initializeSubscription();
  }

  private async initializeSubscription() {
    try {
      await this.loadSubscriptionStatus();
    } catch (error) {
      console.error('Failed to initialize subscription:', error);
    }
  }

  private async loadSubscriptionStatus() {
    try {
      const statusData = await AsyncStorage.getItem('subscription_status');
      if (statusData) {
        this.subscriptionStatus = {
          ...this.subscriptionStatus,
          ...JSON.parse(statusData),
        };
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  }

  private async saveSubscriptionStatus() {
    try {
      await AsyncStorage.setItem(
        'subscription_status',
        JSON.stringify(this.subscriptionStatus),
      );
    } catch (error) {
      console.error('Failed to save subscription status:', error);
    }
  }

  // MARK: - Subscription Plans
  getAvailablePlans(): SubscriptionPlan[] {
    return [...this.availablePlans];
  }

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.availablePlans.find(plan => plan.id === planId);
  }

  getCurrentPlan(): SubscriptionPlan | null {
    if (!this.subscriptionStatus.planId) return null;
    return this.getPlanById(this.subscriptionStatus.planId);
  }

  // MARK: - Subscription Status
  getSubscriptionStatus(): SubscriptionStatus {
    return { ...this.subscriptionStatus };
  }

  isSubscriptionActive(): boolean {
    return this.subscriptionStatus.isActive;
  }

  isTrialActive(): boolean {
    if (
      !this.subscriptionStatus.isTrial ||
      !this.subscriptionStatus.trialEndDate
    ) {
      return false;
    }
    return new Date() < new Date(this.subscriptionStatus.trialEndDate);
  }

  getDaysRemainingInTrial(): number {
    if (!this.isTrialActive()) return 0;

    const trialEnd = new Date(this.subscriptionStatus.trialEndDate!);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // MARK: - Subscription Management
  async startTrial(planId: string): Promise<PurchaseResult> {
    try {
      const plan = this.getPlanById(planId);
      if (!plan || !plan.trialDays) {
        throw new Error('Trial not available for this plan');
      }

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + plan.trialDays);

      this.subscriptionStatus = {
        ...this.subscriptionStatus,
        isActive: true,
        planId,
        startDate: new Date().toISOString(),
        endDate: trialEndDate.toISOString(),
        isTrial: true,
        trialEndDate: trialEndDate.toISOString(),
        autoRenew: true,
      };

      await this.saveSubscriptionStatus();
      return { success: true, transactionId: `trial_${Date.now()}` };
    } catch (error) {
      console.error('Failed to start trial:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async purchaseSubscription(planId: string): Promise<PurchaseResult> {
    try {
      const plan = this.getPlanById(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // In a real app, you'd integrate with App Store/Play Store
      // For now, simulate the purchase
      const purchaseResult = await this.simulatePurchase(plan);

      if (purchaseResult.success) {
        this.subscriptionStatus = {
          ...this.subscriptionStatus,
          isActive: true,
          planId,
          startDate: new Date().toISOString(),
          endDate: this.calculateEndDate(plan),
          isTrial: false,
          trialEndDate: null,
          autoRenew: true,
          receiptData: purchaseResult.receipt,
          originalTransactionId: purchaseResult.transactionId,
        };

        await this.saveSubscriptionStatus();
      }

      return purchaseResult;
    } catch (error) {
      console.error('Failed to purchase subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async cancelSubscription(): Promise<boolean> {
    try {
      this.subscriptionStatus = {
        ...this.subscriptionStatus,
        isActive: false,
        autoRenew: false,
        endDate: new Date().toISOString(),
      };

      await this.saveSubscriptionStatus();
      return true;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    try {
      // In a real app, you'd restore from App Store/Play Store
      // For now, simulate restoration
      const restoredStatus = await this.simulateRestorePurchases();

      if (restoredStatus.success) {
        this.subscriptionStatus = {
          ...this.subscriptionStatus,
          ...restoredStatus.data,
        };
        await this.saveSubscriptionStatus();
      }

      return restoredStatus;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // MARK: - Feature Access
  hasFeatureAccess(feature: keyof SubscriptionFeatures): boolean {
    const currentPlan = this.getCurrentPlan();
    // Default to free plan if no active subscription
    const plan = currentPlan || this.getPlanById('free');
    if (!plan) return false;

    // Free plan limitations
    if (plan.id === 'free') {
      switch (feature) {
        case 'unlimitedWorkouts':
          return false; // Limited to 3 workouts per week
        case 'aiCoaching':
          return false; // Limited AI coaching
        case 'advancedAnalytics':
          return false;
        case 'socialFeatures':
          return true; // Basic social features
        case 'customWorkouts':
          return false;
        case 'videoLibrary':
          return false;
        case 'nutritionTracking':
          return false;
        case 'progressPhotos':
          return false;
        case 'exportData':
          return false;
        case 'prioritySupport':
          return false;
        default:
          return false;
      }
    }

    // Premium and Elite plans have all features
    return (
      plan.id === 'premium' ||
      plan.id === 'premium_yearly' ||
      plan.id === 'elite'
    );
  }

  getAvailableFeatures(): SubscriptionFeatures {
    return {
      unlimitedWorkouts: this.hasFeatureAccess('unlimitedWorkouts'),
      aiCoaching: this.hasFeatureAccess('aiCoaching'),
      advancedAnalytics: this.hasFeatureAccess('advancedAnalytics'),
      socialFeatures: this.hasFeatureAccess('socialFeatures'),
      customWorkouts: this.hasFeatureAccess('customWorkouts'),
      videoLibrary: this.hasFeatureAccess('videoLibrary'),
      nutritionTracking: this.hasFeatureAccess('nutritionTracking'),
      progressPhotos: this.hasFeatureAccess('progressPhotos'),
      exportData: this.hasFeatureAccess('exportData'),
      prioritySupport: this.hasFeatureAccess('prioritySupport'),
    };
  }

  // MARK: - Usage Tracking
  async trackUsage(feature: string, action: string): Promise<void> {
    try {
      const usageData = {
        feature,
        action,
        timestamp: new Date().toISOString(),
        planId: this.subscriptionStatus.planId,
        isTrial: this.subscriptionStatus.isTrial,
      };

      // In a real app, you'd send this to analytics
      console.log('Usage tracked:', usageData);
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }

  // MARK: - Billing Management
  async getBillingHistory(): Promise<any[]> {
    try {
      const historyData = await AsyncStorage.getItem('billing_history');
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Failed to get billing history:', error);
      return [];
    }
  }

  async addBillingRecord(record: any): Promise<void> {
    try {
      const history = await this.getBillingHistory();
      history.push({
        ...record,
        timestamp: new Date().toISOString(),
      });

      await AsyncStorage.setItem('billing_history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to add billing record:', error);
    }
  }

  // MARK: - Helper Methods
  private calculateEndDate(plan: SubscriptionPlan): string {
    const endDate = new Date();

    if (plan.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    return endDate.toISOString();
  }

  private async simulatePurchase(
    _plan: SubscriptionPlan,
  ): Promise<PurchaseResult> {
    // No delay for testing

    // Simulate 100% success rate for testing
    const success = true;

    if (success) {
      return {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        receipt: `receipt_${Date.now()}`,
      };
    } else {
      return {
        success: false,
        error: 'Payment failed. Please try again.',
      };
    }
  }

  private async simulateRestorePurchases(): Promise<
    PurchaseResult & { data?: any }
  > {
    // No delay for testing

    // Simulate 100% success rate for testing
    const success = true;

    if (success) {
      return {
        success: true,
        transactionId: `restored_${Date.now()}`,
        data: {
          isActive: true,
          planId: 'premium',
          startDate: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 30 days ago
          endDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 30 days from now
          isTrial: false,
          autoRenew: true,
        },
      };
    } else {
      return {
        success: false,
        error: 'No purchases found to restore.',
      };
    }
  }

  // MARK: - Subscription Analytics
  async getSubscriptionAnalytics(): Promise<{
    totalRevenue: number;
    activeSubscriptions: number;
    trialConversions: number;
    churnRate: number;
    averageRevenuePerUser: number;
  }> {
    try {
      const history = await this.getBillingHistory();

      const totalRevenue = history.reduce(
        (sum, record) => sum + (record.amount || 0),
        0,
      );
      const activeSubscriptions = this.subscriptionStatus.isActive ? 1 : 0;
      const trialConversions = history.filter(
        record => record.type === 'trial_conversion',
      ).length;
      const churnRate =
        history.filter(record => record.type === 'cancellation').length /
        Math.max(history.length, 1);
      const averageRevenuePerUser =
        totalRevenue / Math.max(activeSubscriptions, 1);

      return {
        totalRevenue,
        activeSubscriptions,
        trialConversions,
        churnRate,
        averageRevenuePerUser,
      };
    } catch (error) {
      console.error('Failed to get subscription analytics:', error);
      return {
        totalRevenue: 0,
        activeSubscriptions: 0,
        trialConversions: 0,
        churnRate: 0,
        averageRevenuePerUser: 0,
      };
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance();
