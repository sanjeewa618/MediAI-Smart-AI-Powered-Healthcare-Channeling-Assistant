import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  ArrowLeft, 
  Settings, 
  Shield, 
  Bell, 
  Brain, 
  Globe,
  Save,
  Database,
  Lock
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const SettingsScreen = () => {
  const navigation = useNavigation<any>();

  // Platform State
  const [systemName, setSystemName] = useState('MediAI Smart Care Portal');
  const [contactInfo, setContactInfo] = useState('support@cityhospital.lk');
  
  // Notifications state
  const [emailNotify, setEmailNotify] = useState(true);
  const [smsNotify, setSmsNotify] = useState(false);

  // Security state
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes');
  const [pwPolicy, setPwPolicy] = useState('Strong (min 8 chars, alphanumeric + special)');

  // AI config state
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••');
  const [selectedModel, setSelectedModel] = useState('Gemini 1.5 Pro');

  const [modelDropdownVisible, setModelDropdownVisible] = useState(false);

  const handleSaveSettings = () => {
    Alert.alert(
      'Settings Saved',
      'All platform, security, notification, and AI engine settings have been updated.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
      {/* Top Header */}
      <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AdminDashboard')}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>System Settings</Text>
          <View style={{ width: 44 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
        
        {/* Section 1: Platform Settings */}
        <View style={styles.sectionHeaderRow}>
          <Globe size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Platform Settings</Text>
        </View>
        <View style={[styles.settingsGroupCard, SHADOWS.light]}>
          <Text style={styles.inputLabel}>System Name</Text>
          <TextInput 
            style={styles.textInput}
            value={systemName}
            onChangeText={setSystemName}
          />

          <Text style={styles.inputLabel}>Support Contact Email</Text>
          <TextInput 
            style={styles.textInput}
            value={contactInfo}
            onChangeText={setContactInfo}
            keyboardType="email-address"
          />
        </View>

        {/* Section 2: Notifications */}
        <View style={styles.sectionHeaderRow}>
          <Bell size={18} color="#EF4444" />
          <Text style={styles.sectionTitle}>Notification Settings</Text>
        </View>
        <View style={[styles.settingsGroupCard, SHADOWS.light]}>
          <View style={styles.switchRow}>
            <View style={styles.switchMeta}>
              <Text style={styles.switchLabel}>Email Alerts</Text>
              <Text style={styles.switchSub}>Send registration & report updates to admin</Text>
            </View>
            <Switch 
              value={emailNotify}
              onValueChange={setEmailNotify}
              trackColor={{ false: '#D1D5DB', true: COLORS.primaryLight }}
              thumbColor={emailNotify ? COLORS.primary : '#F3F4F6'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchMeta}>
              <Text style={styles.switchLabel}>SMS Verifications</Text>
              <Text style={styles.switchSub}>Notify admin of critical AI failures or SLMC requests</Text>
            </View>
            <Switch 
              value={smsNotify}
              onValueChange={setSmsNotify}
              trackColor={{ false: '#D1D5DB', true: COLORS.primaryLight }}
              thumbColor={smsNotify ? COLORS.primary : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Section 3: Security Policies */}
        <View style={styles.sectionHeaderRow}>
          <Shield size={18} color="#10B981" />
          <Text style={styles.sectionTitle}>Security Settings</Text>
        </View>
        <View style={[styles.settingsGroupCard, SHADOWS.light]}>
          <Text style={styles.inputLabel}>Session Timeout Duration</Text>
          <TextInput 
            style={styles.textInput}
            value={sessionTimeout}
            onChangeText={setSessionTimeout}
          />

          <Text style={styles.inputLabel}>Password Policy Type</Text>
          <TextInput 
            style={styles.textInput}
            value={pwPolicy}
            onChangeText={setPwPolicy}
          />
        </View>

        {/* Section 4: AI Engine Config */}
        <View style={styles.sectionHeaderRow}>
          <Brain size={18} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>AI Symptom Analyzer Settings</Text>
        </View>
        <View style={[styles.settingsGroupCard, SHADOWS.light]}>
          <Text style={styles.inputLabel}>OpenAI/Gemini Gateway API Key</Text>
          <TextInput 
            style={styles.textInput}
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
          />

          <Text style={styles.inputLabel}>Active AI Model Selection</Text>
          <TouchableOpacity 
            style={styles.dropdownTrigger}
            onPress={() => setModelDropdownVisible(!modelDropdownVisible)}
          >
            <Text style={styles.dropdownValue}>{selectedModel}</Text>
          </TouchableOpacity>

          {modelDropdownVisible && (
            <View style={styles.dropdownOptions}>
              {['Gemini 1.5 Pro (Recommended)', 'GPT-4o Gateway', 'Claude 3.5 Sonnet'].map((model) => (
                <TouchableOpacity 
                  key={model} 
                  style={[
                    styles.dropdownItem,
                    selectedModel === model.split(' ')[0] && styles.activeDropdownItem
                  ]}
                  onPress={() => {
                    setSelectedModel(model.split(' ')[0] || model);
                    setModelDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{model}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Save Settings Action */}
        <TouchableOpacity style={[styles.saveBtn, SHADOWS.medium]} onPress={handleSaveSettings}>
          <Save size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>Save System Config</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      </View>
      <AdminBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  wrapper: {
    flex: 1
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 30 : 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 20
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  settingsGroupCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEBFF',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textHeader,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchMeta: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  switchSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  dropdownTrigger: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  dropdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  dropdownOptions: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activeDropdownItem: {
    backgroundColor: COLORS.primaryLight,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default SettingsScreen;
