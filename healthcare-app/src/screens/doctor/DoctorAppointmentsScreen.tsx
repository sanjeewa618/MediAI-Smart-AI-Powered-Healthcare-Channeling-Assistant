import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Image, Platform,
} from 'react-native';
import { Calendar, Clock, Video, User, ChevronRight, Search, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import { useNavigation } from '@react-navigation/native';

const TABS = ['Today', 'Upcoming', 'Completed', 'Cancelled'];

const APPOINTMENTS = [
  { id: '1', name: 'Sarah Johnson', age: 28, time: '09:00 AM', date: 'Today', type: 'Physical', status: 'Emergency', img: 'https://i.pravatar.cc/150?img=5', issue: 'Chest pain & shortness of breath' },
  { id: '2', name: 'Michael Smith', age: 45, time: '09:30 AM', date: 'Today', type: 'Video', status: 'Waiting', img: 'https://i.pravatar.cc/150?img=11', issue: 'Routine checkup' },
  { id: '3', name: 'Emma Brown', age: 34, time: '10:00 AM', date: 'Today', type: 'Physical', status: 'Upcoming', img: 'https://i.pravatar.cc/150?img=9', issue: 'Hypertension follow-up' },
  { id: '4', name: 'James Wilson', age: 52, time: '08:30 AM', date: 'Today', type: 'Physical', status: 'Completed', img: 'https://i.pravatar.cc/150?img=8', issue: 'Annual physical exam' },
  { id: '5', name: 'Linda Garcia', age: 39, time: '11:00 AM', date: 'May 20', type: 'Video', status: 'Upcoming', img: 'https://i.pravatar.cc/150?img=20', issue: 'Diabetes management' },
  { id: '6', name: 'Robert Lee', age: 61, time: '02:00 PM', date: 'May 20', type: 'Physical', status: 'Upcoming', img: 'https://i.pravatar.cc/150?img=15', issue: 'Post-surgery follow-up' },
];

const getStatusColor = (s: string) => {
  if (s === 'Emergency') return '#EF4444';
  if (s === 'Waiting') return '#F59E0B';
  if (s === 'Completed') return '#10B981';
  if (s === 'Cancelled') return '#6B7280';
  return '#3B82F6';
};
const getStatusBg = (s: string) => {
  if (s === 'Emergency') return '#FEF2F2';
  if (s === 'Waiting') return '#FFFBEB';
  if (s === 'Completed') return '#ECFDF5';
  if (s === 'Cancelled') return '#F9FAFB';
  return '#EFF6FF';
};

const DoctorAppointmentsScreen = () => {
  const [activeTab, setActiveTab] = useState('Today');
  const navigation = useNavigation<any>();

  const filtered = APPOINTMENTS.filter((a) => {
    if (activeTab === 'Today') return a.date === 'Today' && a.status !== 'Completed' && a.status !== 'Cancelled';
    if (activeTab === 'Upcoming') return a.date !== 'Today' || a.status === 'Upcoming';
    if (activeTab === 'Completed') return a.status === 'Completed';
    if (activeTab === 'Cancelled') return a.status === 'Cancelled';
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#8B3DFF', '#6A11CB']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight size={22} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Appointments</Text>
            <Text style={styles.headerSub}>{APPOINTMENTS.filter(a => a.date === 'Today').length} appointments today</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Calendar size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No appointments here</Text>
          </View>
        ) : (
          filtered.map((appt) => (
            <View key={appt.id} style={[styles.card, SHADOWS.medium]}>
              <View style={styles.cardTop}>
                <Image source={{ uri: appt.img }} style={styles.avatar} />
                <View style={styles.info}>
                  <Text style={styles.name}>{appt.name}</Text>
                  <Text style={styles.sub}>Age {appt.age} · {appt.issue}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusBg(appt.status) }]}>
                  <Text style={[styles.badgeText, { color: getStatusColor(appt.status) }]}>{appt.status}</Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.timeText}>{appt.time}</Text>
                </View>
                <View style={styles.timeItem}>
                  <Calendar size={14} color="#6B7280" />
                  <Text style={styles.timeText}>{appt.date}</Text>
                </View>
                <View style={[styles.typeTag, appt.type === 'Video' && { backgroundColor: '#EDE9FE' }]}>
                  {appt.type === 'Video' ? <Video size={12} color="#7C3AED" /> : <User size={12} color="#374151" />}
                  <Text style={[styles.typeText, appt.type === 'Video' && { color: '#7C3AED' }]}>{appt.type}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.btnOutline}>
                  <Text style={styles.btnOutlineText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary}>
                  <LinearGradient colors={['#9333EA', '#5B21B6']} style={styles.gradBtn}>
                    {appt.type === 'Video' ? <Video size={14} color="#FFF" /> : <User size={14} color="#FFF" />}
                    <Text style={styles.btnPrimaryText}>{appt.status === 'Completed' ? 'View Notes' : 'Start'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <DoctorBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerTextWrap: { flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 4,
    ...SHADOWS.small,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#FFF', fontWeight: '700' },
  list: { padding: 16, gap: 14 },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF', fontWeight: '600' },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F3F4F6' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 12, marginBottom: 12 },
  timeItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  typeTag: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  actions: { flexDirection: 'row', gap: 10 },
  btnOutline: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.primary },
  btnOutlineText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  btnPrimary: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  gradBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 6 },
  btnPrimaryText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});

export default DoctorAppointmentsScreen;
