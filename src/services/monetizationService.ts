import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscriptionService } from './subscriptionService';
import { analyticsService } from './analyticsService';

export interface MonetizationFeature {
  id: string;
  name: string;
  description: string;
  category: 'subscription' | 'in_app_purchase' | 'advertising' | 'freemium';
  price?: number;
  currency?: string;
  isPremium: boolean;
  isEnabled: boolean;
  usageCount: number;
  revenue: number;
}

export interface AdConfig {
  provider: 'admob' | 'facebook' | 'unity';
  adUnitId: string;
  adType: 'banner' | 'interstitial' | 'rewarded';
  frequency: number; // Show ad every N actions
  isEnabled: boolean;
}

export interface InAppPurchase {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  productId: string;
  category: 'consumable' | 'non_consumable' | 'subscription';
  isEnabled: boolean;
  purchaseCount: number;
  revenue: number;
}

export interface MonetizationStrategy {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  features: string[];
  expectedRevenue: number;
  implementationCost: number;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed' | 'paused';
}

class MonetizationService {
  private static instance: MonetizationService;
  private features: MonetizationFeature[];
  private adConfigs: AdConfig[];
  private inAppPurchases: InAppPurchase[];
  private strategies: MonetizationStrategy[];

  static getInstance(): MonetizationService {
    if (!MonetizationService.instance) {
      MonetizationService.instance = new MonetizationService();
    }
    return MonetizationService.instance;
  }

  constructor() {
    this.features = [];
    this.adConfigs = [];
    this.inAppPurchases = [];
    this.strategies = [];

    this.initializeMonetization();
  }

  private async initializeMonetization() {
    try {
      await this.loadMonetizationData();
      await this.initializeDefaultFeatures();
      await this.initializeAdConfigs();
      await this.initializeInAppPurchases();
      await this.initializeStrategies();
    } catch (error) {
      console.error('Failed to initialize monetization:', error);
    }
  }

  private async loadMonetizationData() {
    try {
      const featuresData = await AsyncStorage.getItem('monetization_features');
      if (featuresData) {
        this.features = JSON.parse(featuresData);
      }

      const adConfigsData = await AsyncStorage.getItem('ad_configs');
      if (adConfigsData) {
        this.adConfigs = JSON.parse(adConfigsData);
      }

      const inAppPurchasesData = await AsyncStorage.getItem('in_app_purchases');
      if (inAppPurchasesData) {
        this.inAppPurchases = JSON.parse(inAppPurchasesData);
      }

      const strategiesData = await AsyncStorage.getItem(
        'monetization_strategies',
      );
      if (strategiesData) {
        this.strategies = JSON.parse(strategiesData);
      }
    } catch (error) {
      console.error('Failed to load monetization data:', error);
    }
  }

  private async saveMonetizationData() {
    try {
      await AsyncStorage.setItem(
        'monetization_features',
        JSON.stringify(this.features),
      );
      await AsyncStorage.setItem('ad_configs', JSON.stringify(this.adConfigs));
      await AsyncStorage.setItem(
        'in_app_purchases',
        JSON.stringify(this.inAppPurchases),
      );
      await AsyncStorage.setItem(
        'monetization_strategies',
        JSON.stringify(this.strategies),
      );
    } catch (error) {
      console.error('Failed to save monetization data:', error);
    }
  }

  private async initializeDefaultFeatures() {
    if (this.features.length > 0) return;

    this.features = [
      {
        id: 'unlimited_workouts',
        name: 'Unlimited Workouts',
        description: 'Access to unlimited workout plans and exercises',
        category: 'subscription',
        isPremium: true,
        isEnabled: true,
        usageCount: 0,
        revenue: 0,
      },
      {
        id: 'ai_coaching',
        name: 'AI Coaching',
        description: 'Personalized AI-powered workout coaching',
        category: 'subscription',
        isPremium: true,
        isEnabled: true,
        usageCount: 0,
        revenue: 0,
      },
      {
        id: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Detailed progress tracking and insights',
        category: 'subscription',
        isPremium: true,
        isEnabled: true,
        usageCount: 0,
        revenue: 0,
      },
      {
        id: 'custom_workouts',
        name: 'Custom Workouts',
        description: 'Create and save custom workout plans',
        category: 'subscription',
        isPremium: true,
        isEnabled: true,
        usageCount: 0,
        revenue: 0,
      },
      {
        id: 'video_library',
        name: 'Video Library',
        description: 'Access to premium exercise video library',
        category: 'subscription',
        isPremium: true,
        isEnabled: true,
        usageCount: 0,
        revenue: 0,
      },
      {
        id: 'nutrition_tracking',
        name: 'Nutrition Tracking',
        description: 'Track calories and macronutrients',
        category: 'subscription',
        isPremium: true,
        isEnabled: true,
        usageCount: 0,
        revenue: 0,
      },
      {
        id: 'progress_photos',
        name: 'Progress Photos',
        description: 'Track progress with photos and measurements',
        category: 'subscription',
        isPremium: true,
        isEnabled: true,
        usageCount: 0,
        revenue: 0,
      },
      {
        id: 'social_features',
        name: 'Social Features',
        description: 'Share workouts and connect with friends',
        category: 'freemium',
        isPremium: false,
        isEnabled: true,
        usageCount: 0,
        revenue: 0,
      },
      {
        id: 'export_data',
        name: 'Export Data',
        description: 'Export workout data to other apps',
        category: 'subscription',
        isPremium: true,
        isEnabled: true,
        usageCount: 0,
        revenue: 0,
      },
      {
        id: 'priority_support',
        name: 'Priority Support',
        description: '24/7 priority customer support',
        category: 'subscription',
        isPremium: true,
        isEnabled: true,
        usageCount: 0,
        revenue: 0,
      },
    ];

    await this.saveMonetizationData();
  }

  private async initializeAdConfigs() {
    if (this.adConfigs.length > 0) return;

    this.adConfigs = [
      {
        provider: 'admob',
        adUnitId: 'ca-app-pub-3940256099942544/6300978111', // Test ad unit
        adType: 'banner',
        frequency: 3, // Show every 3 actions
        isEnabled: true,
      },
      {
        provider: 'admob',
        adUnitId: 'ca-app-pub-3940256099942544/1033173712', // Test ad unit
        adType: 'interstitial',
        frequency: 5, // Show every 5 actions
        isEnabled: true,
      },
      {
        provider: 'admob',
        adUnitId: 'ca-app-pub-3940256099942544/5224354917', // Test ad unit
        adType: 'rewarded',
        frequency: 1, // Show every action
        isEnabled: true,
      },
    ];

    await this.saveMonetizationData();
  }

  private async initializeInAppPurchases() {
    if (this.inAppPurchases.length > 0) return;

    this.inAppPurchases = [
      {
        id: 'premium_workout_pack',
        name: 'Premium Workout Pack',
        description: 'Unlock 50+ premium workout plans',
        price: 4.99,
        currency: 'USD',
        productId: 'premium_workout_pack',
        category: 'non_consumable',
        isEnabled: true,
        purchaseCount: 0,
        revenue: 0,
      },
      {
        id: 'nutrition_guide',
        name: 'Nutrition Guide',
        description: 'Comprehensive nutrition and meal planning guide',
        price: 2.99,
        currency: 'USD',
        productId: 'nutrition_guide',
        category: 'non_consumable',
        isEnabled: true,
        purchaseCount: 0,
        revenue: 0,
      },
      {
        id: 'personal_trainer_consultation',
        name: 'Personal Trainer Consultation',
        description: 'One-on-one consultation with certified trainer',
        price: 29.99,
        currency: 'USD',
        productId: 'personal_trainer_consultation',
        category: 'consumable',
        isEnabled: true,
        purchaseCount: 0,
        revenue: 0,
      },
      {
        id: 'advanced_analytics_report',
        name: 'Advanced Analytics Report',
        description: 'Detailed fitness analysis and recommendations',
        price: 9.99,
        currency: 'USD',
        productId: 'advanced_analytics_report',
        category: 'consumable',
        isEnabled: true,
        purchaseCount: 0,
        revenue: 0,
      },
    ];

    await this.saveMonetizationData();
  }

  private async initializeStrategies() {
    if (this.strategies.length > 0) return;

    this.strategies = [
      {
        id: 'freemium_model',
        name: 'Freemium Model',
        description: 'Basic features free, premium features paid',
        targetAudience: 'All users',
        features: ['unlimited_workouts', 'ai_coaching', 'advanced_analytics'],
        expectedRevenue: 50000,
        implementationCost: 10000,
        priority: 'high',
        status: 'completed',
      },
      {
        id: 'subscription_tiers',
        name: 'Subscription Tiers',
        description: 'Multiple subscription levels with different features',
        targetAudience: 'Premium users',
        features: ['premium', 'elite'],
        expectedRevenue: 100000,
        implementationCost: 5000,
        priority: 'high',
        status: 'completed',
      },
      {
        id: 'in_app_purchases',
        name: 'In-App Purchases',
        description: 'One-time purchases for specific features',
        targetAudience: 'Casual users',
        features: ['premium_workout_pack', 'nutrition_guide'],
        expectedRevenue: 25000,
        implementationCost: 3000,
        priority: 'medium',
        status: 'in_progress',
      },
      {
        id: 'advertising_revenue',
        name: 'Advertising Revenue',
        description: 'Display ads to free users',
        targetAudience: 'Free users',
        features: ['banner_ads', 'interstitial_ads', 'rewarded_ads'],
        expectedRevenue: 15000,
        implementationCost: 2000,
        priority: 'medium',
        status: 'planned',
      },
      {
        id: 'referral_program',
        name: 'Referral Program',
        description: 'Reward users for referring friends',
        targetAudience: 'Active users',
        features: ['referral_bonuses', 'friend_discounts'],
        expectedRevenue: 20000,
        implementationCost: 5000,
        priority: 'low',
        status: 'planned',
      },
    ];

    await this.saveMonetizationData();
  }

  // MARK: - Feature Management
  getFeatures(): MonetizationFeature[] {
    return [...this.features];
  }

  getFeatureById(id: string): MonetizationFeature | undefined {
    return this.features.find(feature => feature.id === id);
  }

  async updateFeatureUsage(featureId: string): Promise<void> {
    try {
      const feature = this.getFeatureById(featureId);
      if (feature) {
        feature.usageCount++;
        await this.saveMonetizationData();
        await this.trackFeatureUsage(feature);
      }
    } catch (error) {
      console.error('Failed to update feature usage:', error);
    }
  }

  private async trackFeatureUsage(feature: MonetizationFeature): Promise<void> {
    try {
      await analyticsService.trackEvent(
        'feature_usage',
        'monetization',
        'feature_used',
        feature.name,
      );
    } catch (error) {
      console.error('Failed to track feature usage:', error);
    }
  }

  // MARK: - Ad Management
  getAdConfigs(): AdConfig[] {
    return [...this.adConfigs];
  }

  getAdConfigByType(adType: string): AdConfig | undefined {
    return this.adConfigs.find(
      config => config.adType === adType && config.isEnabled,
    );
  }

  async showAd(adType: string): Promise<boolean> {
    try {
      const config = this.getAdConfigByType(adType);
      if (!config) return false;

      // In a real app, you'd integrate with ad SDK
      // For now, simulate ad display
      const shouldShow = Math.random() > 0.3; // 70% chance to show

      if (shouldShow) {
        await this.trackAdImpression(adType);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to show ad:', error);
      return false;
    }
  }

  private async trackAdImpression(adType: string): Promise<void> {
    try {
      await analyticsService.trackEvent(
        'ad_impression',
        'monetization',
        'ad_shown',
        adType,
      );
    } catch (error) {
      console.error('Failed to track ad impression:', error);
    }
  }

  // MARK: - In-App Purchase Management
  getInAppPurchases(): InAppPurchase[] {
    return [...this.inAppPurchases];
  }

  getInAppPurchaseById(id: string): InAppPurchase | undefined {
    return this.inAppPurchases.find(purchase => purchase.id === id);
  }

  async processInAppPurchase(purchaseId: string): Promise<boolean> {
    try {
      const purchase = this.getInAppPurchaseById(purchaseId);
      if (!purchase || !purchase.isEnabled) return false;

      // In a real app, you'd integrate with App Store/Play Store
      // For now, simulate purchase
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        purchase.purchaseCount++;
        purchase.revenue += purchase.price;

        await this.saveMonetizationData();
        await this.trackPurchase(purchase);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to process in-app purchase:', error);
      return false;
    }
  }

  private async trackPurchase(purchase: InAppPurchase): Promise<void> {
    try {
      await analyticsService.trackEvent(
        'in_app_purchase',
        'monetization',
        'purchase_made',
        purchase.name,
      );
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  }

  // MARK: - Strategy Management
  getStrategies(): MonetizationStrategy[] {
    return [...this.strategies];
  }

  getStrategyById(id: string): MonetizationStrategy | undefined {
    return this.strategies.find(strategy => strategy.id === id);
  }

  async updateStrategyStatus(
    strategyId: string,
    status: string,
  ): Promise<void> {
    try {
      const strategy = this.getStrategyById(strategyId);
      if (strategy) {
        strategy.status = status as any;
        await this.saveMonetizationData();
        await this.trackStrategyUpdate(strategy);
      }
    } catch (error) {
      console.error('Failed to update strategy status:', error);
    }
  }

  private async trackStrategyUpdate(
    strategy: MonetizationStrategy,
  ): Promise<void> {
    try {
      await analyticsService.trackEvent(
        'strategy_update',
        'monetization',
        'strategy_updated',
        strategy.name,
      );
    } catch (error) {
      console.error('Failed to track strategy update:', error);
    }
  }

  // MARK: - Revenue Analytics
  async getRevenueAnalytics(): Promise<{
    totalRevenue: number;
    subscriptionRevenue: number;
    inAppPurchaseRevenue: number;
    adRevenue: number;
    revenueByFeature: { [key: string]: number };
    revenueByStrategy: { [key: string]: number };
  }> {
    try {
      const subscriptionStatus = subscriptionService.getSubscriptionStatus();
      const subscriptionRevenue = subscriptionStatus.isActive ? 50 : 0; // Mock revenue

      const inAppPurchaseRevenue = this.inAppPurchases.reduce(
        (total, purchase) => total + purchase.revenue,
        0,
      );

      const adRevenue = 1000; // Mock ad revenue
      const totalRevenue =
        subscriptionRevenue + inAppPurchaseRevenue + adRevenue;

      const revenueByFeature: { [key: string]: number } = {};
      this.features.forEach(feature => {
        revenueByFeature[feature.id] = feature.revenue;
      });

      const revenueByStrategy: { [key: string]: number } = {};
      this.strategies.forEach(strategy => {
        revenueByStrategy[strategy.id] = strategy.expectedRevenue;
      });

      return {
        totalRevenue,
        subscriptionRevenue,
        inAppPurchaseRevenue,
        adRevenue,
        revenueByFeature,
        revenueByStrategy,
      };
    } catch (error) {
      console.error('Failed to get revenue analytics:', error);
      return {
        totalRevenue: 0,
        subscriptionRevenue: 0,
        inAppPurchaseRevenue: 0,
        adRevenue: 0,
        revenueByFeature: {},
        revenueByStrategy: {},
      };
    }
  }

  // MARK: - A/B Testing for Monetization
  async createMonetizationABTest(
    testName: string,
    variants: { [key: string]: any },
    targetMetric: string,
  ): Promise<string> {
    try {
      const testId = await analyticsService.createABTest({
        name: testName,
        description: `Monetization A/B test: ${testName}`,
        variants: {
          control: 'control',
          test: 'test',
        },
        metrics: [targetMetric],
        trafficAllocation: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

      await analyticsService.trackEvent(
        'monetization_ab_test_created',
        'monetization',
        'ab_test_created',
        testName,
      );

      return testId;
    } catch (error) {
      console.error('Failed to create monetization A/B test:', error);
      throw error;
    }
  }

  // MARK: - User Acquisition
  async trackUserAcquisition(source: string, campaign: string): Promise<void> {
    try {
      await analyticsService.trackEvent(
        'user_acquisition',
        'monetization',
        'user_acquired',
        campaign,
      );
    } catch (error) {
      console.error('Failed to track user acquisition:', error);
    }
  }

  async trackConversion(event: string, value: number): Promise<void> {
    try {
      await analyticsService.trackEvent(
        'conversion',
        'monetization',
        'conversion_tracked',
        value.toString(),
      );
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }
}

export const monetizationService = MonetizationService.getInstance();
