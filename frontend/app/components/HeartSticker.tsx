import React from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeartStickerProps {
  imageUri: string;
  size?: number;
  style?: any;
}

export default function HeartSticker({ imageUri, size = 110, style }: HeartStickerProps) {
  const heartSize = size;
  
  return (
    <View style={[styles.container, { width: heartSize, height: heartSize }, style]}>
      {/* Background heart */}
      <Ionicons 
        name="heart" 
        size={heartSize} 
        color="#FF6B9D" 
        style={styles.heartBackground}
      />
      {/* Image clipped to heart shape */}
      <View style={[styles.imageContainer, { width: heartSize * 0.65, height: heartSize * 0.55, top: heartSize * 0.25, left: heartSize * 0.17 }]}>
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, { width: heartSize * 0.65, height: heartSize * 0.65 }]}
          resizeMode="cover"
        />
      </View>
      {/* Heart outline overlay */}
      <Ionicons 
        name="heart" 
        size={heartSize} 
        color="#FFFFFF" 
        style={[styles.heartOutline, { textShadowRadius: 3 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBackground: {
    position: 'absolute',
  },
  imageContainer: {
    position: 'absolute',
    borderRadius: 100,
    overflow: 'hidden',
  },
  image: {
    borderRadius: 100,
  },
  heartOutline: {
    position: 'absolute',
    opacity: 0,
  },
});
