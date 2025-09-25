import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { theme } from '../constants/theme';

// const { width, height } = Dimensions.get('window');

export interface CameraComponentProps {
  onImageCaptured: (imageUri: string) => void;
  onClose: () => void;
  maxImages?: number;
  currentImageCount?: number;
}

export const CameraComponent: React.FC<CameraComponentProps> = ({
  onImageCaptured,
  onClose,
  maxImages = 10,
  currentImageCount = 0,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<RNCamera>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await check(PERMISSIONS.IOS.CAMERA);
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        const requestResult = await request(PERMISSIONS.IOS.CAMERA);
        setHasPermission(requestResult === RESULTS.GRANTED);
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      setHasPermission(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const options = {
        quality: 0.8,
        base64: false,
        skipProcessing: false,
        orientation: 'portrait' as const,
        fixOrientation: true,
      };

      const data = await cameraRef.current.takePictureAsync(options);

      if (data.uri) {
        onImageCaptured(data.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode(prev => {
      switch (prev) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'off';
      }
    });
  };

  const toggleCamera = () => {
    setCameraType(prev => (prev === 'back' ? 'front' : 'back'));
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.permissionText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          SmartFit AI needs camera access to analyze your equipment and create
          personalized workout plans.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={checkCameraPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Camera Permission',
          message: 'SmartFit AI needs camera access to analyze your equipment',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }}
      >
        {/* Camera Overlay */}
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.imageCounter}>
              <Text style={styles.counterText}>
                {currentImageCount}/{maxImages}
              </Text>
            </View>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
              <Text style={styles.flashButtonText}>
                {flashMode === 'off' ? '⚡' : flashMode === 'on' ? '⚡' : '⚡'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Center Focus Area */}
          <View style={styles.focusArea}>
            <View style={styles.focusFrame} />
            <Text style={styles.focusText}>
              Position equipment in the frame
            </Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={toggleCamera}
            >
              <Text style={styles.switchButtonText}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                isCapturing && styles.captureButtonDisabled,
              ]}
              onPress={takePicture}
              disabled={isCapturing || currentImageCount >= maxImages}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color={theme.colors.text} />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </View>
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.small,
  },
  counterText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButtonText: {
    color: theme.colors.text,
    fontSize: 18,
  },
  focusArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  focusFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderRadius: theme.borderRadius.large,
    backgroundColor: 'transparent',
  },
  focusText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  switchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchButtonText: {
    color: theme.colors.text,
    fontSize: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.text,
  },
  captureButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.text,
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  permissionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  permissionText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  permissionButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.lg,
  },
  permissionButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
});

export default CameraComponent;
