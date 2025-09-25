import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutPlan } from '../store/workoutStore';

export interface OfflineWorkoutPlan {
  id: string;
  name: string;
  exercises: OfflineExercise[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  equipment: string[];
  createdAt: string;
  isDownloaded: boolean;
  downloadDate: string;
  fileSize: number; // in bytes
}

export interface OfflineExercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sets: number;
  reps: string;
  restTime: number;
  videoUrl: string;
  videoPath?: string; // Local path to downloaded video
  instructions: string[];
  tips: string[];
  alternatives: string[];
  isVideoDownloaded: boolean;
}

export interface OfflineVideo {
  id: string;
  exerciseId: string;
  url: string;
  localPath: string;
  fileSize: number;
  downloadDate: string;
  quality: 'low' | 'medium' | 'high';
}

export interface SyncQueue {
  id: string;
  type: 'workout' | 'progress' | 'equipment';
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = true;
  private syncQueue: SyncQueue[] = [];

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  constructor() {
    this.initializeOfflineStorage();
    this.setupNetworkListener();
  }

  private async initializeOfflineStorage() {
    try {
      // Create offline storage directories if they don't exist
      await this.createOfflineDirectories();
      
      // Load sync queue from storage
      const queueData = await AsyncStorage.getItem('sync_queue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
    }
  }

  private setupNetworkListener() {
    // In a real app, you'd use @react-native-community/netinfo
    // For now, we'll simulate network status
    this.isOnline = true;
  }

  private async createOfflineDirectories() {
    // Create directories for offline content
    // This would use react-native-fs in a real implementation
    console.log('Creating offline directories...');
  }

  // MARK: - Workout Plan Caching
  async cacheWorkoutPlan(workoutPlan: WorkoutPlan): Promise<OfflineWorkoutPlan> {
    try {
      const offlinePlan: OfflineWorkoutPlan = {
        ...workoutPlan,
        focusAreas: [], // Will be populated from exercises
        equipment: [], // Will be populated from exercises
        isDownloaded: true,
        downloadDate: new Date().toISOString(),
        fileSize: this.calculateWorkoutPlanSize(workoutPlan),
        exercises: workoutPlan.exercises.map(exercise => ({
          ...exercise,
          alternatives: exercise.alternatives.map(alt => alt.name || alt.toString()),
          isVideoDownloaded: false,
        }))
      };

      await AsyncStorage.setItem(
        `offline_workout_${workoutPlan.id}`,
        JSON.stringify(offlinePlan)
      );

      // Update cached plans list
      await this.updateCachedPlansList(workoutPlan.id);

      return offlinePlan;
    } catch (error) {
      console.error('Failed to cache workout plan:', error);
      throw error;
    }
  }

  async getCachedWorkoutPlans(): Promise<OfflineWorkoutPlan[]> {
    try {
      const cachedPlansList = await AsyncStorage.getItem('cached_workout_plans');
      if (!cachedPlansList) return [];

      const planIds: string[] = JSON.parse(cachedPlansList);
      const plans: OfflineWorkoutPlan[] = [];

      for (const planId of planIds) {
        const planData = await AsyncStorage.getItem(`offline_workout_${planId}`);
        if (planData) {
          plans.push(JSON.parse(planData));
        }
      }

      return plans;
    } catch (error) {
      console.error('Failed to get cached workout plans:', error);
      return [];
    }
  }

  async removeCachedWorkoutPlan(planId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`offline_workout_${planId}`);
      
      // Update cached plans list
      const cachedPlansList = await AsyncStorage.getItem('cached_workout_plans');
      if (cachedPlansList) {
        const planIds: string[] = JSON.parse(cachedPlansList);
        const updatedIds = planIds.filter(id => id !== planId);
        await AsyncStorage.setItem('cached_workout_plans', JSON.stringify(updatedIds));
      }
    } catch (error) {
      console.error('Failed to remove cached workout plan:', error);
    }
  }

  private async updateCachedPlansList(planId: string): Promise<void> {
    try {
      const cachedPlansList = await AsyncStorage.getItem('cached_workout_plans');
      const planIds: string[] = cachedPlansList ? JSON.parse(cachedPlansList) : [];
      
      if (!planIds.includes(planId)) {
        planIds.push(planId);
        await AsyncStorage.setItem('cached_workout_plans', JSON.stringify(planIds));
      }
    } catch (error) {
      console.error('Failed to update cached plans list:', error);
    }
  }

  // MARK: - Video Downloading
  async downloadExerciseVideo(exerciseId: string, videoUrl: string, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<OfflineVideo> {
    try {
      // Simulate video download
      const localPath = `offline_videos/${exerciseId}_${quality}.mp4`;
      const fileSize = this.calculateVideoSize(quality);
      
      const offlineVideo: OfflineVideo = {
        id: `video_${exerciseId}_${Date.now()}`,
        exerciseId,
        url: videoUrl,
        localPath,
        fileSize,
        downloadDate: new Date().toISOString(),
        quality,
      };

      // Store video metadata
      await AsyncStorage.setItem(
        `offline_video_${exerciseId}`,
        JSON.stringify(offlineVideo)
      );

      // Update exercise with video path
      await this.updateExerciseVideoPath(exerciseId, localPath);

      return offlineVideo;
    } catch (error) {
      console.error('Failed to download exercise video:', error);
      throw error;
    }
  }

  async getOfflineVideo(exerciseId: string): Promise<OfflineVideo | null> {
    try {
      const videoData = await AsyncStorage.getItem(`offline_video_${exerciseId}`);
      return videoData ? JSON.parse(videoData) : null;
    } catch (error) {
      console.error('Failed to get offline video:', error);
      return null;
    }
  }

  async removeOfflineVideo(exerciseId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`offline_video_${exerciseId}`);
    } catch (error) {
      console.error('Failed to remove offline video:', error);
    }
  }

  private async updateExerciseVideoPath(exerciseId: string, localPath: string): Promise<void> {
    try {
      // Update exercise in cached workout plans
      const cachedPlans = await this.getCachedWorkoutPlans();
      
      for (const plan of cachedPlans) {
        const exerciseIndex = plan.exercises.findIndex(ex => ex.id === exerciseId);
        if (exerciseIndex !== -1) {
          plan.exercises[exerciseIndex].videoPath = localPath;
          plan.exercises[exerciseIndex].isVideoDownloaded = true;
          
          await AsyncStorage.setItem(
            `offline_workout_${plan.id}`,
            JSON.stringify(plan)
          );
        }
      }
    } catch (error) {
      console.error('Failed to update exercise video path:', error);
    }
  }

  // MARK: - Progress Tracking Offline
  async saveOfflineProgress(progressData: any): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const progressId = `progress_${timestamp}`;
      
      await AsyncStorage.setItem(
        `offline_progress_${progressId}`,
        JSON.stringify({
          id: progressId,
          data: progressData,
          timestamp,
          synced: false,
        })
      );

      // Add to sync queue
      await this.addToSyncQueue('progress', progressData);
    } catch (error) {
      console.error('Failed to save offline progress:', error);
    }
  }

  async getOfflineProgress(): Promise<any[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter((key: string) => key.startsWith('offline_progress_'));
      const progressData: any[] = [];

      for (const key of progressKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          progressData.push(JSON.parse(data));
        }
      }

      return progressData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get offline progress:', error);
      return [];
    }
  }

  // MARK: - Sync Management
  async addToSyncQueue(type: 'workout' | 'progress' | 'equipment', data: any): Promise<void> {
    try {
      const syncItem: SyncQueue = {
        id: `sync_${Date.now()}`,
        type,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        maxRetries: 3,
      };

      this.syncQueue.push(syncItem);
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  async syncOfflineData(): Promise<void> {
    if (!this.isOnline) {
      console.log('Device is offline, skipping sync');
      return;
    }

    try {
      const itemsToSync = [...this.syncQueue];
      
      for (const item of itemsToSync) {
        try {
          await this.syncItem(item);
          await this.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          item.retryCount++;
          
          if (item.retryCount >= item.maxRetries) {
            await this.removeFromSyncQueue(item.id);
          } else {
            await this.updateSyncQueueItem(item);
          }
        }
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  private async syncItem(item: SyncQueue): Promise<void> {
    // Simulate API calls based on item type
    switch (item.type) {
      case 'workout':
        console.log('Syncing workout data:', item.data);
        break;
      case 'progress':
        console.log('Syncing progress data:', item.data);
        break;
      case 'equipment':
        console.log('Syncing equipment data:', item.data);
        break;
    }
    
    // Simulate network delay
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
  }

  private async removeFromSyncQueue(itemId: string): Promise<void> {
    this.syncQueue = this.syncQueue.filter(item => item.id !== itemId);
    await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
  }

  private async updateSyncQueueItem(updatedItem: SyncQueue): Promise<void> {
    const index = this.syncQueue.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
      this.syncQueue[index] = updatedItem;
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    }
  }

  // MARK: - Storage Management
  async getStorageInfo(): Promise<{
    totalSize: number;
    workoutPlans: number;
    videos: number;
    progressItems: number;
  }> {
    try {
      const cachedPlans = await this.getCachedWorkoutPlans();
      const progressData = await this.getOfflineProgress();
      
      let totalSize = 0;
      let videoCount = 0;
      
      for (const plan of cachedPlans) {
        totalSize += plan.fileSize;
        videoCount += plan.exercises.filter((ex: OfflineExercise) => ex.isVideoDownloaded).length;
      }
      
      for (const progress of progressData) {
        totalSize += JSON.stringify(progress).length;
      }

      return {
        totalSize,
        workoutPlans: cachedPlans.length,
        videos: videoCount,
        progressItems: progressData.length,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        totalSize: 0,
        workoutPlans: 0,
        videos: 0,
        progressItems: 0,
      };
    }
  }

  async clearOfflineData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const offlineKeys = keys.filter((key: string) => 
        key.startsWith('offline_') || 
        key.startsWith('cached_') ||
        key === 'sync_queue'
      );
      
      await AsyncStorage.multiRemove(offlineKeys);
      this.syncQueue = [];
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  // MARK: - Helper Methods
  private calculateWorkoutPlanSize(plan: WorkoutPlan): number {
    // Estimate size based on plan complexity
    const baseSize = 1024; // 1KB base
    const exerciseSize = plan.exercises.length * 512; // 512 bytes per exercise
    return baseSize + exerciseSize;
  }

  private calculateVideoSize(quality: 'low' | 'medium' | 'high'): number {
    switch (quality) {
      case 'low': return 5 * 1024 * 1024; // 5MB
      case 'medium': return 15 * 1024 * 1024; // 15MB
      case 'high': return 30 * 1024 * 1024; // 30MB
    }
  }

  // MARK: - Network Status
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline) {
      this.syncOfflineData();
    }
  }

  isDeviceOnline(): boolean {
    return this.isOnline;
  }
}

export const offlineService = OfflineService.getInstance();
