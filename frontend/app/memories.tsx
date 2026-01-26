import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from './_layout';

const { width } = Dimensions.get('window');

const STICKER_BATMAN = 'https://customer-assets.emergentagent.com/job_love-adventure-49/artifacts/ru45g92o_IMG_5369.jpeg';

interface Memory {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  content: string;
}

const MEMORIES: Memory[] = [
  {
    id: 'funny',
    title: 'Funny Memory',
    icon: 'happy',
    color: '#FFB347',
    content:
      "Remember getting eaten alive by mosquitoes? 🦟",
  },
  {
    id: 'sweet',
    title: 'Sweet Memory',
    icon: 'heart',
    color: '#FF6B9D',
    content:
      "Remember when you sat down with me to eat pepperoni pizza, and refused to eat until I did. 🍕",
  },
  {
    id: 'meaningful',
    title: 'Meaningful Memory',
    icon: 'star',
    color: '#9B59B6',
    content:
      "When you took me back to the Legos store. I know it's not that deep but to me it's really special. You fought and hit me over it but I still won at the end of the day. 🧱",
  },
];

export default function Memories() {
  const router = useRouter();
  const [viewedMemories, setViewedMemories] = useState<Set<string>>(new Set());
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(MEMORIES.map(() => new Animated.Value(0))).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      150,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      )
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const handleMemoryPress = (memory: Memory) => {
    setSelectedMemory(memory);
  };

  const handleCloseMemory = () => {
    if (selectedMemory) {
      setViewedMemories((prev) => new Set([...prev, selectedMemory.id]));
    }
    setSelectedMemory(null);
  };

  const allViewed = viewedMemories.size === MEMORIES.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Batman Sticker - Heart Shaped */}
      <Animated.View
        style={[
          styles.stickerContainer,
          {
            transform: [{ translateY: floatTranslate }, { rotate: '12deg' }],
          },
        ]}
      >
        <View style={styles.heartStickerWrapper}>
          <Ionicons name="heart" size={120} color="#333" style={styles.heartBg} />
          <Image
            source={{ uri: STICKER_BATMAN }}
            style={styles.stickerImage}
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.pageLabel}>Our Memories</Text>
        <Text style={styles.instruction}>Tap each card to explore</Text>

        <View style={styles.cardsContainer}>
          {MEMORIES.map((memory, index) => {
            const isViewed = viewedMemories.has(memory.id);
            return (
              <Animated.View
                key={memory.id}
                style={[
                  styles.cardWrapper,
                  {
                    opacity: cardAnims[index],
                    transform: [
                      {
                        scale: cardAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.memoryCard,
                    { borderColor: memory.color },
                    isViewed && styles.viewedCard,
                  ]}
                  onPress={() => handleMemoryPress(memory)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: memory.color + '20' },
                    ]}
                  >
                    <Ionicons
                      name={memory.icon}
                      size={36}
                      color={memory.color}
                    />
                  </View>
                  <Text style={styles.cardTitle}>{memory.title}</Text>
                  {isViewed && (
                    <View style={styles.checkBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#4CAF50"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {viewedMemories.size} of {MEMORIES.length} memories explored
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(viewedMemories.size / MEMORIES.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {allViewed && (
          <Animated.View style={styles.continueContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/word-hunt')}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      {/* Memory Detail Modal */}
      <Modal
        visible={!!selectedMemory}
        animationType="fade"
        transparent
        onRequestClose={handleCloseMemory}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMemory && (
              <>
                <View
                  style={[
                    styles.modalIconCircle,
                    { backgroundColor: selectedMemory.color + '20' },
                  ]}
                >
                  <Ionicons
                    name={selectedMemory.icon}
                    size={50}
                    color={selectedMemory.color}
                  />
                </View>
                <Text style={styles.modalTitle}>{selectedMemory.title}</Text>
                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.modalText}>{selectedMemory.content}</Text>
                </ScrollView>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: selectedMemory.color },
                  ]}
                  onPress={handleCloseMemory}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  pageLabel: {
    fontSize: 14,
    color: '#9B7FA7',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    color: '#6B5B6B',
    marginBottom: 32,
  },
  cardsContainer: {
    width: '100%',
    gap: 16,
  },
  cardWrapper: {
    width: '100%',
  },
  memoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  viewedCard: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#4A1942',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  progressContainer: {
    width: '100%',
    marginTop: 32,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#9B7FA7',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#FFE4EC',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B9D',
    borderRadius: 4,
  },
  continueContainer: {
    marginTop: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 25, 66, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A1942',
    marginBottom: 20,
  },
  modalScroll: {
    maxHeight: 200,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#5A4A5A',
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 24,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stickerContainer: {
    position: 'absolute',
    top: 50,
    right: 5,
    zIndex: 10,
  },
  heartStickerWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBg: {
    position: 'absolute',
  },
  stickerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginTop: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
