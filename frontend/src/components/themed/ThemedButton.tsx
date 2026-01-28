import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import * as Haptics from 'expo-haptics';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  pulse?: boolean;
  style?: ViewStyle;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'right',
  disabled = false,
  pulse = false,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse && !disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulse, disabled]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 20, paddingVertical: 10, fontSize: 14, iconSize: 16 };
      case 'large':
        return { paddingHorizontal: 40, paddingVertical: 18, fontSize: 18, iconSize: 22 };
      default:
        return { paddingHorizontal: 32, paddingVertical: 14, fontSize: 16, iconSize: 20 };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderContent = () => {
    const textColor = variant === 'primary' || variant === 'secondary'
      ? '#FFFFFF'
      : variant === 'outline'
        ? colors.primary
        : colors.textSecondary;

    const iconColor = textColor;

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={sizeStyles.iconSize} color={iconColor} style={styles.iconLeft} />
        )}
        <Text style={[styles.text, { fontSize: sizeStyles.fontSize, color: textColor }]}>
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={sizeStyles.iconSize} color={iconColor} style={styles.iconRight} />
        )}
      </View>
    );
  };

  const buttonStyle: ViewStyle = {
    paddingHorizontal: sizeStyles.paddingHorizontal,
    paddingVertical: sizeStyles.paddingVertical,
    borderRadius: 30,
    opacity: disabled ? 0.5 : 1,
  };

  if (variant === 'primary') {
    return (
      <Animated.View style={[{ transform: [{ scale: Animated.multiply(pulseAnim, scaleAnim) }] }, style]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          disabled={disabled}
        >
          <LinearGradient
            colors={colors.gradientPrimary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              buttonStyle,
              styles.shadowPrimary,
              { shadowColor: colors.primary },
            ]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'secondary') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          disabled={disabled}
          style={[
            buttonStyle,
            { backgroundColor: colors.secondary },
            styles.shadowSecondary,
            { shadowColor: colors.secondary },
          ]}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'outline') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          disabled={disabled}
          style={[
            buttonStyle,
            {
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: colors.primary,
            },
          ]}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Ghost variant
  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.6}
        disabled={disabled}
        style={[buttonStyle, { backgroundColor: 'transparent' }]}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  shadowPrimary: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  shadowSecondary: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default ThemedButton;
