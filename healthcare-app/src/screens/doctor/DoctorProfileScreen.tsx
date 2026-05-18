import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Star, Clock, Shield, Bell, LogOut, ChevronRight, Edit3, Phone, Mail, MapPin } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import { useNavigation } from '@react-navigation/native';

const MENU_ITEMS = [
  { icon: Bell, label: 'Notifications', sub: 'Appointment alerts & reminders', color: '#F59E0B' },
  { icon: Shield, label: 'Privacy & Security', sub: 'Password, 2FA settings', color: '#10B981' },
  { icon: Clock, label: 'Working Hours', sub: 'Set your availability hours', color: '#3B82F6' },
];

const DoctorProfileScreen = () => {
  const navigation = useNavigation<any>();
  const [onlineStatus, setOnlineStatus] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#8B3DFF', '#6A11CB']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Edit3 size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <LinearGradient colors={['#9333EA', '#5B21B6']} style={styles.avatarCircle}>
            <User size={40} color="#FFF" />
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.docName}>Dr. Saman Perera</Text>
            <Text style={styles.docSpec}>Senior Cardiologist</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.rating}>4.9</Text>
              <Text style={styles.ratingCount}>· 248 patients</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Online Status Toggle */}
        <View style={[styles.statusCard, SHADOWS.small]}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusDot, { backgroundColor: onlineStatus ? '#10B981' : '#9CA3AF' }]} />
            <View>
              <Text style={styles.statusTitle}>{onlineStatus ? 'Available for Patients' : 'Currently Offline'}</Text>
              <Text style={styles.statusSub}>Toggle your availability status</Text>
            </View>
          </View>
          <Switch
            value={onlineStatus}
            onValueChange={setOnlineStatus}
            trackColor={{ false: '#E5E7EB', true: COLORS.primaryLight }}
            thumbColor={onlineStatus ? COLORS.primary : '#9CA3AF'}
          />
        </View>

        {/* Contact Info */}
        <View style={[styles.section, SHADOWS.small]}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {[
            { icon: Phone, text: '+94 77 123 4567' },
            { icon: Mail, text: 'dr.saman@mediAI.lk' },
            { icon: MapPin, text: 'National Hospital, Colombo' },
          ].map((item, i) => (
            <View key={i} style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <item.icon size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.contactText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Experience', value: '12 yrs' },
            { label: 'Consultations', value: '1.2k+' },
            { label: 'Avg. Time', value: '24 min' },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, SHADOWS.small]}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={[styles.section, SHADOWS.small]}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuDivider]}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <item.icon size={18} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, SHADOWS.small]} onPress={() => navigation.navigate('RoleSelection')}>
          <LogOut size={18} color={COLORS.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <DoctorBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  editBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarCircle: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1 },
  docName: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  docSpec: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  rating: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  ratingCount: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  content: { padding: 16, gap: 14 },
  statusCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  statusSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  section: { backgroundColor: '#FFF', borderRadius: 20, padding: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 14 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  contactIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  contactText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#FFF', borderRadius: 18, padding: 16, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginTop: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  menuSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  logoutBtn: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#FEE2E2' },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.error },
});

export default DoctorProfileScreen;
