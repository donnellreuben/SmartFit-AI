import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SmartFitInput } from '../SmartFitInput';

describe('SmartFitInput', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with placeholder', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />,
      );

      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('should render with label', () => {
      const { getByText } = render(
        <SmartFitInput
          label="Test Label"
          value=""
          onChangeText={mockOnChangeText}
        />,
      );

      expect(getByText('Test Label')).toBeTruthy();
    });

    it('should render with error message', () => {
      const { getByText } = render(
        <SmartFitInput
          label="Test Label"
          value=""
          onChangeText={mockOnChangeText}
          error="This is an error"
        />,
      );

      expect(getByText('This is an error')).toBeTruthy();
    });
  });

  describe('input types', () => {
    it('should render text input', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />,
      );

      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('should render email input', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Enter email"
          value=""
          onChangeText={mockOnChangeText}
          type="email"
        />,
      );

      expect(getByPlaceholderText('Enter email')).toBeTruthy();
    });

    it('should render password input', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Enter password"
          value=""
          onChangeText={mockOnChangeText}
          type="password"
        />,
      );

      expect(getByPlaceholderText('Enter password')).toBeTruthy();
    });
  });

  describe('variants', () => {
    it('should render default variant', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
        />,
      );

      expect(getByPlaceholderText('Test input')).toBeTruthy();
    });

    it('should render outlined variant', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
          variant="outlined"
        />,
      );

      expect(getByPlaceholderText('Test input')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('should render small size', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
          size="small"
        />,
      );

      expect(getByPlaceholderText('Test input')).toBeTruthy();
    });

    it('should render medium size', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
          size="medium"
        />,
      );

      expect(getByPlaceholderText('Test input')).toBeTruthy();
    });

    it('should render large size', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
          size="large"
        />,
      );

      expect(getByPlaceholderText('Test input')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onChangeText when text changes', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
        />,
      );

      fireEvent.changeText(getByPlaceholderText('Test input'), 'new text');
      expect(mockOnChangeText).toHaveBeenCalledWith('new text');
    });

    it('should call onFocus when focused', () => {
      const mockOnFocus = jest.fn();
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
          onFocus={mockOnFocus}
        />,
      );

      fireEvent(getByPlaceholderText('Test input'), 'focus');
      expect(mockOnFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', () => {
      const mockOnBlur = jest.fn();
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
          onBlur={mockOnBlur}
        />,
      );

      fireEvent(getByPlaceholderText('Test input'), 'blur');
      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have correct accessibility label', () => {
      const { getByText } = render(
        <SmartFitInput
          label="Test Label"
          value=""
          onChangeText={mockOnChangeText}
        />,
      );

      expect(getByText('Test Label')).toBeTruthy();
    });

    it('should have correct accessibility hint', () => {
      const { getByPlaceholderText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
          accessibilityHint="Enter your text here"
        />,
      );

      const input = getByPlaceholderText('Test input');
      expect(input.props.accessibilityHint).toBe('Enter your text here');
    });
  });

  describe('icons', () => {
    it('should render with left icon', () => {
      const { getByText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
          leftIcon="search"
        />,
      );

      expect(getByText('search')).toBeTruthy();
    });

    it('should render with right icon', () => {
      const { getByText } = render(
        <SmartFitInput
          placeholder="Test input"
          value=""
          onChangeText={mockOnChangeText}
          rightIcon="eye"
        />,
      );

      expect(getByText('eye')).toBeTruthy();
    });
  });
});
