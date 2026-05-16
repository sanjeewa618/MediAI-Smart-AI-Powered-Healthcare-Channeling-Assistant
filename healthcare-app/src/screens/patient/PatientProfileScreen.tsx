import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import {
  ChevronLeft,
  Edit3,
  FileText,
  Calendar,
  Clock,
  Heart,
  Shield,
  Bell,
  Lock,
  Phone,
  Users,
  LogOut,
  ChevronRight,
  VerifiedIcon,
  Droplets,
  AlertTriangle,
  Pill,
  Ruler,
  Activity,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../../components/BottomNavBar';
import { COLORS, SHADOWS } from '../../theme/theme';

type PatientProfileNavProp = StackNavigationProp<RootStackParamList, 'PatientDashboard'>;

const PatientProfileScreen = () => {
  const navigation = useNavigation<PatientProfileNavProp>();
  const [appointmentReminder, setAppointmentReminder] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: () => {
          navigation.navigate('PatientDashboard');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#724CF9', '#5E3BEE']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={28} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>My Profile</Text>
              <Text style={styles.headerSub}>Medical Identity Dashboard</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Header Card */}
          <View style={[styles.profileCard, SHADOWS.medium]}>
            <View style={styles.profileHeader}>
              <Image
                source={require('../../../assets/robot-avatar.png')}
                style={styles.profilePhoto}
              />
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.patientName}>Sarah Johnson</Text>
                  <VerifiedIcon size={20} color="#10B981" fill="#10B981" />
                </View>
                <Text style={styles.patientId}>ID: MH-2024-08542</Text>
                <View style={styles.badgesRow}>
                  <View style={styles.ageBadge}>
                    <Text style={styles.badgeText}>28 y/o</Text>
                  </View>
                  <View style={styles.genderBadge}>
                    <Text style={styles.badgeText}>Female</Text>
                  </View>
                  <View style={styles.bloodBadge}>
                    <Text style={styles.bloodBadgeText}>O+</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.profileMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Member Since</Text>
                <Text style={styles.metaValue}>Jan 2023</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Completed</Text>
                <Text style={styles.metaValue}>85%</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Appointments</Text>
                <Text style={styles.metaValue}>12</Text>
              </View>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={[styles.quickActionBtn, SHADOWS.small]}>
              <Edit3 size={24} color={COLORS.primary} />
              <Text style={styles.quickActionLabel}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionBtn, SHADOWS.small]}>
              <FileText size={24} color={COLORS.primary} />
              <Text style={styles.quickActionLabel}>Medical Records</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionBtn, SHADOWS.small]}>
              <Pill size={24} color={COLORS.primary} />
              <Text style={styles.quickActionLabel}>Medications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionBtn, SHADOWS.small]}>
              <Activity size={24} color={COLORS.primary} />
              <Text style={styles.quickActionLabel}>Health Score</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <TouchableOpacity>
                <Edit3 size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.infoCard, SHADOWS.small]}>
              <InfoRow label="Full Name" value="Sarah Johnson" />
              <View style={styles.infoDivider} />
              <InfoRow label="NIC / Passport" value="XX****-****-1234" />
              <View style={styles.infoDivider} />
              <InfoRow label="Date of Birth" value="15 March 1996" />
              <View style={styles.infoDivider} />
              <InfoRow label="Gender" value="Female" />
              <View style={styles.infoDivider} />
              <InfoRow label="Mobile Number" value="+94 71 234 5678" />
              <View style={styles.infoDivider} />
              <InfoRow label="Email" value="sarah@email.com" />
              <View style={styles.infoDivider} />
              <InfoRow label="Address" value="123 Medical Lane, City" />
            </View>
          </View>

          {/* Medical Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              <TouchableOpacity>
                <Edit3 size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.medicalCard, SHADOWS.small]}>
              <View style={styles.medicalGrid}>
                <MedicalInfoItem icon={<Droplets size={20} color="#EF4444" />} label="Blood Group" value="O+" />
                <MedicalInfoItem
                  icon={<Ruler size={20} color="#3B82F6" />}
                  label="Height"
                  value="165 cm"
                />
                <MedicalInfoItem
                  icon={<Ruler size={20} color="#3B82F6" />}
                  label="Weight"
                  value="62 kg"
                />
                <MedicalInfoItem
                  icon={<Activity size={20} color="#8B5CF6" />}
                  label="BMI"
                  value="22.8"
                />
              </View>
              <View style={styles.medicalDivider} />
              <View style={styles.allergySection}>
                <View style={styles.allergyHeader}>
                  <AlertTriangle size={18} color="#F59E0B" />
                  <Text style={styles.allergyTitle}>Allergies</Text>
                </View>
                <View style={styles.allergyBadges}>
                  <View style={styles.allergyBadge}>
                    <Text style={styles.allergyText}>Penicillin</Text>
                  </View>
                  <View style={styles.allergyBadge}>
                    <Text style={styles.allergyText}>Peanuts</Text>
                  </View>
                </View>
              </View>
              <View style={styles.medicalDivider} />
              <View style={styles.chronicSection}>
                <View style={styles.chronicHeader}>
                  <Heart size={18} color="#EF4444" />
                  <Text style={styles.chronicTitle}>Chronic Conditions</Text>
                </View>
                <Text style={styles.noDataText}>No chronic conditions recorded</Text>
              </View>
              <View style={styles.medicalDivider} />
              <View style={styles.medicationsSection}>
                <View style={styles.medicationHeader}>
                  <Pill size={18} color={COLORS.primary} />
                  <Text style={styles.medicationTitle}>Current Medications</Text>
                </View>
                <View style={styles.medicationItem}>
                  <View style={styles.medicationDot} />
                  <Text style={styles.medicationName}>Vitamin D3 - 1000 IU daily</Text>
                </View>
                <View style={styles.medicationItem}>
                  <View style={styles.medicationDot} />
                  <Text style={styles.medicationName}>Multivitamin - Once daily</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Emergency Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
              <TouchableOpacity>
                <Edit3 size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.emergencyCard, SHADOWS.small]}>
              <View style={styles.emergencyContact}>
                <View style={styles.emergencyIcon}>
                  <Phone size={24} color="#FFF" />
                </View>
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyName}>Michael Johnson</Text>
                  <Text style={styles.emergencyRelation}>Brother</Text>
                </View>
                <TouchableOpacity style={styles.emergencyCallBtn}>
                  <Phone size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.emergencyPhone}>
                <Text style={styles.emergencyPhoneLabel}>Phone:</Text>
                <Text style={styles.emergencyPhoneValue}>+94 71 987 6543</Text>
              </View>
            </View>
          </View>

          {/* Insurance Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Insurance Information</Text>
              <TouchableOpacity>
                <Edit3 size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.insuranceCard, SHADOWS.small]}>
              <InfoRow label="Insurance Provider" value="National Health Insurance" />
              <View style={styles.infoDivider} />
              <InfoRow label="Policy Number" value="POL-2024-056789" />
              <View style={styles.infoDivider} />
              <InfoRow label="Coverage Type" value="Full Coverage" />
              <View style={styles.infoDivider} />
              <InfoRow label="Expiry Date" value="15 Dec 2025" />
              <TouchableOpacity style={styles.uploadInsuranceBtn}>
                <Text style={styles.uploadInsuranceBtnText}>Upload Insurance Card</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upcoming Appointments Shortcut */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <TouchableOpacity>
                <ChevronRight size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            {[
              {
                doctor: 'Dr. Emma Watson',
                hospital: 'City Hospital',
                date: '20 May 2024',
                time: '10:30 AM',
              },
            ].map((apt, idx) => (
              <View key={idx} style={[styles.appointmentShortcut, SHADOWS.small]}>
                <View style={styles.appointmentIcon}>
                  <Calendar size={24} color={COLORS.primary} />
                </View>
                <View style={styles.appointmentDetails}>
                  <Text style={styles.appointmentDoctor}>{apt.doctor}</Text>
                  <Text style={styles.appointmentHospital}>{apt.hospital}</Text>
                  <View style={styles.appointmentMeta}>
                    <Clock size={14} color="#9CA3AF" />
                    <Text style={styles.appointmentTime}>
                      {apt.date} at {apt.time}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.appointmentViewBtn}>
                  <Text style={styles.appointmentViewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Medical Reports Shortcut */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reports</Text>
              <TouchableOpacity>
                <ChevronRight size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            {[
              { title: 'Complete Blood Count', date: '12 May 2024', status: 'Ready' },
              { title: 'Chest X-Ray', date: '08 May 2024', status: 'Reviewed' },
            ].map((report, idx) => (
              <View key={idx} style={[styles.reportShortcut, SHADOWS.small]}>
                <View style={styles.reportIcon}>
                  <FileText size={24} color={COLORS.primary} />
                </View>
                <View style={styles.reportDetails}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDate}>{report.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: report.status === 'Ready' ? '#DCFCE7' : '#E9D5FF' }]}>
                  <Text style={[styles.statusBadgeText, { color: report.status === 'Ready' ? '#166534' : '#6B21A8' }]}>
                    {report.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* AI Health Assistant Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Health Insights</Text>
            <LinearGradient colors={['#815CFB', '#6737EA']} style={[styles.aiCard, SHADOWS.medium]}>
              <View style={styles.aiContent}>
                <View style={styles.healthScoreContainer}>
                  <Text style={styles.healthScoreLabel}>Overall Health Score</Text>
                  <Text style={styles.healthScore}>82/100</Text>
                  <View style={styles.scoreBar}>
                    <View style={[styles.scoreBarFill, { width: '82%' }]} />
                  </View>
                </View>
                <View style={styles.aiDivider} />
                <View style={styles.aiRecommendations}>
                  <Text style={styles.aiRecTitle}>Daily Recommendations</Text>
                  <View style={styles.aiRecItem}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <Text style={styles.aiRecText}>Stay hydrated - Drink 8 glasses of water</Text>
                  </View>
                  <View style={styles.aiRecItem}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <Text style={styles.aiRecText}>30-minute walk daily for better health</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Notifications & Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications & Preferences</Text>
            <View style={[styles.settingsCard, SHADOWS.small]}>
              <SettingRow
                icon={<Bell size={20} color={COLORS.primary} />}
                label="Appointment Reminders"
                value={appointmentReminder}
                onToggle={setAppointmentReminder}
              />
              <View style={styles.settingDivider} />
              <SettingRow
                icon={<Phone size={20} color={COLORS.primary} />}
                label="SMS Alerts"
                value={smsAlerts}
                onToggle={setSmsAlerts}
              />
              <View style={styles.settingDivider} />
              <SettingRow
                icon={<Bell size={20} color={COLORS.primary} />}
                label="Email Notifications"
                value={emailNotifications}
                onToggle={setEmailNotifications}
              />
            </View>
          </View>

          {/* Security & Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security & Privacy</Text>
            <View style={[styles.securityCard, SHADOWS.small]}>
              <TouchableOpacity style={styles.securityOption}>
                <Lock size={20} color={COLORS.primary} />
                <Text style={styles.securityLabel}>Change Password</Text>
                <ChevronRight size={20} color="#D1D5DB" />
              </TouchableOpacity>
              <View style={styles.securityDivider} />
              <TouchableOpacity style={styles.securityOption}>
                <Shield size={20} color={COLORS.primary} />
                <Text style={styles.securityLabel}>Two-Factor Authentication</Text>
                <View style={styles.enabledBadge}>
                  <Text style={styles.enabledBadgeText}>Enabled</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.securityDivider} />
              <TouchableOpacity style={styles.securityOption}>
                <Clock size={20} color={COLORS.primary} />
                <Text style={styles.securityLabel}>Login Activity</Text>
                <ChevronRight size={20} color="#D1D5DB" />
              </TouchableOpacity>
              <View style={styles.securityDivider} />
              <TouchableOpacity style={styles.securityOption}>
                <Heart size={20} color={COLORS.primary} />
                <Text style={styles.securityLabel}>Data Privacy Settings</Text>
                <ChevronRight size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.section}>
            <TouchableOpacity style={[styles.logoutBtn, SHADOWS.small]} onPress={handleLogout}>
              <LogOut size={20} color="#EF4444" />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
};

// Info Row Component
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// Medical Info Item Component
const MedicalInfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <View style={styles.medicalItem}>
    {icon}
    <Text style={styles.medicalItemLabel}>{label}</Text>
    <Text style={styles.medicalItemValue}>{value}</Text>
  </View>
);

// Setting Row Component
const SettingRow = ({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}) => (
  <View style={styles.settingRow}>
    {icon}
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }} thumbColor={value ? COLORS.primary : '#9CA3AF'} />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  scrollContent: { padding: 20, paddingBottom: 120 },

  // Profile Card
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profilePhoto: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  patientName: { fontSize: 20, fontWeight: '800', color: COLORS.textHeader },
  patientId: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  badgesRow: { flexDirection: 'row', gap: 8 },
  ageBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  genderBadge: { backgroundColor: '#FCE7F3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  bloodBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600', color: COLORS.textHeader },
  bloodBadgeText: { fontSize: 11, fontWeight: '800', color: '#DC2626' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  profileMeta: { flexDirection: 'row', justifyContent: 'space-around' },
  metaItem: { alignItems: 'center' },
  metaLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  metaValue: { fontSize: 16, fontWeight: '700', color: COLORS.primary },

  // Quick Actions
  quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  quickActionBtn: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  quickActionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textHeader, marginTop: 8, textAlign: 'center' },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textHeader },

  // Info Card
  infoCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },
  infoDivider: { height: 1, backgroundColor: '#F3F4F6' },

  // Medical Card
  medicalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  medicalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  medicalItem: { width: '48%', alignItems: 'center', paddingVertical: 12, backgroundColor: '#F9FAFB', borderRadius: 12 },
  medicalItemLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  medicalItemValue: { fontSize: 14, fontWeight: '800', color: COLORS.textHeader },
  medicalDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  allergySection: { marginVertical: 12 },
  allergyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  allergyTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  allergyBadges: { flexDirection: 'row', gap: 8 },
  allergyBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  allergyText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  chronicSection: { marginVertical: 12 },
  chronicHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  chronicTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  noDataText: { fontSize: 12, color: COLORS.textSecondary },
  medicationsSection: { marginVertical: 12 },
  medicationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  medicationTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  medicationItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  medicationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  medicationName: { fontSize: 12, color: COLORS.textSecondary },

  // Emergency Card
  emergencyCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  emergencyContact: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  emergencyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  emergencyInfo: { flex: 1 },
  emergencyName: { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },
  emergencyRelation: { fontSize: 12, color: COLORS.textSecondary },
  emergencyCallBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  emergencyPhone: { marginTop: 12 },
  emergencyPhoneLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  emergencyPhoneValue: { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },

  // Insurance Card
  insuranceCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  uploadInsuranceBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.primary, borderRadius: 12, alignItems: 'center' },
  uploadInsuranceBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  // Appointment Shortcut
  appointmentShortcut: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  appointmentIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  appointmentDetails: { flex: 1 },
  appointmentDoctor: { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },
  appointmentHospital: { fontSize: 12, color: COLORS.textSecondary },
  appointmentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  appointmentTime: { fontSize: 11, color: '#9CA3AF' },
  appointmentViewBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F3F4F6', borderRadius: 8 },
  appointmentViewBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  // Report Shortcut
  reportShortcut: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  reportIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  reportDetails: { flex: 1 },
  reportTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },
  reportDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  // AI Card
  aiCard: { borderRadius: 16, padding: 16, marginBottom: 24 },
  aiContent: { gap: 0 },
  healthScoreContainer: { marginBottom: 16 },
  healthScoreLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  healthScore: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  scoreBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  aiDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 12 },
  aiRecommendations: { marginTop: 12 },
  aiRecTitle: { fontSize: 13, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  aiRecItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  aiRecText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', flex: 1 },

  // Settings Card
  settingsCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textHeader },
  settingDivider: { height: 1, backgroundColor: '#F3F4F6' },

  // Security Card
  securityCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  securityOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  securityLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textHeader },
  enabledBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  enabledBadgeText: { fontSize: 11, fontWeight: '600', color: '#166534' },
  securityDivider: { height: 1, backgroundColor: '#F3F4F6' },

  // Logout Button
  logoutBtn: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 2, borderColor: '#EF4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  logoutBtnText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
});

export default PatientProfileScreen;
