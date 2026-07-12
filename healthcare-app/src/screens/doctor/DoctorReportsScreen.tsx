import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Users, Calendar, Clock, Star, Activity, ChevronRight } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const DoctorReportsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [statsData, setStatsData] = useState([
    { label: 'Total Patients', value: '-', icon: Users, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'This Month', value: '-', icon: Calendar, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Avg. Rating', value: '-', icon: Star, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Hours Worked', value: '-', icon: Clock, color: '#7C3AED', bg: '#EDE9FE' },
  ]);
  
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [topConditions, setTopConditions] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/doctor/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (res.ok && json.success) {
          const { stats, weekly, topConditions } = json.data;
          
          setStatsData([
            { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'This Month', value: stats.thisMonth, icon: Calendar, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Avg. Rating', value: stats.avgRating, icon: Star, color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Hours Worked', value: stats.hoursWorked, icon: Clock, color: '#7C3AED', bg: '#EDE9FE' },
          ]);
          setWeeklyData(weekly);
          setTopConditions(topConditions);
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchAnalytics();
  }, [token]);

  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
  <SafeAreaView style={styles.safe}>
    <LinearGradient colors={['#8B3DFF', '#6A11CB']} style={styles.header}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronRight size={22} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          <Text style={styles.headerSub}>Your performance overview – {monthName}</Text>
        </View>
      </View>
    </LinearGradient>

    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Stat Cards */}
      {loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8B3DFF" />
        </View>
      ) : (
        <>
      <View style={styles.statsGrid}>
        {statsData.map(s => (
          <View key={s.label} style={[styles.statCard, SHADOWS.small]}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <s.icon size={20} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Weekly Bar Chart */}
      <View style={[styles.section, SHADOWS.small]}>
        <View style={styles.sectionHeader}>
          <Activity size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Weekly Patients</Text>
        </View>
        <View style={styles.barChart}>
          {weeklyData.map(w => (
            <View key={w.day} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: `${(w.count / w.max) * 100}%` as any }]}>
                  <LinearGradient colors={['#9333EA', '#5B21B6']} style={StyleSheet.absoluteFillObject} />
                </View>
              </View>
              <Text style={styles.barCount}>{w.count}</Text>
              <Text style={styles.barDay}>{w.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Conditions */}
      <View style={[styles.section, SHADOWS.small]}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Top Conditions Treated</Text>
        </View>
        {topConditions.map(c => (
          <View key={c.name} style={styles.condRow}>
            <View style={styles.condInfo}>
              <Text style={styles.condName}>{c.name}</Text>
              <Text style={styles.condCount}>{c.count} cases</Text>
            </View>
            <View style={styles.condTrack}>
              <LinearGradient colors={['#9333EA', '#5B21B6']} style={[styles.condBar, { width: `${c.pct}%` as any }]} />
            </View>
            <Text style={styles.condPct}>{c.pct}%</Text>
          </View>
        ))}
      </View>
      </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>

    <DoctorBottomNavBar />
    <NurseBottomNavBar />
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
  content: { padding: 16, gap: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', backgroundColor: '#FFF', borderRadius: 20, padding: 16, alignItems: 'flex-start' },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 26, fontWeight: '800', color: '#1F2937' },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginTop: 4 },
  section: { backgroundColor: '#FFF', borderRadius: 20, padding: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: { width: 28, height: 80, backgroundColor: '#F3F4F6', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 8, overflow: 'hidden' },
  barCount: { fontSize: 11, fontWeight: '700', color: '#374151', marginTop: 4 },
  barDay: { fontSize: 10, fontWeight: '600', color: '#9CA3AF' },
  condRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  condInfo: { width: 140 },
  condName: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  condCount: { fontSize: 11, color: '#6B7280' },
  condTrack: { flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  condBar: { height: 8, borderRadius: 4 },
  condPct: { fontSize: 12, fontWeight: '700', color: COLORS.primary, width: 36, textAlign: 'right' },
});

export default DoctorReportsScreen;
