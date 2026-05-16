import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { Send, Bot, User, Mic, ChevronLeft } from 'lucide-react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';

const AIHealthAssistantScreen = ({ navigation }: any) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your MediAI Assistant. How can I help you with your health today?", sender: 'ai' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages([...messages, userMsg]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Based on your symptoms, I recommend staying hydrated and monitoring your temperature. Would you like me to find a GP for you?", 
        sender: 'ai' 
      }]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <LinearGradient colors={['#8B3DFF', '#5F0FFF']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={28} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>AI Health Assistant</Text>
              <Text style={styles.headerSub}>Your personal health advisor</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.chatContainer}>
          {messages.map((msg) => (
            <View key={msg.id} style={[
              styles.messageWrapper, 
              msg.sender === 'user' ? styles.userWrapper : styles.aiWrapper
            ]}>
              <View style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
                SHADOWS.small
              ]}>
                <Text style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userText : styles.aiText
                ]}>{msg.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={100}
        >
          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.micBtn}>
              <Mic size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                placeholder="Type your symptoms..." 
                value={input}
                onChangeText={setInput}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                <Send size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  wrapper: { flex: 1 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  chatContainer: { padding: 20, paddingBottom: 40 },
  messageWrapper: { marginBottom: 20, maxWidth: '80%' },
  userWrapper: { alignSelf: 'flex-end' },
  aiWrapper: { alignSelf: 'flex-start' },
  messageBubble: { padding: 16, borderRadius: 20 },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: COLORS.white },
  aiText: { color: COLORS.textHeader },
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  micBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 24, paddingLeft: 16, paddingRight: 6 },
  input: { flex: 1, height: 48, color: COLORS.textHeader },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }
});

export default AIHealthAssistantScreen;
