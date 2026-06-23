import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
  Image, Animated, StatusBar, Keyboard,
} from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import {
  Send, Mic, ChevronLeft, Sparkles, Brain, Shield,
  Clock, Stethoscope, ChevronRight, X,
} from 'lucide-react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Types ──────────────────────────────────────────────────────────────────
type Message = { id: number; text: string; sender: 'ai' | 'user' };

// ─── AI Feature highlights ───────────────────────────────────────────────────
const AI_FEATURES = [
  { icon: Brain,      color: '#8B3DFF', bg: '#F3F0FF', title: 'Symptom Analysis',   desc: 'Describe symptoms & get instant health insights' },
  { icon: Stethoscope,color: '#0EA5E9', bg: '#E0F2FE', title: 'Doctor Matching',     desc: 'Get matched with the right specialist' },
  { icon: Shield,     color: '#10B981', bg: '#ECFDF5', title: 'Safe & Private',      desc: 'Your health data stays 100% confidential' },
  { icon: Clock,      color: '#F97316', bg: '#FFF7ED', title: '24/7 Available',      desc: 'AI assistance anytime, day or night' },
];

// ─── Quick suggestion chips ───────────────────────────────────────────────────
const SUGGESTIONS = [
  '🤒  I have a fever',
  '😮‍💨  Breathing difficulty',
  '🤕  Headache since 2 days',
  '🫀  Chest pain',
  '🤢  Nausea & vomiting',
  '💊  Medicine side effects',
];

// ─── Simulated AI responses ───────────────────────────────────────────────────
const AI_RESPONSES: Record<string, string> = {
  default:
    "Thank you for sharing that. Based on what you've described, I'd recommend monitoring your symptoms closely. Would you like me to help you find the right specialist or book a lab test?",
  fever:
    "A fever can indicate an infection. Stay hydrated, rest, and take paracetamol if needed. If temperature exceeds 103°F / 39.4°C or lasts more than 3 days, please consult a doctor. Want me to find a GP near you?",
  chest:
    "Chest pain should not be ignored. It could range from muscle strain to a cardiac issue. Please seek medical attention immediately if it's severe or accompanied by shortness of breath. Shall I call emergency services?",
  headache:
    "Headaches lasting more than 2 days may be tension headaches or migraines. Ensure you're hydrated and well-rested. I can help you book an appointment with a neurologist if needed.",
} as const;

const getAiResponse = (text: string): string => {
  const lower = text.toLowerCase();
  if (lower.includes('fever') || lower.includes('temperature'))
    return "A fever can indicate an infection. Stay hydrated, rest, and take paracetamol if needed. If temperature exceeds 103°F / 39.4°C or lasts more than 3 days, please consult a doctor. Want me to find a GP near you?";
  if (lower.includes('chest'))
    return "Chest pain should not be ignored. It could range from muscle strain to a cardiac issue. Please seek medical attention immediately if it's severe or accompanied by shortness of breath. Shall I call emergency services?";
  if (lower.includes('head'))
    return "Headaches lasting more than 2 days may be tension headaches or migraines. Ensure you're hydrated and well-rested. I can help you book an appointment with a neurologist if needed.";
  return "Thank you for sharing that. Based on what you've described, I'd recommend monitoring your symptoms closely. Would you like me to help you find the right specialist or book a lab test?";
};

// ─── Component ───────────────────────────────────────────────────────────────
const AIHealthAssistantScreen = ({ navigation }: any) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Hi! I'm MediAI, your personal health assistant powered by AI.\n\nTell me how you're feeling or pick a quick option below — I'll help you understand your symptoms and find the right care.",
      sender: 'ai',
    },
  ]);
  const [input, setInput]           = useState('');
  const [isTyping, setIsTyping]     = useState(false);
  const [showFeatures, setShowFeatures] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const typingDot = useRef(new Animated.Value(0)).current;

  // Show/hide bottom nav with keyboard
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Typing indicator animation
  useEffect(() => {
    if (!isTyping) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(typingDot, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(typingDot, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), text: text.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setShowFeatures(false);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: getAiResponse(text), sender: 'ai' },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1400);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >

        {/* ── Header ─────────────────────────────────────────────── */}
        <LinearGradient colors={COLORS.screenHeaderGradient} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={26} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.aiAvatarSmall}>
              <Image source={require('../../../assets/bot2.jpg')} style={styles.avatarImg} />
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.headerTitle}>MediAI Assistant</Text>
              <Text style={styles.headerSub}>● Online · Powered by AI</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerIconBtn}>
            <Sparkles size={20} color="#FFD700" fill="#FFD700" />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Chat Area ──────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >

          {/* AI Feature highlight cards (shown only at start) */}
          {showFeatures && (
            <View style={styles.featuresSection}>
              <Text style={styles.featuresHeading}>✨ What I can do for you</Text>
              <View style={styles.featuresGrid}>
                {AI_FEATURES.map((f, i) => (
                  <View key={i} style={[styles.featureCard, SHADOWS.small]}>
                    <View style={[styles.featureIconWrap, { backgroundColor: f.bg }]}>
                      <f.icon size={20} color={f.color} />
                    </View>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Messages */}
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[styles.msgRow, msg.sender === 'user' ? styles.userRow : styles.aiRow]}
            >
              {msg.sender === 'ai' && (
                <View style={styles.aiBotAvatar}>
                  <Image source={require('../../../assets/bot2.jpg')} style={styles.botAvatarImg} />
                </View>
              )}
              <View style={[
                styles.bubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                SHADOWS.small,
              ]}>
                <Text style={msg.sender === 'user' ? styles.userBubbleText : styles.aiBubbleText}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <View style={[styles.msgRow, styles.aiRow]}>
              <View style={styles.aiBotAvatar}>
                <Image source={require('../../../assets/bot2.jpg')} style={styles.botAvatarImg} />
              </View>
              <View style={[styles.bubble, styles.aiBubble, SHADOWS.small]}>
                <Animated.Text style={[styles.typingText, { opacity: typingDot }]}>
                  MediAI is thinking...
                </Animated.Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Quick Suggestion Chips ─────────────────────────────── */}
        {showFeatures && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
          >
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity key={i} style={styles.chip} onPress={() => sendMessage(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Input Bar ──────────────────────────────────────────── */}
        <View style={styles.inputBar}>
            <TouchableOpacity style={styles.micBtn}>
              <Mic size={22} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Describe your symptoms…"
                placeholderTextColor="#9CA3AF"
                value={input}
                onChangeText={setInput}
                multiline
                onSubmitEditing={() => sendMessage(input)}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim()}
            >
              <LinearGradient colors={['#8B3DFF', '#5F0FFF']} style={styles.sendGradient}>
                <Send size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

        {!keyboardVisible && <BottomNavBar />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6FB' },
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 58 : 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 14,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiAvatarSmall: { position: 'relative' },
  avatarImg: { width: 40, height: 40, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2, borderColor: '#7C3AED',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  headerIconBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Chat
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 20 },

  // Feature cards
  featuresSection: { marginBottom: 20 },
  featuresHeading: { fontSize: 15, fontWeight: '800', color: '#1F2937', marginBottom: 14 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featureIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureTitle:    { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 4 },
  featureDesc:     { fontSize: 11, color: '#6B7280', lineHeight: 16 },

  // Messages
  msgRow:   { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  aiRow:    { justifyContent: 'flex-start' },
  userRow:  { justifyContent: 'flex-end' },
  aiBotAvatar: {
    width: 34, height: 34, borderRadius: 12,
    overflow: 'hidden', marginRight: 8, backgroundColor: '#F3F0FF',
  },
  botAvatarImg: { width: '100%', height: '100%' },
  bubble: { maxWidth: '75%', padding: 14, borderRadius: 20 },
  aiBubble:  { backgroundColor: '#FFF', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  aiBubbleText:  { fontSize: 14, color: '#1F2937', lineHeight: 22 },
  userBubbleText: { fontSize: 14, color: '#FFF', lineHeight: 22 },
  typingText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },

  // Chips
  chipsScroll: { maxHeight: 54 },
  chipsContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
  },
  micBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#F3F0FF',
    alignItems: 'center', justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  textInput: { fontSize: 14, color: '#1F2937' },
  sendBtn:   { borderRadius: 14, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.4 },
  sendGradient: {
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 14,
  },
});

export default AIHealthAssistantScreen;
