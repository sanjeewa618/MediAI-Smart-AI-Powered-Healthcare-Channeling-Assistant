import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Platform, Image, Switch
} from 'react-native';
import {
  ChevronLeft, Bell, Edit2, Camera, Mail, Phone,
  MapPin, Calendar, Award, Clock, Shield, ChevronRight,
  Star, Activity, FileText, LogOut, Settings, User
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';

const PROFILE_DATA = {
  name: 'Sarah Mendis',
  role: 'Senior Lab Nurse',
  department: 'Hematology & Pathology',
  employeeId: 'NUR-2021-0047',
  email: 'sarah.mendis@cityhospital.lk',
  phone: '+94 77 123 4567',
  address: 'City Hospital, Colombo 07',
  joined: 'March 15, 2021',
  shift: '08:00 AM – 04:00 PM',
  photo: 'https://img.icons8.com/bubbles/200/000000/user-female.png',
  rating: 4.8,
  totalTests: 1284,
  completedThisMonth: 48,
  certifications: ['BMLS Certified', 'Phlebotomy Expert', 'BLS Certified'],
};

const STATS = [
  { label: 'Tests Done', value: '1,284', icon: Activity, color: COLORS.primary },
  { label: 'This Month', value: '48', icon: Calendar, color: '#10B981' },
  { label: 'Accuracy', value: '99.2%', icon: Shield, color: '#6366F1' },
  { label: 'Rating', value: '4.8★', icon: Star, color: '#F59E0B' },
];

const MENU_ITEMS = [
  { icon: FileText, label: 'My Reports', sublabel: 'View submitted reports', color: COLORS.primary, bg: COLORS.primaryLight, screen: 'LabReports' },
  { icon: Calendar, label: 'My Schedule', sublabel: 'Manage shift schedules', color: '#10B981', bg: '#ECFDF5', screen: 'LabScheduling' },
  { icon: Settings, label: 'Account Settings', sublabel: 'Notifications & preferences', color: '#6366F1', bg: '#EEF2FF', screen: null },
  { icon: Award, label: 'Certifications', sublabel: '3 active certifications', color: '#F59E0B', bg: '#FEF9C3', screen: null },
  { icon: Shield, label: 'Privacy & Security', sublabel: 'Password and 2FA', color: '#EF4444', bg: '#FEE2E2', screen: null },
];

const LabProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [onDuty, setOnDuty] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header Gradient */}
        <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Bell size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: PROFILE_DATA.photo }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraBtn}>
                <Camera size={16} color="#FFF" />
              </TouchableOpacity>
              {onDuty && <View style={styles.onDutyDot} />}
            </View>
            <Text style={styles.profileName}>{PROFILE_DATA.name}</Text>
            <Text style={styles.profileRole}>{PROFILE_DATA.role}</Text>
            <View style={styles.deptBadge}>
              <Text style={styles.deptBadgeText}>{PROFILE_DATA.department}</Text>
            </View>

            {/* On Duty Toggle */}
            <View style={styles.dutyToggle}>
              <Text style={styles.dutyLabel}>{onDuty ? '🟢 On Duty' : '⚪ Off Duty'}</Text>
              <Switch
                value={onDuty}
                onValueChange={setOnDuty}
                trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#10B981' }}
                thumbColor="#FFF"
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {STATS.map((stat, idx) => (
            <View key={idx} style={[styles.statCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }]}>
              <View style={[styles.statIconBox, { backgroundColor: stat.color + '18' }]}>
                <stat.icon size={16} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }]}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.infoCardTitle}>Personal Information</Text>
            <TouchableOpacity style={styles.editBtn}>
              <Edit2 size={14} color={COLORS.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {[
            { icon: Mail, label: 'Email', value: PROFILE_DATA.email, color: COLORS.primary },
            { icon: Phone, label: 'Phone', value: PROFILE_DATA.phone, color: '#10B981' },
            { icon: MapPin, label: 'Location', value: PROFILE_DATA.address, color: '#6366F1' },
            { icon: Calendar, label: 'Joined', value: PROFILE_DATA.joined, color: '#F59E0B' },
            { icon: Clock, label: 'Shift', value: PROFILE_DATA.shift, color: '#EF4444' },
            { icon: User, label: 'Employee ID', value: PROFILE_DATA.employeeId, color: '#0EA5E9' },
          ].map((item, idx) => (
            <View key={idx} style={styles.infoRow}>
              <View style={[styles.infoIconBox, { backgroundColor: item.color + '15' }]}>
                <item.icon size={15} color={item.color} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Certifications */}
        <View style={[styles.certCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }]}>
          <Text style={styles.certTitle}>Certifications</Text>
          <View style={styles.certList}>
            {PROFILE_DATA.certifications.map((cert, idx) => (
              <View key={idx} style={styles.certBadge}>
                <Award size={12} color={COLORS.primary} />
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Notifications Toggle */}
        <View style={[styles.infoCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Push Notifications</Text>
              <Text style={styles.toggleSub}>Receive alerts for new tests & updates</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }]}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.menuItem, idx < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                <item.icon size={18} color={item.color} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSublabel}>{item.sublabel}</Text>
              </View>
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace('SignIn', { role: 'nurse' })}
        >
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.2 (Beta)</Text>
        <View style={{ height: 20 }} />
      </ScrollView>

      <NurseBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 120 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 36,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  avatarSection: { alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: { width: 100, height: 100, borderRadius: 30, borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },
  cameraBtn: { position: 'absolute', bottom: -4, right: -4, width: 30, height: 30, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  onDutyDot: { position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFF' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  profileRole: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },
  deptBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  deptBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  dutyToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  dutyLabel: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  statCard: { backgroundColor: '#FFF', padding: 14, borderRadius: 20, width: '47%', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  statIconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textHeader },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  infoCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  infoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  infoCardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textHeader },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  editBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: 14, color: COLORS.textHeader, fontWeight: '700', marginTop: 2 },
  certCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  certTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textHeader, marginBottom: 14 },
  certList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  certBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
  certText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textHeader },
  toggleSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  menuCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 16, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIconBox: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textHeader },
  menuSublabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, marginTop: 16, paddingVertical: 16, borderRadius: 20, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { fontSize: 16, fontWeight: '800', color: '#EF4444' },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, marginTop: 16 },
});

export default LabProfileScreen;
