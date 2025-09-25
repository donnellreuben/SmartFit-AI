import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SmartFitButton } from '../components/SmartFitButton';
import { SmartFitInput } from '../components/SmartFitInput';
import { theme } from '../constants/theme';

type ProfileSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileSetup'>;

interface ProfileSetupScreenProps {
  navigation: ProfileSetupScreenNavigationProp;
}

const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ navigation }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!height || !weight) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('EquipmentCapture');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Let's Get Personal</Text>
          <Text style={styles.subtitle}>
            Help us create the perfect workout plan for you
          </Text>

          <View style={styles.form}>
            <SmartFitInput
              label="Height (cm)"
              placeholder="Enter your height in centimeters"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              maxLength={3}
            />

            <SmartFitInput
              label="Weight (kg)"
              placeholder="Enter your weight in kilograms"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              maxLength={3}
            />

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                This information helps us calculate your BMI and create personalized workout recommendations.
              </Text>
            </View>

            <SmartFitButton
              title="Continue"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
          </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[8],
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing[8],
  },
  form: {
    flex: 1,
  },
  infoContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.medium,
    marginVertical: theme.spacing[4],
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  saveButton: {
    marginTop: theme.spacing[4],
  },
});

export default ProfileSetupScreen;
