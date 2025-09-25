import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from '../constants/theme';

// Import screens (we'll create these)
import WelcomeScreen from '../screens/WelcomeScreen';
import AuthScreen from '../screens/AuthScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import EquipmentCaptureScreen from '../screens/EquipmentCaptureScreen';
import WorkoutPlanScreen from '../screens/WorkoutPlanScreen';
import ProgressTrackingScreen from '../screens/ProgressTrackingScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  ProfileSetup: undefined;
  EquipmentCapture: undefined;
  WorkoutPlan: undefined;
  ProgressTracking: undefined;
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
          name="ProgressTracking" 
          component={ProgressTrackingScreen}
          options={{ title: 'Progress Tracking' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
