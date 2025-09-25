import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface SecurityConfig {
  enableBiometricAuth: boolean;
  enableDataEncryption: boolean;
  enableSecureStorage: boolean;
  enableNetworkSecurity: boolean;
  enablePrivacyMode: boolean;
  sessionTimeout: number; // in minutes
  maxLoginAttempts: number;
  enableAuditLogging: boolean;
}

export interface BiometricAuth {
  isAvailable: boolean;
  isEnabled: boolean;
  type: 'fingerprint' | 'face' | 'iris' | 'none';
}

export interface SecurityAudit {
  id: string;
  action: string;
  timestamp: string;
  userId: string;
  deviceId: string;
  ipAddress?: string;
  success: boolean;
  details: string;
}

export interface DataEncryption {
  algorithm: string;
  keySize: number;
  mode: string;
  padding: string;
}

class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;
  private biometricAuth: BiometricAuth;
  private auditLog: SecurityAudit[] = [];
  private encryption: DataEncryption;
  private isInitialized: boolean = false;

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  constructor() {
    this.config = {
      enableBiometricAuth: true,
      enableDataEncryption: true,
      enableSecureStorage: true,
      enableNetworkSecurity: true,
      enablePrivacyMode: false,
      sessionTimeout: 30, // 30 minutes
      maxLoginAttempts: 5,
      enableAuditLogging: true,
    };

    this.biometricAuth = {
      isAvailable: false,
      isEnabled: false,
      type: 'none',
    };

    this.encryption = {
      algorithm: 'AES-256',
      keySize: 256,
      mode: 'GCM',
      padding: 'PKCS7',
    };

    this.initializeSecurity();
  }

  private async initializeSecurity() {
    try {
      await this.loadSecurityConfig();
      await this.checkBiometricAvailability();
      await this.loadAuditLog();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize security:', error);
    }
  }

  private async loadSecurityConfig() {
    try {
      const configData = await AsyncStorage.getItem('security_config');
      if (configData) {
        this.config = { ...this.config, ...JSON.parse(configData) };
      }
    } catch (error) {
      console.error('Failed to load security config:', error);
    }
  }

  private async saveSecurityConfig() {
    try {
      await AsyncStorage.setItem('security_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save security config:', error);
    }
  }

  private async checkBiometricAvailability() {
    try {
      // In a real app, you'd use react-native-biometrics
      // For now, simulate biometric availability
      this.biometricAuth = {
        isAvailable: Platform.OS === 'ios' || Platform.OS === 'android',
        isEnabled: false,
        type: Platform.OS === 'ios' ? 'face' : 'fingerprint',
      };
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
    }
  }

  private async loadAuditLog() {
    try {
      const auditData = await AsyncStorage.getItem('security_audit_log');
      if (auditData) {
        this.auditLog = JSON.parse(auditData);
      }
    } catch (error) {
      console.error('Failed to load audit log:', error);
    }
  }

  private async saveAuditLog() {
    try {
      await AsyncStorage.setItem('security_audit_log', JSON.stringify(this.auditLog));
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }
  }

  // MARK: - Biometric Authentication
  async enableBiometricAuth(): Promise<boolean> {
    try {
      if (!this.biometricAuth.isAvailable) {
        throw new Error('Biometric authentication not available on this device');
      }

      // In a real app, you'd use react-native-biometrics
      // For now, simulate enabling biometric auth
      this.biometricAuth.isEnabled = true;
      await this.logSecurityEvent('biometric_auth_enabled', true, 'Biometric authentication enabled');
      return true;
    } catch (error) {
      console.error('Failed to enable biometric auth:', error);
      await this.logSecurityEvent('biometric_auth_enabled', false, `Failed to enable biometric auth: ${error}`);
      return false;
    }
  }

  async disableBiometricAuth(): Promise<boolean> {
    try {
      this.biometricAuth.isEnabled = false;
      await this.logSecurityEvent('biometric_auth_disabled', true, 'Biometric authentication disabled');
      return true;
    } catch (error) {
      console.error('Failed to disable biometric auth:', error);
      return false;
    }
  }

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      if (!this.biometricAuth.isEnabled) {
        throw new Error('Biometric authentication not enabled');
      }

      // In a real app, you'd use react-native-biometrics
      // For now, simulate biometric authentication
      const success = Math.random() > 0.1; // 90% success rate for simulation
      
      await this.logSecurityEvent('biometric_auth_attempt', success, 'Biometric authentication attempt');
      return success;
    } catch (error) {
      console.error('Failed to authenticate with biometric:', error);
      await this.logSecurityEvent('biometric_auth_attempt', false, `Biometric authentication failed: ${error}`);
      return false;
    }
  }

  getBiometricAuth(): BiometricAuth {
    return { ...this.biometricAuth };
  }

  // MARK: - Data Encryption
  async encryptData(data: string): Promise<string> {
    try {
      if (!this.config.enableDataEncryption) {
        return data;
      }

      // In a real app, you'd use react-native-crypto-js or similar
      // For now, simulate encryption
      const encrypted = btoa(data); // Base64 encoding as simulation
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      throw error;
    }
  }

  async decryptData(encryptedData: string): Promise<string> {
    try {
      if (!this.config.enableDataEncryption) {
        return encryptedData;
      }

      // In a real app, you'd use proper decryption
      // For now, simulate decryption
      const decrypted = atob(encryptedData); // Base64 decoding as simulation
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw error;
    }
  }

  async encryptSensitiveData(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      return await this.encryptData(jsonString);
    } catch (error) {
      console.error('Failed to encrypt sensitive data:', error);
      throw error;
    }
  }

  async decryptSensitiveData(encryptedData: string): Promise<any> {
    try {
      const decryptedString = await this.decryptData(encryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Failed to decrypt sensitive data:', error);
      throw error;
    }
  }

  // MARK: - Secure Storage
  async storeSecurely(key: string, value: any): Promise<void> {
    try {
      if (this.config.enableSecureStorage) {
        const encryptedValue = await this.encryptSensitiveData(value);
        await AsyncStorage.setItem(key, encryptedValue);
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Failed to store data securely:', error);
      throw error;
    }
  }

  async retrieveSecurely(key: string): Promise<any> {
    try {
      const encryptedValue = await AsyncStorage.getItem(key);
      if (!encryptedValue) return null;

      if (this.config.enableSecureStorage) {
        return await this.decryptSensitiveData(encryptedValue);
      } else {
        return JSON.parse(encryptedValue);
      }
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      throw error;
    }
  }

  async removeSecurely(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove data securely:', error);
      throw error;
    }
  }

  // MARK: - Network Security
  async validateNetworkSecurity(): Promise<boolean> {
    try {
      if (!this.config.enableNetworkSecurity) {
        return true;
      }

      // Check for secure connections
      const isSecure = await this.checkSecureConnection();
      return isSecure;
    } catch (error) {
      console.error('Failed to validate network security:', error);
      return false;
    }
  }

  private async checkSecureConnection(): Promise<boolean> {
    // In a real app, you'd check SSL certificates, TLS versions, etc.
    // For now, simulate secure connection
    return true;
  }

  async getSecureHeaders(): Promise<{ [key: string]: string }> {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + await this.getAuthToken(),
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Version': '1.0.0',
      'X-Platform': Platform.OS,
    };
  }

  private async getAuthToken(): Promise<string> {
    // In a real app, you'd get the actual auth token
    return 'mock_auth_token';
  }

  // MARK: - Privacy Mode
  async enablePrivacyMode(): Promise<void> {
    try {
      this.config.enablePrivacyMode = true;
      await this.saveSecurityConfig();
      await this.logSecurityEvent('privacy_mode_enabled', true, 'Privacy mode enabled');
    } catch (error) {
      console.error('Failed to enable privacy mode:', error);
    }
  }

  async disablePrivacyMode(): Promise<void> {
    try {
      this.config.enablePrivacyMode = false;
      await this.saveSecurityConfig();
      await this.logSecurityEvent('privacy_mode_disabled', true, 'Privacy mode disabled');
    } catch (error) {
      console.error('Failed to disable privacy mode:', error);
    }
  }

  isPrivacyModeEnabled(): boolean {
    return this.config.enablePrivacyMode;
  }

  // MARK: - Session Management
  async startSecureSession(): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionData = {
        id: sessionId,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isActive: true,
      };

      await this.storeSecurely('current_session', sessionData);
      await this.logSecurityEvent('session_started', true, `Session started: ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error('Failed to start secure session:', error);
      throw error;
    }
  }

  async updateSessionActivity(): Promise<void> {
    try {
      const sessionData = await this.retrieveSecurely('current_session');
      if (sessionData) {
        sessionData.lastActivity = new Date().toISOString();
        await this.storeSecurely('current_session', sessionData);
      }
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }

  async endSecureSession(): Promise<void> {
    try {
      const sessionData = await this.retrieveSecurely('current_session');
      if (sessionData) {
        sessionData.isActive = false;
        sessionData.endTime = new Date().toISOString();
        await this.storeSecurely('current_session', sessionData);
        await this.logSecurityEvent('session_ended', true, `Session ended: ${sessionData.id}`);
      }
    } catch (error) {
      console.error('Failed to end secure session:', error);
    }
  }

  async isSessionValid(): Promise<boolean> {
    try {
      const sessionData = await this.retrieveSecurely('current_session');
      if (!sessionData || !sessionData.isActive) {
        return false;
      }

      const lastActivity = new Date(sessionData.lastActivity);
      const now = new Date();
      const timeDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60); // minutes

      return timeDiff < this.config.sessionTimeout;
    } catch (error) {
      console.error('Failed to check session validity:', error);
      return false;
    }
  }

  // MARK: - Audit Logging
  async logSecurityEvent(action: string, success: boolean, details: string): Promise<void> {
    try {
      if (!this.config.enableAuditLogging) return;

      const auditEntry: SecurityAudit = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        timestamp: new Date().toISOString(),
        userId: 'current_user', // In a real app, get from auth store
        deviceId: 'device_id', // In a real app, get device ID
        success,
        details,
      };

      this.auditLog.push(auditEntry);
      
      // Keep only last 1000 entries
      if (this.auditLog.length > 1000) {
        this.auditLog = this.auditLog.slice(-1000);
      }

      await this.saveAuditLog();
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  getAuditLog(): SecurityAudit[] {
    return [...this.auditLog];
  }

  async clearAuditLog(): Promise<void> {
    try {
      this.auditLog = [];
      await AsyncStorage.removeItem('security_audit_log');
    } catch (error) {
      console.error('Failed to clear audit log:', error);
    }
  }

  // MARK: - Security Configuration
  updateSecurityConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveSecurityConfig();
  }

  getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  // MARK: - Security Validation
  async validatePasswordStrength(password: string): Promise<{
    isStrong: boolean;
    score: number;
    suggestions: string[];
  }> {
    const suggestions: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      suggestions.push('Use at least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include uppercase letters');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include lowercase letters');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include numbers');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include special characters');
    }

    return {
      isStrong: score >= 4,
      score: (score / 5) * 100,
      suggestions,
    };
  }

  // MARK: - Data Sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .trim();
  }

  // MARK: - Security Recommendations
  getSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.biometricAuth.isEnabled) {
      recommendations.push('Enable biometric authentication for better security');
    }

    if (!this.config.enableDataEncryption) {
      recommendations.push('Enable data encryption to protect sensitive information');
    }

    if (!this.config.enableAuditLogging) {
      recommendations.push('Enable audit logging to track security events');
    }

    if (this.config.sessionTimeout > 60) {
      recommendations.push('Consider reducing session timeout for better security');
    }

    return recommendations;
  }
}

export const securityService = SecurityService.getInstance();
