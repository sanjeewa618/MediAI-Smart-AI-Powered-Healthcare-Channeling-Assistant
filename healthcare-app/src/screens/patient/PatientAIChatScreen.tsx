import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
  Image, Animated, StatusBar, Keyboard,
} from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import {
  Send, ChevronLeft, FileText, Brain, ArrowRight
} from 'lucide-react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type Message = { id: number; text: string; sender: 'ai' | 'user' };

const PatientAIChatScreen = ({ navigation }: any) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Hi! I'm MediAI. I've analyzed your medical reports and history. What would you like to know about your test results or diagnoses?",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (response.ok && data.success) {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, text: data.data.reply, sender: 'ai' },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, text: data.message || "I'm sorry, I couldn't process your request.", sender: 'ai' },
        ]);
      }
    } catch (error) {
      setIsTyping(false);
      console.error('AI Chat Error:', error);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: "Sorry, I am having trouble connecting to the server.", sender: 'ai' },
      ]);
    }

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
              <View style={styles.iconContainer}>
                <Brain size={24} color={COLORS.primary} />
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Report Analyst AI</Text>
              <Text style={styles.headerSub}>● Online · MediAI</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Chat Area ──────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[styles.msgRow, msg.sender === 'user' ? styles.userRow : styles.aiRow]}
            >
              {msg.sender === 'ai' && (
                <View style={styles.aiBotAvatar}>
                  <Brain size={20} color={COLORS.primary} />
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
                 <Brain size={20} color={COLORS.primary} />
              </View>
              <View style={[styles.bubble, styles.aiBubble, SHADOWS.small]}>
                <Animated.Text style={[styles.typingText, { opacity: typingDot }]}>
                  Analyzing reports...
                </Animated.Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Input Bar ──────────────────────────────────────────── */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about your reports..."
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6FB' },
  container: { flex: 1 },
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
  iconContainer: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2, borderColor: '#7C3AED',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  headerSub:   { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 20 },
  msgRow:   { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  aiRow:    { justifyContent: 'flex-start' },
  userRow:  { justifyContent: 'flex-end' },
  aiBotAvatar: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, backgroundColor: '#FFF',
  },
  bubble: { maxWidth: '75%', padding: 14, borderRadius: 20 },
  aiBubble:  { backgroundColor: '#FFF', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  aiBubbleText:  { fontSize: 14, color: '#1F2937', lineHeight: 22 },
  userBubbleText: { fontSize: 14, color: '#FFF', lineHeight: 22 },
  typingText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 10,
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

export default PatientAIChatScreen;
