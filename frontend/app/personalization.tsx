import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useAudio } from './_layout';

export default function Personalization() {
  const router = useRouter();
  const { setUserName } = useUser();
  const { playPop, playClick } = useAudio();
  const [name, setName] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    Keyboard.dismiss();
    playPop();
    const finalName = name.trim() || 'Sehaj';
    setUserName(finalName);
    router.push('/origin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Ionicons name="sparkles" size={40} color="#FF6B9D" style={styles.icon} />

              <Text style={styles.prompt}>What should I call you?</Text>

              <Text style={styles.playfulText}>
                wife, Berryboo, poopypants,{'\n'}whatever your name is 💕
              </Text>

              <Text style={styles.hint}>(You can skip to continue as Sehaj)</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(text) => { if (text.length > name.length) playClick(); setName(text); }}
                  placeholder="Your name..."
                  placeholderTextColor="#C9A7C9"
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 60,
    paddingBottom: 60,
  },
  icon: {
    marginBottom: 30,
  },
  prompt: {
    fontSize: 28,
    fontWeight: '300',
    color: '#4A1942',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  playfulText: {
    fontSize: 15,
    color: '#FF6B9D',
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    color: '#9B7FA7',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD6E6',
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
    color: '#4A1942',
    textAlign: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
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
});
