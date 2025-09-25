import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SmartFitButton } from '../components/SmartFitButton';
import { theme } from '../constants/theme';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('Auth');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* App Logo Placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>SF</Text>
          </View>
        </View>

        {/* App Title */}
        <Text style={styles.title}>SmartFit AI</Text>
        <Text style={styles.subtitle}>
          Your AI-powered personal trainer
        </Text>
        <Text style={styles.description}>
          Get personalized workout plans based on your equipment and fitness goals
        </Text>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <SmartFitButton
            title="Get Started"
            onPress={handleGetStarted}
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
  },
  logoContainer: {
    marginBottom: theme.spacing[8],
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing[8],
    paddingHorizontal: theme.spacing[4],
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    width: '100%',
  },
});

export default WelcomeScreen;
