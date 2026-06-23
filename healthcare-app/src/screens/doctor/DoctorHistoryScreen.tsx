import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, User, Video, FileText, Calendar, ChevronRight, FileSearch } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import { useNavigation } from '@react-navigation/native';

const HISTORY = [
  { id: '1', name: 'James Wilson', age: 52, date: 'May 18, 2026', time: '08:30 AM', type: 'Physical', diagnosis: 'Annual physical exam – Normal', img: 'https://i.pravatar.cc/150?img=8' },
  { id: '2', name: 'Priya Nair', age: 31, date: 'May 17, 2026', time: '10:00 AM', type: 'Video', diagnosis: 'Hypertension – Medication adjusted', img: 'https://i.pravatar.cc/150?img=47' },
  { id: '3', name: 'Tom Baker', age: 44, date: 'May 16, 2026', time: '09:00 AM', type: 'Physical', diagnosis: 'Diabetes Type 2 – Diet counselling', img: 'https://i.pravatar.cc/150?img=12' },
  { id: '4', name: 'Anna Scott', age: 28, date: 'May 15, 2026', time: '11:30 AM', type: 'Video', diagnosis: 'Migraine – Prescribed sumatriptan', img: 'https://i.pravatar.cc/150?img=25' },
  { id: '5', name: 'David Kim', age: 63, date: 'May 14, 2026', time: '03:00 PM', type: 'Physical', diagnosis: 'Post-op follow-up – Healing well', img: 'https://i.pravatar.cc/150?img=68' },
];

const MONTHS = ['May 2026', 'April 2026', 'March 2026'];

const DoctorHistoryScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState('May 2026');
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#8B3DFF', '#6A11CB']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight size={22} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Patient History</Text>
            <Text style={styles.headerSub}>{HISTORY.length} past consultations</Text>
          </View>
        </View>
      </LinearGradient>

      

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {HISTORY.map(h => (
          <View key={h.id} style={[styles.card, SHADOWS.small]}>
            <View style={styles.cardTop}>
              <Image source={{ uri: h.img }} style={styles.avatar} />
              <View style={styles.info}>
                <Text style={styles.name}>{h.name}</Text>
                <Text style={styles.sub}>Age {h.age}</Text>
              </View>
              <View style={[styles.typeTag, h.type === 'Video' && { backgroundColor: '#EDE9FE' }]}>
                {h.type === 'Video' ? <Video size={12} color="#7C3AED" /> : <User size={12} color="#374151" />}
                <Text style={[styles.typeText, h.type === 'Video' && { color: '#7C3AED' }]}>{h.type}</Text>
              </View>
            </View>
            <View style={styles.diagBox}>
              <FileText size={14} color={COLORS.primary} />
              <Text style={styles.diagText}>{h.diagnosis}</Text>
            </View>
            <View style={styles.dateRow}>
              <View style={styles.dateTimeWrap}>
                <Calendar size={13} color="#9CA3AF" />
                <Text style={styles.dateText}>{h.date}</Text>
                <Clock size={13} color="#9CA3AF" style={{ marginLeft: 10 }} />
                <Text style={styles.dateText}>{h.time}</Text>
              </View>
              <TouchableOpacity 
                style={styles.seeReportBtn}
                onPress={() => navigation.navigate('DoctorReports')}
              >
                <FileSearch size={14} color="#FFF" />
                <Text style={styles.seeReportBtnText}>See Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      <DoctorBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerTextWrap: { flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  monthScroll: { maxHeight: 60 },
  monthContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  monthBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB' },
  monthBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  monthText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  monthTextActive: { color: '#FFF', fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 46, height: 46, borderRadius: 14 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  diagBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryLight, padding: 10, borderRadius: 10, marginBottom: 10 },
  diagText: { fontSize: 13, color: COLORS.primaryDark, fontWeight: '600', flex: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateTimeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  seeReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  seeReportBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default DoctorHistoryScreen;
