import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from '../constants/theme';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import AuthScreen from '../screens/AuthScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import EquipmentCaptureScreen from '../screens/EquipmentCaptureScreen';
import WorkoutPlanScreen from '../screens/WorkoutPlanScreen';
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import WorkoutSummaryScreen from '../screens/WorkoutSummaryScreen';
import ProgressTrackingScreen from '../screens/ProgressTrackingScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import AnalyticsDashboardScreen from '../screens/AnalyticsDashboardScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  ProfileSetup: undefined;
  EquipmentCapture: undefined;
  WorkoutPlan: undefined;
  ActiveWorkout: undefined;
  WorkoutSummary: undefined;
  ProgressTracking: undefined;
  Subscription: undefined;
  AnalyticsDashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ title: 'Sign In' }}
        />
        <Stack.Screen 
          name="ProfileSetup" 
          component={ProfileSetupScreen}
          options={{ title: 'Profile Setup' }}
        />
        <Stack.Screen 
          name="EquipmentCapture" 
          component={EquipmentCaptureScreen}
          options={{ title: 'Equipment Setup' }}
        />
        <Stack.Screen 
          name="WorkoutPlan" 
          component={WorkoutPlanScreen}
          options={{ title: 'Your Workout Plan' }}
        />
        <Stack.Screen 
          name="ActiveWorkout" 
          component={ActiveWorkoutScreen}
          options={{ 
            title: 'Active Workout',
            headerShown: false // Full screen workout experience
          }}
        />
        <Stack.Screen 
          name="WorkoutSummary" 
          component={WorkoutSummaryScreen}
          options={{ title: 'Workout Complete' }}
        />
        <Stack.Screen 
          name="ProgressTracking" 
          component={ProgressTrackingScreen}
          options={{ title: 'Progress Tracking' }}
        />
        <Stack.Screen 
          name="Subscription" 
          component={SubscriptionScreen}
          options={{ title: 'Subscription Plans' }}
        />
        <Stack.Screen 
          name="AnalyticsDashboard" 
          component={AnalyticsDashboardScreen}
          options={{ title: 'Analytics Dashboard' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
