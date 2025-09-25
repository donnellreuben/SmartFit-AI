// Global type declarations for React Native and Jest

declare global {
  namespace NodeJS {
    interface Global {
      setTimeout: typeof setTimeout;
      clearTimeout: typeof clearTimeout;
      setInterval: typeof setInterval;
      clearInterval: typeof clearInterval;
    }
  }

  var global: NodeJS.Global;
  var btoa: (str: string) => string;
  var atob: (str: string) => string;
}

export {};
