/**
 * SmartFit AI - AI-powered personalized workout plans
 * 
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/constants/theme';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.primary}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
