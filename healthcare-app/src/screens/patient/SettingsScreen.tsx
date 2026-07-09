import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Image, Platform, SafeAreaView, StatusBar,
  InteractionManager, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft, ChevronRight, User, Bell, Palette, Globe,
  Shield, Hospital, CreditCard, Eye, HeartPulse,
  HelpCircle, MessageSquare, Info, LogOut, Moon,
  Fingerprint, Lock, Phone, Mail, Camera, Wallet, TestTube,
  Stethoscope, Volume2, Contrast, Type, Star,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import BottomNavBar from '../../components/BottomNavBar';

// ─── Types ──────────────────────────────────────────────────
type SettingRowProps = {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  sub?: string;
  toggle?: boolean;
  value?: boolean;
  onChange?: (v: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
};

// ─── Reusable Row ───────────────────────────────────────────
const SettingRow = ({
  icon: Icon, iconBg, iconColor, label, sub,
  toggle, value, onChange, onPress, danger,
}: SettingRowProps) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={toggle ? 1 : 0.7}
    disabled={toggle && !onPress}
  >
    <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
      <Icon size={18} color={iconColor} />
    </View>
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, danger && { color: '#EF4444' }]}>{label}</Text>
      {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
    </View>
    {toggle ? (
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E5E7EB', true: COLORS.primary + '88' }}
        thumbColor={value ? COLORS.primary : '#D1D5DB'}
      />
    ) : (
      <ChevronRight size={16} color={danger ? '#EF4444' : '#D1D5DB'} />
    )}
  </TouchableOpacity>
);

// ─── Section Card ────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={[styles.sectionCard, SHADOWS.small]}>{children}</View>
  </View>
);

// ─── Main Component ──────────────────────────────────────────
const SettingsScreen = ({ navigation }: any) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

  const [notifAppt, setNotifAppt] = useState(true);
  const [notifLab, setNotifLab] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceAssist, setVoiceAssist] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <LinearGradient colors={COLORS.screenHeaderGradient} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {!isReady ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ── Profile Card ────────────────────────────────── */}
        <TouchableOpacity style={[styles.profileCard, SHADOWS.medium]} activeOpacity={0.85}>
          <Image source={require('../../../assets/signup-image2.png')} style={styles.profileAvatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sarah Johnson</Text>
            <Text style={styles.profileId}>Patient ID: P10231</Text>
            <View style={styles.profileBadge}>
              <Star size={11} color="#FFD700" fill="#FFD700" />
              <Text style={styles.profileBadgeText}>Premium Member</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ── Account ─────────────────────────────────────── */}
        <Section title="Account">
          <SettingRow icon={User} iconBg="#F3F0FF" iconColor={COLORS.primary} label="Personal Information" sub="Name, DOB, Blood type" />
          <View style={styles.divider} />
          <SettingRow icon={Phone} iconBg="#E0F2FE" iconColor="#0EA5E9" label="Phone Number" sub="+94 77 123 4567" />
          <View style={styles.divider} />
          <SettingRow icon={Mail} iconBg="#ECFDF5" iconColor="#10B981" label="Email Address" sub="sarah.j@example.com" />
          <View style={styles.divider} />
          <SettingRow icon={Camera} iconBg="#FFF7ED" iconColor="#F97316" label="Change Profile Photo" />
          <View style={styles.divider} />
          <SettingRow icon={Lock} iconBg="#FDF2F8" iconColor="#DB2777" label="Change Password" />
        </Section>

        {/* ── Notifications ────────────────────────────────── */}
        <Section title="Notifications">
          <SettingRow icon={Bell} iconBg="#F3F0FF" iconColor={COLORS.primary} label="Appointment Reminders"
            toggle value={notifAppt} onChange={setNotifAppt} />
          <View style={styles.divider} />
          <SettingRow icon={TestTube} iconBg="#ECFDF5" iconColor="#10B981" label="Lab Result Alerts"
            toggle value={notifLab} onChange={setNotifLab} />
          <View style={styles.divider} />
          <SettingRow icon={Phone} iconBg="#E0F2FE" iconColor="#0EA5E9" label="SMS Notifications"
            toggle value={notifSMS} onChange={setNotifSMS} />
          <View style={styles.divider} />
          <SettingRow icon={Mail} iconBg="#FFF7ED" iconColor="#F97316" label="Email Notifications"
            toggle value={notifEmail} onChange={setNotifEmail} />
          <View style={styles.divider} />
          <SettingRow icon={Star} iconBg="#FFFBEB" iconColor="#EAB308" label="Promotions & Offers"
            toggle value={notifPromo} onChange={setNotifPromo} />
        </Section>

        {/* ── Appearance ───────────────────────────────────── */}
        <Section title="Appearance">
          <SettingRow icon={Moon} iconBg="#1F2937" iconColor="#A78BFA" label="Dark Mode"
            toggle value={darkMode} onChange={setDarkMode} />
          <View style={styles.divider} />
          <SettingRow icon={Palette} iconBg="#FDF2F8" iconColor="#DB2777" label="Theme Color" sub="Purple (Default)" />
          <View style={styles.divider} />
          <SettingRow icon={Type} iconBg="#F0FDF4" iconColor="#22C55E" label="Font Size" sub="Medium" />
        </Section>

        {/* ── Language ─────────────────────────────────────── */}
        <Section title="Language">
          <SettingRow icon={Globe} iconBg="#E0F2FE" iconColor="#0EA5E9" label="App Language" sub="English (Default)" />
        </Section>

        {/* ── Healthcare Preferences ───────────────────────── */}
        <Section title="Healthcare Preferences">
          <SettingRow icon={Hospital} iconBg="#FFF7ED" iconColor="#F97316" label="Preferred Hospital" sub="Not set" />
          <View style={styles.divider} />
          <SettingRow icon={Stethoscope} iconBg="#F3F0FF" iconColor={COLORS.primary} label="Preferred Doctor" sub="Not set" />
          <View style={styles.divider} />
          <SettingRow icon={TestTube} iconBg="#ECFDF5" iconColor="#10B981" label="Preferred Lab" sub="Not set" />
          <View style={styles.divider} />
          <SettingRow icon={Eye} iconBg="#F1F5F9" iconColor="#64748B" label="Medical Record Visibility" sub="Doctors Only" />
        </Section>

        {/* ── Privacy & Security ───────────────────────────── */}
        <Section title="Privacy & Security">
          <SettingRow icon={Fingerprint} iconBg="#F3F0FF" iconColor={COLORS.primary} label="Biometric Login"
            toggle value={biometric} onChange={setBiometric} />
          <View style={styles.divider} />
          <SettingRow icon={Shield} iconBg="#ECFDF5" iconColor="#10B981" label="Two-Factor Authentication"
            toggle value={twoFA} onChange={setTwoFA} />
          <View style={styles.divider} />
          <SettingRow icon={Eye} iconBg="#E0F2FE" iconColor="#0EA5E9" label="Privacy Policy" />
        </Section>

        {/* ── Payment ──────────────────────────────────────── */}
        <Section title="Payment Settings">
          <SettingRow icon={CreditCard} iconBg="#ECFDF5" iconColor="#10B981" label="Saved Cards" sub="2 cards saved" />
          <View style={styles.divider} />
          <SettingRow icon={Wallet} iconBg="#FFF7ED" iconColor="#F97316" label="Billing History" />
          <View style={styles.divider} />
          <SettingRow icon={Shield} iconBg="#F3F0FF" iconColor={COLORS.primary} label="Insurance Details" />
        </Section>

        {/* ── Accessibility ────────────────────────────────── */}
        <Section title="Accessibility">
          <SettingRow icon={Type} iconBg="#F0FDF4" iconColor="#22C55E" label="Large Text"
            toggle value={largeText} onChange={setLargeText} />
          <View style={styles.divider} />
          <SettingRow icon={Volume2} iconBg="#E0F2FE" iconColor="#0EA5E9" label="Voice Assistance"
            toggle value={voiceAssist} onChange={setVoiceAssist} />
          <View style={styles.divider} />
          <SettingRow icon={Contrast} iconBg="#1F2937" iconColor="#F8FAFC" label="High Contrast Mode"
            toggle value={highContrast} onChange={setHighContrast} />
        </Section>

        {/* ── Support ──────────────────────────────────────── */}
        <Section title="Support">
          <SettingRow icon={HelpCircle} iconBg="#E0F2FE" iconColor="#0EA5E9" label="Help Center" />
          <View style={styles.divider} />
          <SettingRow icon={MessageSquare} iconBg="#F3F0FF" iconColor={COLORS.primary} label="Contact Us" />
          <View style={styles.divider} />
          <SettingRow icon={Info} iconBg="#FFF7ED" iconColor="#F97316" label="FAQ" />
          <View style={styles.divider} />
          <SettingRow icon={MessageSquare} iconBg="#FEF2F2" iconColor="#EF4444" label="Report a Problem" />
          <View style={styles.divider} />
          <SettingRow icon={Star} iconBg="#FFFBEB" iconColor="#EAB308" label="Send Feedback" />
        </Section>

        {/* ── About ────────────────────────────────────────── */}
        <Section title="About">
          <SettingRow icon={Info} iconBg="#F3F0FF" iconColor={COLORS.primary} label="App Version" sub="v1.0.2 (Beta)" />
          <View style={styles.divider} />
          <SettingRow icon={Eye} iconBg="#E0F2FE" iconColor="#0EA5E9" label="Terms & Conditions" />
          <View style={styles.divider} />
          <SettingRow icon={HeartPulse} iconBg="#FEF2F2" iconColor="#EF4444" label="About MediAI" />
        </Section>

        {/* ── Logout ───────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={[styles.sectionCard, SHADOWS.small]}>
            <SettingRow
              icon={LogOut} iconBg="#FEF2F2" iconColor="#EF4444"
              label="Logout"
              sub="Sign out of your account"
              danger
              onPress={() => navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn', params: { role: 'patient' } }],
              })}
            />
          </View>
        </View>

        <Text style={styles.versionFooter}>MediAI Healthcare • v1.0.2</Text>
      </ScrollView>
      )}

      <BottomNavBar />
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6FB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 58 : 48,
    paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 14 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },

  // Profile card
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 24, padding: 16,
    marginBottom: 24, gap: 14,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  profileAvatar: { width: 60, height: 60, borderRadius: 18, backgroundColor: '#F3F4F6' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '800', color: '#111827' },
  profileId: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  profileBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  profileBadgeText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
  editBtn: {
    backgroundColor: '#F3F0FF', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12,
  },
  editBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },

  // Row
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  rowSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F9FAFB', marginLeft: 66 },

  versionFooter: { textAlign: 'center', fontSize: 12, color: '#D1D5DB', marginTop: 8, marginBottom: 20 },
});

export default SettingsScreen;
