import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  TextInput,
  Dimensions,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from './_layout';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemedBackground, ThemedCard } from '../src/components/themed';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Entry {
  id: string;
  text: string;
  date: string;
}

export default function HeartToHeart() {
  const router = useRouter();
  const { playClick, playSuccess, playMagic } = useAudio();
  const { colors, isDark } = useTheme();

  // Prabh's apologies
  const [prabhApology, setPrabhApology] = useState('');
  const [prabhEntries, setPrabhEntries] = useState<Entry[]>([]);
  const [expandedPrabh, setExpandedPrabh] = useState<string | null>(null);

  // Sehaj's apologies
  const [sehajApology, setSehajApology] = useState('');
  const [sehajEntries, setSehajEntries] = useState<Entry[]>([]);
  const [expandedSehaj, setExpandedSehaj] = useState<string | null>(null);

  // Repair promises
  const [promise, setPromise] = useState('');
  const [promises, setPromises] = useState<Entry[]>([]);

  // UI state
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'prabh' | 'sehaj' | 'promises'>('prabh');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const savedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadEntries();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadEntries = async () => {
    try {
      const prabh = await AsyncStorage.getItem('apologies_from_prabh');
      const sehaj = await AsyncStorage.getItem('apologies_from_sehaj');
      const repairPromises = await AsyncStorage.getItem('repair_promises');

      if (prabh) setPrabhEntries(JSON.parse(prabh));
      if (sehaj) setSehajEntries(JSON.parse(sehaj));
      if (repairPromises) setPromises(JSON.parse(repairPromises));
    } catch (error) {
      console.log('Error loading entries:', error);
    }
  };

  const showSavedConfirmation = () => {
    setShowSavedMessage(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSuccess();

    Animated.sequence([
      Animated.timing(savedAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(savedAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSavedMessage(false));
  };

  const savePrabhApology = async () => {
    if (!prabhApology.trim()) return;

    const newEntry: Entry = {
      id: Date.now().toString(),
      text: prabhApology.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updated = [newEntry, ...prabhEntries];
    setPrabhEntries(updated);
    setPrabhApology('');

    try {
      await AsyncStorage.setItem('apologies_from_prabh', JSON.stringify(updated));
      showSavedConfirmation();
    } catch (error) {
      console.log('Error saving:', error);
    }
  };

  const saveSehajApology = async () => {
    if (!sehajApology.trim()) return;

    const newEntry: Entry = {
      id: Date.now().toString(),
      text: sehajApology.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updated = [newEntry, ...sehajEntries];
    setSehajEntries(updated);
    setSehajApology('');

    try {
      await AsyncStorage.setItem('apologies_from_sehaj', JSON.stringify(updated));
      showSavedConfirmation();
    } catch (error) {
      console.log('Error saving:', error);
    }
  };

  const savePromise = async () => {
    if (!promise.trim()) return;

    const newEntry: Entry = {
      id: Date.now().toString(),
      text: promise.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    const updated = [newEntry, ...promises];
    setPromises(updated);
    setPromise('');

    try {
      await AsyncStorage.setItem('repair_promises', JSON.stringify(updated));
      showSavedConfirmation();
    } catch (error) {
      console.log('Error saving:', error);
    }
  };

  const deleteEntry = async (type: 'prabh' | 'sehaj' | 'promises', id: string) => {
    playClick();

    if (type === 'prabh') {
      const updated = prabhEntries.filter(e => e.id !== id);
      setPrabhEntries(updated);
      await AsyncStorage.setItem('apologies_from_prabh', JSON.stringify(updated));
    } else if (type === 'sehaj') {
      const updated = sehajEntries.filter(e => e.id !== id);
      setSehajEntries(updated);
      await AsyncStorage.setItem('apologies_from_sehaj', JSON.stringify(updated));
    } else {
      const updated = promises.filter(e => e.id !== id);
      setPromises(updated);
      await AsyncStorage.setItem('repair_promises', JSON.stringify(updated));
    }
  };

  const renderEntryCard = (entry: Entry, type: 'prabh' | 'sehaj' | 'promises', expanded: string | null, setExpanded: (id: string | null) => void) => {
    const isExpanded = expanded === entry.id;

    return (
      <TouchableOpacity
        key={entry.id}
        onPress={() => {
          playClick();
          setExpanded(isExpanded ? null : entry.id);
        }}
        activeOpacity={0.8}
      >
        <ThemedCard variant="glass" style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Text style={[styles.entryDate, { color: colors.textMuted }]}>{entry.date}</Text>
            <TouchableOpacity
              onPress={() => deleteEntry(type, entry.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text
            style={[styles.entryText, { color: colors.textPrimary }]}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {entry.text}
          </Text>
          {!isExpanded && entry.text.length > 80 && (
            <Text style={[styles.tapToExpand, { color: colors.primary }]}>Tap to read more</Text>
          )}
        </ThemedCard>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedBackground showFloatingElements={true}>
      <SafeAreaView style={styles.container}>
        {/* Saved Confirmation */}
        {showSavedMessage && (
          <Animated.View style={[styles.savedMessage, { opacity: savedAnim, backgroundColor: colors.primary }]}>
            <Ionicons name="heart" size={20} color="#FFFFFF" />
            <Text style={styles.savedText}>Thank you for trying 💕</Text>
          </Animated.View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => { playClick(); router.back(); }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Heart to Heart 💕</Text>

          <View style={{ width: 44 }} />
        </View>

        {/* Subtext */}
        <Text style={[styles.subtext, { color: colors.textSecondary }]}>A place for us to make things right.</Text>

        {/* Tab Selector */}
        <View style={[styles.tabContainer, { backgroundColor: colors.glass }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'prabh' && [styles.activeTab, { backgroundColor: colors.card }]]}
            onPress={() => { playClick(); setActiveTab('prabh'); }}
          >
            <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'prabh' && [styles.activeTabText, { color: colors.textPrimary }]]}>Prabh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sehaj' && [styles.activeTab, { backgroundColor: colors.card }]]}
            onPress={() => { playClick(); setActiveTab('sehaj'); }}
          >
            <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'sehaj' && [styles.activeTabText, { color: colors.textPrimary }]]}>Sehaj</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'promises' && [styles.activeTab, { backgroundColor: colors.card }]]}
            onPress={() => { playClick(); setActiveTab('promises'); }}
          >
            <Text style={[styles.tabText, { color: colors.textMuted }, activeTab === 'promises' && [styles.activeTabText, { color: colors.textPrimary }]]}>Promises</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Prabh's Section */}
            {activeTab === 'prabh' && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="heart" size={24} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>My Apology to You</Text>
                </View>

                <ThemedCard variant="glass" style={styles.textAreaCard}>
                  <TextInput
                    style={[styles.textArea, { color: colors.textPrimary }]}
                    placeholder="Write your apology here..."
                    placeholderTextColor={colors.textMuted}
                    value={prabhApology}
                    onChangeText={setPrabhApology}
                    multiline
                  />
                </ThemedCard>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, !prabhApology.trim() && styles.saveButtonDisabled]}
                  onPress={savePrabhApology}
                  disabled={!prabhApology.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {prabhEntries.length > 0 && (
                  <View style={styles.entriesContainer}>
                    <Text style={[styles.entriesLabel, { color: colors.textSecondary }]}>Previous entries</Text>
                    {prabhEntries.map(entry => renderEntryCard(entry, 'prabh', expandedPrabh, setExpandedPrabh))}
                  </View>
                )}
              </View>
            )}

            {/* Sehaj's Section */}
            {activeTab === 'sehaj' && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="heart" size={24} color={colors.secondary} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your Apology to Me</Text>
                </View>

                <ThemedCard variant="glass" style={styles.textAreaCard}>
                  <TextInput
                    style={[styles.textArea, { color: colors.textPrimary }]}
                    placeholder="Write your apology here..."
                    placeholderTextColor={colors.textMuted}
                    value={sehajApology}
                    onChangeText={setSehajApology}
                    multiline
                  />
                </ThemedCard>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.secondary, shadowColor: colors.secondary }, !sehajApology.trim() && styles.saveButtonDisabled]}
                  onPress={saveSehajApology}
                  disabled={!sehajApology.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {sehajEntries.length > 0 && (
                  <View style={styles.entriesContainer}>
                    <Text style={[styles.entriesLabel, { color: colors.textSecondary }]}>Previous entries</Text>
                    {sehajEntries.map(entry => renderEntryCard(entry, 'sehaj', expandedSehaj, setExpandedSehaj))}
                  </View>
                )}
              </View>
            )}

            {/* Promises Section */}
            {activeTab === 'promises' && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="ribbon" size={24} color={colors.tertiary} />
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>We Promise To...</Text>
                </View>

                <ThemedCard variant="glass" style={styles.textAreaCard}>
                  <TextInput
                    style={[styles.textArea, styles.shortTextArea, { color: colors.textPrimary }]}
                    placeholder="E.g., Listen before reacting..."
                    placeholderTextColor={colors.textMuted}
                    value={promise}
                    onChangeText={setPromise}
                  />
                </ThemedCard>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.tertiary, shadowColor: colors.tertiary }, !promise.trim() && styles.saveButtonDisabled]}
                  onPress={savePromise}
                  disabled={!promise.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Add Promise</Text>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {promises.length > 0 && (
                  <View style={styles.entriesContainer}>
                    <Text style={[styles.entriesLabel, { color: colors.textSecondary }]}>Our commitments</Text>
                    {promises.map(entry => (
                      <ThemedCard key={entry.id} variant="glass" style={styles.promiseCard}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.tertiary} />
                        <Text style={[styles.promiseText, { color: colors.textPrimary }]}>{entry.text}</Text>
                        <TouchableOpacity
                          onPress={() => deleteEntry('promises', entry.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="close" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                      </ThemedCard>
                    ))}
                  </View>
                )}
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  savedMessage: {
    position: 'absolute',
    top: 100,
    left: 40,
    right: 40,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  savedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  subtext: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  textAreaCard: {
    padding: 0,
    marginBottom: 12,
  },
  textArea: {
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  shortTextArea: {
    minHeight: 60,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    alignSelf: 'flex-end',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  entriesContainer: {
    marginTop: 24,
  },
  entriesLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  entryCard: {
    marginBottom: 10,
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  entryText: {
    fontSize: 15,
    lineHeight: 22,
  },
  tapToExpand: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  promiseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  promiseText: {
    flex: 1,
    fontSize: 15,
  },
});
