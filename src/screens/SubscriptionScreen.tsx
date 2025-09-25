import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SmartFitButton } from '../components/SmartFitButton';
import { SmartFitCard } from '../components/SmartFitCard';
import {
  subscriptionService,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../services/subscriptionService';
import { theme } from '../constants/theme';

type SubscriptionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Subscription'
>;

interface SubscriptionScreenProps {
  navigation: SubscriptionScreenNavigationProp;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation: _navigation,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentStatus, setCurrentStatus] = useState<SubscriptionStatus | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const availablePlans = subscriptionService.getAvailablePlans();
      const status = subscriptionService.getSubscriptionStatus();

      setPlans(availablePlans);
      setCurrentStatus(status);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      Alert.alert('Error', 'Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handlePurchase = async (planId: string) => {
    try {
      setIsPurchasing(true);

      const plan = subscriptionService.getPlanById(planId);
      if (!plan) {
        Alert.alert('Error', 'Plan not found');
        return;
      }

      if (plan.price === 0) {
        // Free plan - no purchase needed
        Alert.alert('Success', 'You are now on the free plan');
        await loadSubscriptionData();
        return;
      }

      // Start trial if available
      if (plan.trialDays && plan.trialDays > 0) {
        const trialResult = await subscriptionService.startTrial(planId);
        if (trialResult.success) {
          Alert.alert(
            'Trial Started',
            `Your ${plan.trialDays}-day free trial has begun!`,
          );
          await loadSubscriptionData();
        } else {
          Alert.alert('Error', trialResult.error || 'Failed to start trial');
        }
        return;
      }

      // Purchase subscription
      const purchaseResult = await subscriptionService.purchaseSubscription(
        planId,
      );
      if (purchaseResult.success) {
        Alert.alert('Success', 'Subscription activated successfully!');
        await loadSubscriptionData();
      } else {
        Alert.alert('Error', purchaseResult.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'An error occurred during purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsLoading(true);
      const result = await subscriptionService.restorePurchases();

      if (result.success) {
        Alert.alert('Success', 'Purchases restored successfully!');
        await loadSubscriptionData();
      } else {
        Alert.alert('Error', result.error || 'No purchases found to restore');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await subscriptionService.cancelSubscription();
              if (success) {
                Alert.alert('Success', 'Subscription cancelled successfully');
                await loadSubscriptionData();
              } else {
                Alert.alert('Error', 'Failed to cancel subscription');
              }
            } catch (error) {
              console.error('Cancel error:', error);
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          },
        },
      ],
    );
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan === plan.id;
    const isCurrentPlan = currentStatus?.planId === plan.id;
    const isPopular = plan.isPopular;

    return (
      <SmartFitCard
        key={plan.id}
        style={StyleSheet.flatten([
          styles.planCard,
          isSelected ? styles.selectedPlan : null,
          isPopular ? styles.popularPlan : null,
        ])}
        onPress={() => handlePlanSelect(plan.id)}
      >
        {isPopular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}

        {isCurrentPlan && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentText}>CURRENT PLAN</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ${plan.price}
              {plan.price > 0 && (
                <Text style={styles.pricePeriod}>/{plan.interval}</Text>
              )}
            </Text>
          </View>
        </View>

        <Text style={styles.planDescription}>{plan.description}</Text>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {plan.trialDays && plan.trialDays > 0 && (
          <View style={styles.trialContainer}>
            <Text style={styles.trialText}>
              {plan.trialDays}-day free trial
            </Text>
          </View>
        )}

        <View style={styles.planActions}>
          {isCurrentPlan ? (
            <View style={styles.currentPlanActions}>
              <Text style={styles.currentPlanText}>Active Plan</Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <SmartFitButton
              title={plan.price === 0 ? 'Current Plan' : 'Select Plan'}
              onPress={() => handlePurchase(plan.id)}
              variant="primary"
              size="large"
              disabled={plan.price === 0}
              loading={isPurchasing && selectedPlan === plan.id}
            />
          )}
        </View>
      </SmartFitCard>
    );
  };

  const renderCurrentStatus = () => {
    if (!currentStatus || !currentStatus.isActive) {
      return (
        <SmartFitCard style={styles.statusCard}>
          <Text style={styles.statusTitle}>Current Status</Text>
          <Text style={styles.statusText}>Free Plan</Text>
          <Text style={styles.statusSubtext}>
            Upgrade to unlock premium features
          </Text>
        </SmartFitCard>
      );
    }

    const currentPlan = subscriptionService.getCurrentPlan();
    const isTrial = subscriptionService.isTrialActive();
    const daysRemaining = subscriptionService.getDaysRemainingInTrial();

    return (
      <SmartFitCard style={styles.statusCard}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <Text style={styles.statusText}>
          {currentPlan?.name || 'Unknown Plan'}
        </Text>

        {isTrial && (
          <Text style={styles.trialStatusText}>
            Trial ends in {daysRemaining} days
          </Text>
        )}

        <Text style={styles.statusSubtext}>
          {currentStatus.autoRenew
            ? 'Auto-renewal enabled'
            : 'Auto-renewal disabled'}
        </Text>
      </SmartFitCard>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>
            Loading subscription information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Unlock premium features and take your fitness journey to the next
            level
          </Text>
        </View>

        {renderCurrentStatus()}

        <View style={styles.plansContainer}>{plans.map(renderPlanCard)}</View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
          >
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Subscriptions automatically renew unless cancelled at least 24 hours
            before the end of the current period.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
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
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  statusCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  statusTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  statusText: {
    ...theme.typography.h2,
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  statusSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  trialStatusText: {
    ...theme.typography.body,
    color: theme.colors.warning,
    marginBottom: theme.spacing.xs,
  },
  plansContainer: {
    padding: theme.spacing.lg,
  },
  planCard: {
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  selectedPlan: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  popularPlan: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
    zIndex: 1,
  },
  popularText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
    zIndex: 1,
  },
  currentText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  planName: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...theme.typography.h2,
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  pricePeriod: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: 'normal',
  },
  planDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  featuresContainer: {
    marginBottom: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  featureIcon: {
    ...theme.typography.body,
    color: theme.colors.success,
    marginRight: theme.spacing.sm,
    fontWeight: 'bold',
  },
  featureText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  trialContainer: {
    backgroundColor: theme.colors.accent + '20',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  trialText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: 'bold',
  },
  planActions: {
    marginTop: theme.spacing.sm,
  },
  currentPlanActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPlanText: {
    ...theme.typography.body,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  cancelButtonText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  restoreButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  restoreButtonText: {
    ...theme.typography.body,
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubscriptionScreen;
