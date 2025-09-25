export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    border: string;
    placeholder: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight:
        | 'normal'
        | 'bold'
        | '100'
        | '200'
        | '300'
        | '400'
        | '500'
        | '600'
        | '700'
        | '800'
        | '900';
      lineHeight: number;
    };
    h2: {
      fontSize: number;
      fontWeight:
        | 'normal'
        | 'bold'
        | '100'
        | '200'
        | '300'
        | '400'
        | '500'
        | '600'
        | '700'
        | '800'
        | '900';
      lineHeight: number;
    };
    h3: {
      fontSize: number;
      fontWeight:
        | 'normal'
        | 'bold'
        | '100'
        | '200'
        | '300'
        | '400'
        | '500'
        | '600'
        | '700'
        | '800'
        | '900';
      lineHeight: number;
    };
    body: {
      fontSize: number;
      fontWeight:
        | 'normal'
        | 'bold'
        | '100'
        | '200'
        | '300'
        | '400'
        | '500'
        | '600'
        | '700'
        | '800'
        | '900';
      lineHeight: number;
    };
    caption: {
      fontSize: number;
      fontWeight:
        | 'normal'
        | 'bold'
        | '100'
        | '200'
        | '300'
        | '400'
        | '500'
        | '600'
        | '700'
        | '800'
        | '900';
      lineHeight: number;
    };
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  shadows: {
    small: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    large: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

export const theme: Theme = {
  colors: {
    primary: '#151515', // Dark Gray
    secondary: '#1E1E1E', // Slightly lighter dark gray
    text: '#FFFFFF', // Off-White
    textSecondary: '#B0B0B0', // Light gray
    accent: '#0069C9', // Electric Blue
    success: '#00D084', // Green
    warning: '#FFB800', // Orange
    error: '#FF6B6B', // Red
    background: '#0F0F0F', // Very dark background
    surface: '#1A1A1A', // Card surface
    border: '#2A2A2A', // Border color
    placeholder: '#666666', // Placeholder text
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 20,
    },
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
  },
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export type ThemeColors = keyof Theme['colors'];
export type ThemeSpacing = number;
export type ThemeTypography = keyof Theme['typography'];
export type ThemeBorderRadius = keyof Theme['borderRadius'];
export type ThemeShadows = keyof Theme['shadows'];
