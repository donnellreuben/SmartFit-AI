// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Mock react-native-camera
jest.mock('react-native-camera', () => ({
  RNCamera: {
    Constants: {
      FlashMode: {
        off: 'off',
        on: 'on',
        auto: 'auto',
      },
      Type: {
        back: 'back',
        front: 'front',
      },
    },
  },
}));

// Mock react-native-video
jest.mock('react-native-video', () => 'Video');

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  PERMISSIONS: {
    CAMERA: 'camera',
    WRITE_EXTERNAL_STORAGE: 'write_external_storage',
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    DENIED: 'denied',
    LIMITED: 'limited',
    GRANTED: 'granted',
    BLOCKED: 'blocked',
  },
}));

// Mock PixelRatio
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn(size => size * 2),
  roundToNearestPixel: jest.fn(size => Math.round(size)),
}));

// Mock StyleSheet
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: jest.fn(styles => styles),
  flatten: jest.fn(style => style),
  absoluteFill: {},
  absoluteFillObject: {},
  hairlineWidth: 1,
}));

// Note: Removed complex React Native mocking to avoid conflicts

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812, scale: 2, fontScale: 1 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Global test setup
(global as any).console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers
jest.useFakeTimers();

// Setup global test timeout
jest.setTimeout(10000);
