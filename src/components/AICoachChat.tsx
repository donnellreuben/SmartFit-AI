import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SmartFitCard } from './SmartFitCard';
import { theme } from '../constants/theme';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'workout_tip' | 'motivation' | 'form_correction';
}

export interface AICoachChatProps {
  onClose?: () => void;
  style?: any;
}

export const AICoachChat: React.FC<AICoachChatProps> = ({ onClose, style }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI fitness coach. I'm here to help you with workout questions, form tips, motivation, and any fitness advice you need. What can I help you with today?",
      isUser: false,
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText.trim());
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        type: aiResponse.type,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (
    userInput: string,
  ): { text: string; type: ChatMessage['type'] } => {
    const input = userInput.toLowerCase();

    // Workout questions
    if (input.includes('workout') || input.includes('exercise')) {
      return {
        text: 'Great question! Here are some effective workout tips:\n\n• Focus on compound movements like squats, deadlifts, and bench press\n• Progressive overload is key - gradually increase weight or reps\n• Rest 48-72 hours between muscle groups\n• Form is more important than weight\n\nWhat specific exercises are you working on?',
        type: 'workout_tip',
      };
    }

    // Form questions
    if (input.includes('form') || input.includes('technique')) {
      return {
        text: "Proper form is crucial for safety and results! Here's what to focus on:\n\n• Keep your core tight throughout movements\n• Control the weight - don't use momentum\n• Full range of motion is important\n• Breathe properly - exhale on exertion\n\nWould you like specific form tips for any exercise?",
        type: 'form_correction',
      };
    }

    // Motivation
    if (
      input.includes('motivation') ||
      input.includes('motivated') ||
      input.includes('tired')
    ) {
      return {
        text: "You've got this! 💪 Remember:\n\n• Every workout counts, even the tough ones\n• Progress isn't always linear - trust the process\n• You're stronger than you think\n• Consistency beats perfection\n\nWhat's your main fitness goal right now?",
        type: 'motivation',
      };
    }

    // Nutrition
    if (
      input.includes('nutrition') ||
      input.includes('diet') ||
      input.includes('food')
    ) {
      return {
        text: 'Nutrition is 70% of your fitness success! Here are some key points:\n\n• Eat 1g protein per pound of body weight\n• Stay hydrated - aim for 3-4 liters daily\n• Eat whole foods 80% of the time\n• Time your meals around workouts\n\nNeed specific nutrition advice for your goals?',
        type: 'text',
      };
    }

    // Default response
    return {
      text: "I'm here to help with your fitness journey! I can assist with:\n\n• Workout planning and exercise selection\n• Form and technique tips\n• Motivation and goal setting\n• Nutrition guidance\n• Recovery and rest advice\n\nWhat would you like to know more about?",
      type: 'text',
    };
  };

  const getMessageStyle = (message: ChatMessage) => {
    switch (message.type) {
      case 'workout_tip':
        return styles.workoutTipMessage;
      case 'motivation':
        return styles.motivationMessage;
      case 'form_correction':
        return styles.formMessage;
      default:
        return message.isUser ? styles.userMessage : styles.aiMessage;
    }
  };

  const getMessageIcon = (message: ChatMessage) => {
    if (message.isUser) return '👤';
    switch (message.type) {
      case 'workout_tip':
        return '💪';
      case 'motivation':
        return '🔥';
      case 'form_correction':
        return '📝';
      default:
        return '🤖';
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Coach</Text>
          <Text style={styles.headerSubtitle}>
            Your personal fitness assistant
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(message => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser
                ? styles.userMessageContainer
                : styles.aiMessageContainer,
            ]}
          >
            <View style={styles.messageHeader}>
              <Text style={styles.messageIcon}>{getMessageIcon(message)}</Text>
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <SmartFitCard style={getMessageStyle(message)}>
              <Text
                style={[
                  styles.messageText,
                  message.isUser
                    ? styles.userMessageText
                    : styles.aiMessageText,
                ]}
              >
                {message.text}
              </Text>
            </SmartFitCard>
          </View>
        ))}

        {isTyping && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>AI Coach is typing...</Text>
            <View style={styles.typingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask your AI coach anything..."
          placeholderTextColor={theme.colors.placeholder}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isTyping}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  messageContainer: {
    marginVertical: theme.spacing.sm,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  messageIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },
  messageTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  messageText: {
    ...theme.typography.body,
    lineHeight: 22,
  },
  userMessage: {
    backgroundColor: theme.colors.accent,
    maxWidth: '80%',
  },
  userMessageText: {
    color: theme.colors.text,
  },
  aiMessage: {
    backgroundColor: theme.colors.surface,
    maxWidth: '90%',
  },
  aiMessageText: {
    color: theme.colors.text,
  },
  workoutTipMessage: {
    backgroundColor: theme.colors.success,
    maxWidth: '90%',
  },
  motivationMessage: {
    backgroundColor: theme.colors.warning,
    maxWidth: '90%',
  },
  formMessage: {
    backgroundColor: theme.colors.accent,
    maxWidth: '90%',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  typingText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
  dot1: {
    // Animation delay handled in component logic
  },
  dot2: {
    // Animation delay handled in component logic
  },
  dot3: {
    // Animation delay handled in component logic
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.medium,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  sendButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});

export default AICoachChat;
