import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SmartFitCard } from '../components/SmartFitCard';
import { ProgressChart } from '../components/ProgressChart';
import { 
  businessAnalyticsService, 
  BusinessMetrics, 
  UserSegment, 
  CohortAnalysis,
  FunnelAnalysis,
  RevenueAnalysis 
} from '../services/businessAnalyticsService';
import { theme } from '../constants/theme';

type AnalyticsDashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnalyticsDashboard'>;

interface AnalyticsDashboardScreenProps {
  navigation: AnalyticsDashboardScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const AnalyticsDashboardScreen: React.FC<AnalyticsDashboardScreenProps> = ({ navigation: _navigation }) => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [cohortData, setCohortData] = useState<CohortAnalysis[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelAnalysis[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'revenue' | 'funnel'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      await businessAnalyticsService.refreshAnalytics();
      
      setMetrics(businessAnalyticsService.getMetrics());
      setUserSegments(businessAnalyticsService.getUserSegments());
      setCohortData(businessAnalyticsService.getCohortData());
      setFunnelData(businessAnalyticsService.getFunnelData());
      setRevenueData(businessAnalyticsService.getRevenueAnalysis());
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabButton = (tab: string, title: string) => (
    <TouchableOpacity
      key={tab}
      style={[
        styles.tabButton,
        selectedTab === tab && styles.activeTabButton,
      ]}
      onPress={() => setSelectedTab(tab as any)}
    >
      <Text
        style={[
          styles.tabButtonText,
          selectedTab === tab && styles.activeTabButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => {
    if (!metrics) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.metricsGrid}>
          <SmartFitCard style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.totalUsers.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Total Users</Text>
          </SmartFitCard>

          <SmartFitCard style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.activeUsers.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Active Users</Text>
          </SmartFitCard>

          <SmartFitCard style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.retentionRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Retention Rate</Text>
          </SmartFitCard>

          <SmartFitCard style={styles.metricCard}>
            <Text style={styles.metricValue}>${metrics.revenue.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </SmartFitCard>

          <SmartFitCard style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.conversionRate.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Conversion Rate</Text>
          </SmartFitCard>

          <SmartFitCard style={styles.metricCard}>
            <Text style={styles.metricValue}>${metrics.averageRevenuePerUser.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>ARPU</Text>
          </SmartFitCard>
        </View>

        <SmartFitCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue Growth</Text>
          <ProgressChart
            data={revenueData.map(item => ({
              date: item.period,
              value: item.netRevenue,
            }))}
            title="Monthly Revenue"
            showTrend={true}
            trend={revenueData.length > 1 ? 
              ((revenueData[revenueData.length - 1].netRevenue - revenueData[0].netRevenue) / revenueData[0].netRevenue) * 100 : 0
            }
          />
        </SmartFitCard>
      </View>
    );
  };

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <SmartFitCard style={styles.segmentsCard}>
        <Text style={styles.cardTitle}>User Segments</Text>
        {userSegments.map((segment) => (
          <View key={segment.id} style={styles.segmentItem}>
            <View style={styles.segmentHeader}>
              <Text style={styles.segmentName}>{segment.name}</Text>
              <Text style={styles.segmentCount}>{segment.userCount.toLocaleString()}</Text>
            </View>
            <Text style={styles.segmentDescription}>{segment.description}</Text>
            <View style={styles.segmentBar}>
              <View 
                style={[
                  styles.segmentBarFill, 
                  { width: `${segment.percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.segmentPercentage}>{segment.percentage.toFixed(1)}%</Text>
          </View>
        ))}
      </SmartFitCard>

      <SmartFitCard style={styles.cohortCard}>
        <Text style={styles.cardTitle}>Cohort Analysis</Text>
        {cohortData.slice(0, 3).map((cohort) => (
          <View key={cohort.cohort} style={styles.cohortItem}>
            <Text style={styles.cohortName}>{cohort.cohort}</Text>
            <Text style={styles.cohortUsers}>{cohort.users} users</Text>
            <View style={styles.cohortRetention}>
              {cohort.retention.slice(0, 6).map((retention, index) => (
                <View key={index} style={styles.retentionBar}>
                  <View 
                    style={[
                      styles.retentionBarFill,
                      { height: `${retention * 100}%` }
                    ]} 
                  />
                  <Text style={styles.retentionLabel}>M{index}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </SmartFitCard>
    </View>
  );

  const renderRevenueTab = () => (
    <View style={styles.tabContent}>
      <SmartFitCard style={styles.revenueCard}>
        <Text style={styles.cardTitle}>Revenue Breakdown</Text>
        {revenueData.slice(-6).map((item) => (
          <View key={item.period} style={styles.revenueItem}>
            <View style={styles.revenueHeader}>
              <Text style={styles.revenuePeriod}>{item.period}</Text>
              <Text style={styles.revenueAmount}>${item.netRevenue.toLocaleString()}</Text>
            </View>
            <View style={styles.revenueBreakdown}>
              <View style={styles.revenueBar}>
                <View 
                  style={[
                    styles.revenueBarFill,
                    { 
                      width: `${(item.subscriptionRevenue / item.netRevenue) * 100}%`,
                      backgroundColor: theme.colors.accent,
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.revenueBarFill,
                    { 
                      width: `${(item.inAppPurchaseRevenue / item.netRevenue) * 100}%`,
                      backgroundColor: theme.colors.success,
                    }
                  ]} 
                />
              </View>
              <View style={styles.revenueLabels}>
                <Text style={styles.revenueLabel}>
                  Subscriptions: ${item.subscriptionRevenue.toLocaleString()}
                </Text>
                <Text style={styles.revenueLabel}>
                  IAP: ${item.inAppPurchaseRevenue.toLocaleString()}
                </Text>
              </View>
            </View>
            <Text style={styles.revenueGrowth}>
              Growth: {item.growthRate > 0 ? '+' : ''}{item.growthRate.toFixed(1)}%
            </Text>
          </View>
        ))}
      </SmartFitCard>
    </View>
  );

  const renderFunnelTab = () => (
    <View style={styles.tabContent}>
      <SmartFitCard style={styles.funnelCard}>
        <Text style={styles.cardTitle}>Conversion Funnel</Text>
        {funnelData.map((stage, index) => (
          <View key={stage.stage} style={styles.funnelItem}>
            <View style={styles.funnelStage}>
              <Text style={styles.funnelStageName}>{stage.stage}</Text>
              <Text style={styles.funnelStageUsers}>{stage.users.toLocaleString()} users</Text>
            </View>
            <View style={styles.funnelMetrics}>
              <Text style={styles.funnelConversion}>
                Conversion: {(stage.conversionRate * 100).toFixed(1)}%
              </Text>
              <Text style={styles.funnelDropOff}>
                Drop-off: {(stage.dropOffRate * 100).toFixed(1)}%
              </Text>
            </View>
            {index < funnelData.length - 1 && (
              <View style={styles.funnelArrow}>
                <Text style={styles.funnelArrowText}>↓</Text>
              </View>
            )}
          </View>
        ))}
      </SmartFitCard>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'users':
        return renderUsersTab();
      case 'revenue':
        return renderRevenueTab();
      case 'funnel':
        return renderFunnelTab();
      default:
        return renderOverviewTab();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadAnalyticsData}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('overview', 'Overview')}
        {renderTabButton('users', 'Users')}
        {renderTabButton('revenue', 'Revenue')}
        {renderTabButton('funnel', 'Funnel')}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  refreshButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  refreshButtonText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: theme.colors.accent,
  },
  tabButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  activeTabButtonText: {
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  metricCard: {
    width: (width - theme.spacing.lg * 3) / 2,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    ...theme.typography.h2,
    color: theme.colors.accent,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  metricLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  chartTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  segmentsCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cohortCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  revenueCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  funnelCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  segmentItem: {
    marginBottom: theme.spacing.md,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  segmentName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  segmentCount: {
    ...theme.typography.body,
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  segmentDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  segmentBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.xs,
  },
  segmentBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },
  segmentPercentage: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  cohortItem: {
    marginBottom: theme.spacing.md,
  },
  cohortName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  cohortUsers: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  cohortRetention: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
  },
  retentionBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  retentionBarFill: {
    width: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
    marginBottom: theme.spacing.xs,
  },
  retentionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
  revenueItem: {
    marginBottom: theme.spacing.md,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  revenuePeriod: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  revenueAmount: {
    ...theme.typography.body,
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  revenueBreakdown: {
    marginBottom: theme.spacing.xs,
  },
  revenueBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  revenueBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  revenueLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  revenueLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  revenueGrowth: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  funnelItem: {
    marginBottom: theme.spacing.md,
  },
  funnelStage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  funnelStageName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  funnelStageUsers: {
    ...theme.typography.body,
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  funnelMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  funnelConversion: {
    ...theme.typography.caption,
    color: theme.colors.success,
  },
  funnelDropOff: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
  funnelArrow: {
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
  },
  funnelArrowText: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
  },
});

export default AnalyticsDashboardScreen;
