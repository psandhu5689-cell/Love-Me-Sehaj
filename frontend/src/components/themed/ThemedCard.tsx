import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface ThemedCardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'glow';
  glowColor?: string;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  style,
  variant = 'default',
  glowColor,
}) => {
  const { colors, isDark } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: isDark ? colors.card : colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
    };

    if (variant === 'glow') {
      return {
        ...baseStyle,
        shadowColor: glowColor || colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isDark ? 0.4 : 0.2,
        shadowRadius: 20,
        elevation: 10,
      };
    }

    if (variant === 'glass') {
      return {
        ...baseStyle,
        backgroundColor: colors.glass,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      };
    }

    return {
      ...baseStyle,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 12,
      elevation: 6,
    };
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

export default ThemedCard;
