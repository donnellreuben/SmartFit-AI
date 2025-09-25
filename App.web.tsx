import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { theme } from './src/constants/theme';

// Import your main App component
import App from './App';

// Web-specific wrapper
const WebApp: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <App />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default WebApp;
