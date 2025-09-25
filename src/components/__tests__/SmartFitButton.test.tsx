import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SmartFitButton } from '../SmartFitButton';

describe('SmartFitButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with title', () => {
      const { getByText } = render(
        <SmartFitButton title="Test Button" onPress={mockOnPress} />
      );
      
      expect(getByText('Test Button')).toBeTruthy();
    });

    it('should render with loading state', () => {
      const { getByTestId } = render(
        <SmartFitButton 
          title="Test Button" 
          onPress={mockOnPress} 
          loading={true} 
        />
      );
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should render as disabled', () => {
      const { getByText } = render(
        <SmartFitButton 
          title="Test Button" 
          onPress={mockOnPress} 
          disabled={true} 
        />
      );
      
      const button = getByText('Test Button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('variants', () => {
    it('should render primary variant', () => {
      const { getByText } = render(
        <SmartFitButton 
          title="Primary Button" 
          onPress={mockOnPress} 
          variant="primary" 
        />
      );
      
      expect(getByText('Primary Button')).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByText } = render(
        <SmartFitButton 
          title="Secondary Button" 
          onPress={mockOnPress} 
          variant="secondary" 
        />
      );
      
      expect(getByText('Secondary Button')).toBeTruthy();
    });

    it('should render outline variant', () => {
      const { getByText } = render(
        <SmartFitButton 
          title="Outline Button" 
          onPress={mockOnPress} 
          variant="outline" 
        />
      );
      
      expect(getByText('Outline Button')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('should render small size', () => {
      const { getByText } = render(
        <SmartFitButton 
          title="Small Button" 
          onPress={mockOnPress} 
          size="small" 
        />
      );
      
      expect(getByText('Small Button')).toBeTruthy();
    });

    it('should render medium size', () => {
      const { getByText } = render(
        <SmartFitButton 
          title="Medium Button" 
          onPress={mockOnPress} 
          size="medium" 
        />
      );
      
      expect(getByText('Medium Button')).toBeTruthy();
    });

    it('should render large size', () => {
      const { getByText } = render(
        <SmartFitButton 
          title="Large Button" 
          onPress={mockOnPress} 
          size="large" 
        />
      );
      
      expect(getByText('Large Button')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPress when pressed', () => {
      const { getByText } = render(
        <SmartFitButton title="Test Button" onPress={mockOnPress} />
      );
      
      fireEvent.press(getByText('Test Button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const { getByText } = render(
        <SmartFitButton 
          title="Test Button" 
          onPress={mockOnPress} 
          disabled={true} 
        />
      );
      
      fireEvent.press(getByText('Test Button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const { getByText } = render(
        <SmartFitButton 
          title="Test Button" 
          onPress={mockOnPress} 
          loading={true} 
        />
      );
      
      fireEvent.press(getByText('Test Button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have correct accessibility label', () => {
      const { getByLabelText } = render(
        <SmartFitButton title="Test Button" onPress={mockOnPress} />
      );
      
      expect(getByLabelText('Test Button')).toBeTruthy();
    });

    it('should have correct accessibility state when disabled', () => {
      const { getByText } = render(
        <SmartFitButton 
          title="Test Button" 
          onPress={mockOnPress} 
          disabled={true} 
        />
      );
      
      const button = getByText('Test Button');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });
  });
});
