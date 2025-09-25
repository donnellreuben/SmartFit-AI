import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SmartFitButton } from '../components/SmartFitButton';
import { SmartFitCard } from '../components/SmartFitCard';
import CameraComponent from '../components/CameraComponent';
import { aiService, EquipmentDetection } from '../services/aiService';
import { theme } from '../constants/theme';

type EquipmentCaptureScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EquipmentCapture'>;

interface EquipmentCaptureScreenProps {
  navigation: EquipmentCaptureScreenNavigationProp;
}

const EquipmentCaptureScreen: React.FC<EquipmentCaptureScreenProps> = ({ navigation }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [detectedEquipment, setDetectedEquipment] = useState<EquipmentDetection[]>([]);
  const [_analysisResults, _setAnalysisResults] = useState<any>(null);

  const handleTakePhoto = () => {
    setShowCamera(true);
  };

  const handleImageCaptured = (imageUri: string) => {
    setCapturedImages(prev => [...prev, imageUri]);
    setShowCamera(false);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  const handleAnalyzeEquipment = async () => {
    if (capturedImages.length === 0) {
      Alert.alert('No Images', 'Please take at least one photo of your equipment');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Call AI service to analyze equipment
      const results = await aiService.analyzeEquipment(capturedImages);
      setAnalysisResults(results);
      setDetectedEquipment(results.detectedEquipment);
      
      Alert.alert(
        'Analysis Complete!',
        `Found ${results.detectedEquipment.length} pieces of equipment with ${Math.round(results.totalConfidence * 100)}% confidence.`,
        [
          { text: 'View Results', onPress: () => {} },
          { text: 'Continue', onPress: () => navigation.navigate('WorkoutPlan') }
        ]
      );
    } catch (error) {
      Alert.alert('Analysis Failed', 'Could not analyze equipment. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Equipment Setup</Text>
        <Text style={styles.subtitle}>
          Take photos of your available equipment so we can create the perfect workout plan
        </Text>

        {/* Camera Button */}
        <View style={styles.cameraSection}>
          <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto}>
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraIconText}>📷</Text>
            </View>
            <Text style={styles.cameraButtonText}>Take Photo</Text>
            <Text style={styles.cameraButtonSubtext}>
              Capture your equipment
            </Text>
          </TouchableOpacity>
        </View>

        {/* Captured Images */}
        {capturedImages.length > 0 && (
          <View style={styles.imagesSection}>
            <Text style={styles.imagesTitle}>Captured Equipment ({capturedImages.length})</Text>
            <View style={styles.imagesGrid}>
              {capturedImages.map((image, index) => (
                <SmartFitCard key={index} style={styles.imageCard}>
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>📸</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </SmartFitCard>
              ))}
            </View>
          </View>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <View style={styles.analysisSection}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>Analyzing Equipment...</Text>
            </View>
          </View>
        )}

        {/* Detected Equipment */}
        {detectedEquipment.length > 0 && (
          <View style={styles.detectedEquipmentSection}>
            <Text style={styles.sectionTitle}>Detected Equipment</Text>
            {detectedEquipment.map((equipment, _index) => (
              <SmartFitCard key={equipment.id} style={styles.equipmentCard}>
                <View style={styles.equipmentInfo}>
                  <Text style={styles.equipmentName}>{equipment.name}</Text>
                  <Text style={styles.equipmentCategory}>{equipment.category}</Text>
                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceLabel}>Confidence:</Text>
                    <Text style={styles.confidenceValue}>
                      {Math.round(equipment.confidence * 100)}%
                    </Text>
                  </View>
                </View>
              </SmartFitCard>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          {capturedImages.length > 0 && !isAnalyzing && (
            <SmartFitButton
              title="Analyze Equipment"
              onPress={handleAnalyzeEquipment}
              style={styles.analyzeButton}
            />
          )}
          
          {!isAnalyzing && (
            <SmartFitButton
              title="Skip for Now"
              onPress={() => navigation.navigate('WorkoutPlan')}
              variant="outline"
              style={styles.skipButton}
            />
          )}
        </View>
      </View>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CameraComponent
          onImageCaptured={handleImageCaptured}
          onClose={handleCloseCamera}
          maxImages={10}
          currentImageCount={capturedImages.length}
        />
      </Modal>
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
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[4],
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
    lineHeight: 24,
  },
  cameraSection: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  cameraButton: {
    alignItems: 'center',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderStyle: 'dashed',
    minWidth: 200,
  },
  cameraIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  cameraIconText: {
    fontSize: 32,
  },
  cameraButtonText: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  cameraButtonSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  imagesSection: {
    marginBottom: theme.spacing[6],
  },
  imagesTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[4],
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  imageCard: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
  },
  imagePlaceholderText: {
    fontSize: 24,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  analysisSection: {
    marginBottom: theme.spacing[6],
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing[3],
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    width: '100%',
    // Animation would be added here
  },
  progressText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  buttonSection: {
    gap: theme.spacing[3],
  },
  analyzeButton: {
    marginBottom: theme.spacing[2],
  },
  skipButton: {
    // Additional styles if needed
  },
  detectedEquipmentSection: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[4],
  },
  equipmentCard: {
    marginBottom: theme.spacing[3],
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  equipmentCategory: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[2],
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  confidenceLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  confidenceValue: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: '600',
  },
});

export default EquipmentCaptureScreen;
