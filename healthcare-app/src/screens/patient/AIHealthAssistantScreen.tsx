import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { ArrowLeft, Send, Bot, User, Mic } from 'lucide-react-native';

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.textHeader} />
        </TouchableOpacity>
        <View style={styles.assistantInfo}>
          <View style={styles.aiIcon}>
            <Bot size={20} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.aiName}>MediAI Assistant</Text>
            <Text style={styles.aiStatus}>Online • AI powered</Text>
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  assistantInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 16 },
  aiIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  aiName: { fontSize: 16, fontWeight: '700', color: COLORS.textHeader },
  aiStatus: { fontSize: 12, color: '#4ADE80', fontWeight: '600' },
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
