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

// Global test setup
global.console = {
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
