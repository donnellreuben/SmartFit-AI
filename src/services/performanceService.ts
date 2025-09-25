import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformanceMetrics {
  appLaunchTime: number;
  screenLoadTime: number;
  memoryUsage: number;
  batteryLevel: number;
  networkLatency: number;
  frameRate: number;
  crashCount: number;
  lastUpdated: string;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  enableBatteryOptimization: boolean;
  enableMemoryOptimization: boolean;
  enableNetworkOptimization: boolean;
  maxCacheSize: number; // in MB
  imageQuality: 'low' | 'medium' | 'high';
  videoQuality: 'low' | 'medium' | 'high';
  animationReduction: boolean;
  backgroundSync: boolean;
}

export interface BatteryOptimization {
  reduceAnimations: boolean;
  lowerFrameRate: boolean;
  reduceBackgroundActivity: boolean;
  optimizeImageLoading: boolean;
  limitVideoPlayback: boolean;
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetrics;
  private config: PerformanceConfig;
  private batteryOptimization: BatteryOptimization;
  private performanceHistory: PerformanceMetrics[] = [];
  private isMonitoring: boolean = false;

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  constructor() {
    this.metrics = {
      appLaunchTime: 0,
      screenLoadTime: 0,
      memoryUsage: 0,
      batteryLevel: 100,
      networkLatency: 0,
      frameRate: 60,
      crashCount: 0,
      lastUpdated: new Date().toISOString(),
    };

    this.config = {
      enableMetrics: true,
      enableBatteryOptimization: true,
      enableMemoryOptimization: true,
      enableNetworkOptimization: true,
      maxCacheSize: 500, // 500MB
      imageQuality: 'medium',
      videoQuality: 'medium',
      animationReduction: false,
      backgroundSync: true,
    };

    this.batteryOptimization = {
      reduceAnimations: false,
      lowerFrameRate: false,
      reduceBackgroundActivity: false,
      optimizeImageLoading: false,
      limitVideoPlayback: false,
    };

    this.initializePerformanceMonitoring();
  }

  private async initializePerformanceMonitoring() {
    try {
      await this.loadPerformanceConfig();
      await this.loadBatteryOptimization();
      this.startPerformanceMonitoring();
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  private async loadPerformanceConfig() {
    try {
      const configData = await AsyncStorage.getItem('performance_config');
      if (configData) {
        this.config = { ...this.config, ...JSON.parse(configData) };
      }
    } catch (error) {
      console.error('Failed to load performance config:', error);
    }
  }

  private async loadBatteryOptimization() {
    try {
      const batteryData = await AsyncStorage.getItem('battery_optimization');
      if (batteryData) {
        this.batteryOptimization = { ...this.batteryOptimization, ...JSON.parse(batteryData) };
      }
    } catch (error) {
      console.error('Failed to load battery optimization:', error);
    }
  }

  private async savePerformanceConfig() {
    try {
      await AsyncStorage.setItem('performance_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save performance config:', error);
    }
  }

  private async saveBatteryOptimization() {
    try {
      await AsyncStorage.setItem('battery_optimization', JSON.stringify(this.batteryOptimization));
    } catch (error) {
      console.error('Failed to save battery optimization:', error);
    }
  }

  // MARK: - Performance Monitoring
  startPerformanceMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorPerformance();
  }

  stopPerformanceMonitoring() {
    this.isMonitoring = false;
  }

  private async monitorPerformance() {
    if (!this.isMonitoring) return;

    try {
      await this.updatePerformanceMetrics();
      await this.optimizePerformance();
      
      // Monitor every 30 seconds
      setTimeout(() => {
        this.monitorPerformance();
      }, 30000);
    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  }

  private async updatePerformanceMetrics() {
    try {
      // Update memory usage
      this.metrics.memoryUsage = await this.getMemoryUsage();
      
      // Update battery level
      this.metrics.batteryLevel = await this.getBatteryLevel();
      
      // Update network latency
      this.metrics.networkLatency = await this.getNetworkLatency();
      
      // Update frame rate
      this.metrics.frameRate = await this.getFrameRate();
      
      this.metrics.lastUpdated = new Date().toISOString();
      
      // Store in history
      this.performanceHistory.push({ ...this.metrics });
      
      // Keep only last 100 entries
      if (this.performanceHistory.length > 100) {
        this.performanceHistory = this.performanceHistory.slice(-100);
      }
    } catch (error) {
      console.error('Failed to update performance metrics:', error);
    }
  }

  private async getMemoryUsage(): Promise<number> {
    // In a real app, you'd use react-native-device-info
    // For now, return a mock value
    return Math.random() * 100; // Mock memory usage percentage
  }

  private async getBatteryLevel(): Promise<number> {
    // In a real app, you'd use react-native-device-info
    // For now, return a mock value
    return Math.random() * 100; // Mock battery level
  }

  private async getNetworkLatency(): Promise<number> {
    // In a real app, you'd ping a server
    // For now, return a mock value
    return Math.random() * 1000; // Mock latency in ms
  }

  private async getFrameRate(): Promise<number> {
    // In a real app, you'd use FPS monitoring
    // For now, return a mock value
    return 60; // Mock frame rate
  }

  // MARK: - Performance Optimization
  private async optimizePerformance() {
    if (!this.config.enableMetrics) return;

    // Battery optimization
    if (this.config.enableBatteryOptimization) {
      await this.optimizeBatteryUsage();
    }

    // Memory optimization
    if (this.config.enableMemoryOptimization) {
      await this.optimizeMemoryUsage();
    }

    // Network optimization
    if (this.config.enableNetworkOptimization) {
      await this.optimizeNetworkUsage();
    }
  }

  private async optimizeBatteryUsage() {
    const batteryLevel = this.metrics.batteryLevel;
    
    if (batteryLevel < 20) {
      // Critical battery level
      this.batteryOptimization = {
        reduceAnimations: true,
        lowerFrameRate: true,
        reduceBackgroundActivity: true,
        optimizeImageLoading: true,
        limitVideoPlayback: true,
      };
    } else if (batteryLevel < 50) {
      // Low battery level
      this.batteryOptimization = {
        reduceAnimations: true,
        lowerFrameRate: false,
        reduceBackgroundActivity: true,
        optimizeImageLoading: true,
        limitVideoPlayback: false,
      };
    } else {
      // Normal battery level
      this.batteryOptimization = {
        reduceAnimations: false,
        lowerFrameRate: false,
        reduceBackgroundActivity: false,
        optimizeImageLoading: false,
        limitVideoPlayback: false,
      };
    }

    await this.saveBatteryOptimization();
  }

  private async optimizeMemoryUsage() {
    const memoryUsage = this.metrics.memoryUsage;
    
    if (memoryUsage > 80) {
      // High memory usage - clear caches
      await this.clearImageCache();
      await this.clearVideoCache();
      await this.clearDataCache();
    }
  }

  private async optimizeNetworkUsage() {
    const networkLatency = this.metrics.networkLatency;
    
    if (networkLatency > 500) {
      // High latency - reduce network requests
      this.config.backgroundSync = false;
      await this.savePerformanceConfig();
    }
  }

  // MARK: - Cache Management
  async clearImageCache(): Promise<void> {
    try {
      // In a real app, you'd clear actual image cache
      console.log('Clearing image cache...');
    } catch (error) {
      console.error('Failed to clear image cache:', error);
    }
  }

  async clearVideoCache(): Promise<void> {
    try {
      // In a real app, you'd clear actual video cache
      console.log('Clearing video cache...');
    } catch (error) {
      console.error('Failed to clear video cache:', error);
    }
  }

  async clearDataCache(): Promise<void> {
    try {
      // Clear old performance data
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep only last 7 days
      
      this.performanceHistory = this.performanceHistory.filter(
        entry => new Date(entry.lastUpdated) > cutoffDate
      );
    } catch (error) {
      console.error('Failed to clear data cache:', error);
    }
  }

  // MARK: - Image Optimization
  getOptimizedImageUrl(originalUrl: string, width?: number, height?: number): string {
    if (!this.batteryOptimization.optimizeImageLoading) {
      return originalUrl;
    }

    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const targetWidth = width || screenWidth;
    const targetHeight = height || screenHeight;

    // Add image optimization parameters
    const params = new URLSearchParams({
      w: targetWidth.toString(),
      h: targetHeight.toString(),
      q: this.config.imageQuality === 'high' ? '80' : 
         this.config.imageQuality === 'medium' ? '60' : '40',
      f: 'webp', // Use WebP format for better compression
    });

    return `${originalUrl}?${params.toString()}`;
  }

  // MARK: - Video Optimization
  getOptimizedVideoUrl(originalUrl: string): string {
    if (!this.batteryOptimization.limitVideoPlayback) {
      return originalUrl;
    }

    // Add video optimization parameters
    const params = new URLSearchParams({
      quality: this.config.videoQuality,
      autoplay: 'false',
      preload: 'metadata',
    });

    return `${originalUrl}?${params.toString()}`;
  }

  // MARK: - Animation Optimization
  getAnimationDuration(baseDuration: number): number {
    if (this.batteryOptimization.reduceAnimations) {
      return baseDuration * 0.5; // Reduce animation duration by half
    }
    return baseDuration;
  }

  getAnimationScale(): number {
    if (this.batteryOptimization.reduceAnimations) {
      return 0.8; // Reduce animation scale
    }
    return 1.0;
  }

  // MARK: - Frame Rate Optimization
  getTargetFrameRate(): number {
    if (this.batteryOptimization.lowerFrameRate) {
      return 30; // Lower frame rate for battery saving
    }
    return 60; // Normal frame rate
  }

  // MARK: - Background Activity Optimization
  shouldReduceBackgroundActivity(): boolean {
    return this.batteryOptimization.reduceBackgroundActivity;
  }

  // MARK: - Performance Metrics
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  getAveragePerformance(): {
    averageMemoryUsage: number;
    averageBatteryLevel: number;
    averageNetworkLatency: number;
    averageFrameRate: number;
  } {
    if (this.performanceHistory.length === 0) {
      return {
        averageMemoryUsage: 0,
        averageBatteryLevel: 0,
        averageNetworkLatency: 0,
        averageFrameRate: 0,
      };
    }

    const total = this.performanceHistory.reduce(
      (acc, metrics) => ({
        memoryUsage: acc.memoryUsage + metrics.memoryUsage,
        batteryLevel: acc.batteryLevel + metrics.batteryLevel,
        networkLatency: acc.networkLatency + metrics.networkLatency,
        frameRate: acc.frameRate + metrics.frameRate,
      }),
      { memoryUsage: 0, batteryLevel: 0, networkLatency: 0, frameRate: 0 }
    );

    const count = this.performanceHistory.length;

    return {
      averageMemoryUsage: total.memoryUsage / count,
      averageBatteryLevel: total.batteryLevel / count,
      averageNetworkLatency: total.networkLatency / count,
      averageFrameRate: total.frameRate / count,
    };
  }

  // MARK: - Configuration Management
  updatePerformanceConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.savePerformanceConfig();
  }

  getPerformanceConfig(): PerformanceConfig {
    return { ...this.config };
  }

  updateBatteryOptimization(newOptimization: Partial<BatteryOptimization>): void {
    this.batteryOptimization = { ...this.batteryOptimization, ...newOptimization };
    this.saveBatteryOptimization();
  }

  getBatteryOptimization(): BatteryOptimization {
    return { ...this.batteryOptimization };
  }

  // MARK: - Performance Alerts
  checkPerformanceAlerts(): {
    memoryAlert: boolean;
    batteryAlert: boolean;
    networkAlert: boolean;
    crashAlert: boolean;
  } {
    return {
      memoryAlert: this.metrics.memoryUsage > 90,
      batteryAlert: this.metrics.batteryLevel < 15,
      networkAlert: this.metrics.networkLatency > 1000,
      crashAlert: this.metrics.crashCount > 0,
    };
  }

  // MARK: - Performance Recommendations
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const alerts = this.checkPerformanceAlerts();

    if (alerts.memoryAlert) {
      recommendations.push('Clear app cache to free up memory');
    }

    if (alerts.batteryAlert) {
      recommendations.push('Enable battery optimization mode');
    }

    if (alerts.networkAlert) {
      recommendations.push('Check your internet connection');
    }

    if (alerts.crashAlert) {
      recommendations.push('Restart the app to resolve issues');
    }

    return recommendations;
  }
}

export const performanceService = PerformanceService.getInstance();
