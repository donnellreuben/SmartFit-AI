import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onClose?: () => void;
  autoPlay?: boolean;
  loop?: boolean;
  showControls?: boolean;
  style?: any;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  onClose,
  autoPlay = false,
  loop = false,
  showControls = true,
  style,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<VideoRef>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (showControlsOverlay) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControlsOverlay(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControlsOverlay]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    setShowControlsOverlay(true);
  };

  const handlePlaybackRateChange = () => {
    const rates = [0.5, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.seek(time);
    }
  };

  const handleProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  const handleLoad = (data: any) => {
    setDuration(data.duration);
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    console.error('Video error:', error);
    setIsLoading(false);
    Alert.alert('Video Error', 'Failed to load video. Please try again.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoPress = () => {
    if (showControls) {
      setShowControlsOverlay(!showControlsOverlay);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreen, style]}>
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          paused={!isPlaying}
          repeat={loop}
          rate={playbackRate}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onError={handleError}
          resizeMode="contain"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}

        {showControls && showControlsOverlay && (
          <View style={styles.controlsOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              {title && (
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {title}
                </Text>
              )}
              {onClose && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Center Play Button */}
            <View style={styles.centerControls}>
              <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                <Text style={styles.playButtonText}>
                  {isPlaying ? '⏸' : '▶'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)}
              </Text>
              
              <View style={styles.progressContainer}>
                <TouchableOpacity
                  style={styles.progressBar}
                  onPress={(event) => {
                    const { locationX } = event.nativeEvent;
                    const progress = locationX / (width - 100);
                    const seekTime = progress * duration;
                    handleSeek(seekTime);
                  }}
                >
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(currentTime / duration) * 100}%` }
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.timeText}>
                {formatTime(duration)}
              </Text>
              
              <TouchableOpacity
                style={styles.rateButton}
                onPress={handlePlaybackRateChange}
              >
                <Text style={styles.rateButtonText}>{playbackRate}x</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.fullscreenButton}
                onPress={toggleFullscreen}
              >
                <Text style={styles.fullscreenButtonText}>
                  {isFullscreen ? '⤓' : '⤢'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    borderRadius: 0,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    marginTop: theme.spacing[2],
    fontSize: 16,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
  },
  videoTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: theme.spacing[2],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: theme.colors.text,
    fontSize: 32,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    gap: theme.spacing[2],
  },
  timeText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    minWidth: 40,
  },
  progressContainer: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  progressBar: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: 4,
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  rateButton: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: theme.borderRadius.small,
  },
  rateButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  fullscreenButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenButtonText: {
    color: theme.colors.text,
    fontSize: 16,
  },
});

export default VideoPlayer;
