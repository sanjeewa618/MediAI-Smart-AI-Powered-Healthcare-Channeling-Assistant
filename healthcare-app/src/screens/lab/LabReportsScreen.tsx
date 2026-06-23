import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Platform, Dimensions, TextInput
} from 'react-native';
import {
  ChevronLeft, Bell, Search, FileText, Download,
  Filter, TrendingUp, Droplets, Activity, Zap,
  Microscope, Shield, FlaskConical, CheckCircle,
  Clock, Calendar, ChevronRight, BarChart2, AlertCircle
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';

const { width } = Dimensions.get('window');

const REPORT_CATEGORIES = [
  { id: 'all', label: 'All Reports' },
  { id: 'blood', label: 'Blood Test' },
  { id: 'ecg', label: 'ECG' },
  { id: 'mri', label: 'MRI' },
  { id: 'xray', label: 'X-Ray' },
];

const REPORTS = [
  {
    id: 'r1', patientName: 'Amal Perera', testType: 'Blood Test', date: 'Jun 23, 2025',
    time: '09:15 AM', status: 'Completed', result: 'Normal', icon: Droplets,
    iconColor: '#EF4444', iconBg: '#FEE2E2', refNo: 'LAB-2025-001', nurse: 'Nurse Sarah'
  },
  {
    id: 'r2', patientName: 'Kamali Jayawardena', testType: 'ECG', date: 'Jun 23, 2025',
    time: '10:30 AM', status: 'Pending Review', result: 'Abnormal', icon: Activity,
    iconColor: '#0EA5E9', iconBg: '#E0F2FE', refNo: 'LAB-2025-002', nurse: 'Nurse Nimali'
  },
  {
    id: 'r3', patientName: 'Roshan Fernando', testType: 'MRI Scan', date: 'Jun 22, 2025',
    time: '02:00 PM', status: 'Completed', result: 'Normal', icon: Zap,
    iconColor: '#6366F1', iconBg: '#F3F4FF', refNo: 'LAB-2025-003', nurse: 'Nurse Sarah'
  },
  {
    id: 'r4', patientName: 'Priya Silva', testType: 'X-Ray', date: 'Jun 22, 2025',
    time: '11:00 AM', status: 'Completed', result: 'Normal', icon: Shield,
    iconColor: '#CA8A04', iconBg: '#FEF9C3', refNo: 'LAB-2025-004', nurse: 'Nurse Nimali'
  },
  {
    id: 'r5', patientName: 'Nimal Dissanayake', testType: 'PCR Test', date: 'Jun 21, 2025',
    time: '08:45 AM', status: 'Completed', result: 'Negative', icon: FlaskConical,
    iconColor: '#DB2777', iconBg: '#FDF2F8', refNo: 'LAB-2025-005', nurse: 'Nurse Sarah'
  },
  {
    id: 'r6', patientName: 'Sanduni Rathnayake', testType: 'Blood Test', date: 'Jun 21, 2025',
    time: '03:15 PM', status: 'Pending Review', result: 'Borderline', icon: Droplets,
    iconColor: '#EF4444', iconBg: '#FEE2E2', refNo: 'LAB-2025-006', nurse: 'Nurse Nimali'
  },
];

const STATS = [
  { label: 'Total Reports', value: '284', icon: FileText, color: COLORS.primary },
  { label: 'This Month', value: '48', icon: Calendar, color: '#10B981' },
  { label: 'Pending', value: '6', icon: Clock, color: '#F59E0B' },
  { label: 'Abnormal', value: '12', icon: AlertCircle, color: '#EF4444' },
];

const LabReportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = REPORTS.filter(r => {
    const matchesCategory = activeCategory === 'all' ||
      r.testType.toLowerCase().includes(activeCategory);
    const matchesSearch = r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.testType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.refNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return { bg: '#ECFDF5', text: '#10B981' };
    if (status === 'Pending Review') return { bg: '#FEF3C7', text: '#F59E0B' };
    return { bg: '#FEE2E2', text: '#EF4444' };
  };

  const getResultColor = (result: string) => {
    if (result === 'Normal' || result === 'Negative') return '#10B981';
    if (result === 'Borderline') return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Lab Reports</Text>
              <Text style={styles.headerSub}>Patient Test Results</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Filter size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Bell size={20} color="#FFF" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient, test type or ref no..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

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

        {/* Monthly Overview Card */}
        <View style={[styles.overviewCard, { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 }]}>
          <LinearGradient colors={['#9333EA', '#6D28D9']} style={styles.overviewGradient}>
            <View style={styles.overviewLeft}>
              <Text style={styles.overviewTitle}>Monthly Summary</Text>
              <Text style={styles.overviewSub}>June 2025 · 30 days</Text>
              <View style={styles.overviewStats}>
                <View style={styles.overviewStatItem}>
                  <Text style={styles.overviewStatNum}>94%</Text>
                  <Text style={styles.overviewStatLbl}>Completion Rate</Text>
                </View>
                <View style={styles.overviewDivider} />
                <View style={styles.overviewStatItem}>
                  <Text style={styles.overviewStatNum}>1.8h</Text>
                  <Text style={styles.overviewStatLbl}>Avg Turnaround</Text>
                </View>
              </View>
            </View>
            <View style={styles.overviewIconWrap}>
              <BarChart2 size={48} color="rgba(255,255,255,0.3)" />
            </View>
          </LinearGradient>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
          {REPORT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryPill, activeCategory === cat.id && styles.categoryPillActive]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[styles.categoryPillText, activeCategory === cat.id && styles.categoryPillTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reports List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {filteredReports.map((report) => {
          const statusStyle = getStatusColor(report.status);
          const resultColor = getResultColor(report.result);
          return (
            <View key={report.id} style={[styles.reportCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }]}>
              <View style={styles.reportTop}>
                <View style={styles.reportLeft}>
                  <View style={[styles.reportIconBox, { backgroundColor: report.iconBg }]}>
                    <report.icon size={20} color={report.iconColor} />
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportPatient}>{report.patientName}</Text>
                    <Text style={styles.reportType}>{report.testType}</Text>
                    <Text style={styles.reportRef}>{report.refNo}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>{report.status}</Text>
                </View>
              </View>

              <View style={styles.reportDivider} />

              <View style={styles.reportBottom}>
                <View style={styles.reportMeta}>
                  <Calendar size={12} color={COLORS.textSecondary} />
                  <Text style={styles.reportMetaText}>{report.date}</Text>
                  <Clock size={12} color={COLORS.textSecondary} style={{ marginLeft: 10 }} />
                  <Text style={styles.reportMetaText}>{report.time}</Text>
                </View>
                <View style={styles.reportActions}>
                  <View style={[styles.resultBadge, { backgroundColor: resultColor + '18' }]}>
                    <Text style={[styles.resultText, { color: resultColor }]}>{report.result}</Text>
                  </View>
                  <TouchableOpacity style={styles.downloadBtn}>
                    <Download size={15} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewBtn}>
                    <ChevronRight size={15} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        <View style={{ height: 20 }} />
      </ScrollView>

      <NurseBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 10 },
  headerIconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  bellDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#7C3AED' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 16,
    paddingHorizontal: 16, height: 50, marginTop: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: COLORS.textHeader },
  scrollContent: { paddingBottom: 120 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  statCard: {
    backgroundColor: '#FFF', padding: 14, borderRadius: 20,
    width: (width - 52) / 2, alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  statIconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.textHeader },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  overviewCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 24, overflow: 'hidden' },
  overviewGradient: { flexDirection: 'row', padding: 22, alignItems: 'center' },
  overviewLeft: { flex: 1 },
  overviewTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  overviewSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3, marginBottom: 16 },
  overviewStats: { flexDirection: 'row', alignItems: 'center' },
  overviewStatItem: {},
  overviewStatNum: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  overviewStatLbl: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  overviewDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 20 },
  overviewIconWrap: { opacity: 0.7 },
  categoryScroll: { marginTop: 20 },
  categoryContent: { paddingHorizontal: 20, gap: 10 },
  categoryPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  categoryPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryPillText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  categoryPillTextActive: { color: '#FFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textHeader },
  viewAll: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  reportCard: {
    backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 14,
    borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#F1F5F9',
  },
  reportTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  reportLeft: { flexDirection: 'row', gap: 14, flex: 1 },
  reportIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  reportInfo: { flex: 1 },
  reportPatient: { fontSize: 15, fontWeight: '800', color: COLORS.textHeader },
  reportType: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginTop: 3 },
  reportRef: { fontSize: 11, color: COLORS.primary, fontWeight: '700', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  reportDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  reportBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reportMetaText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  reportActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  resultText: { fontSize: 11, fontWeight: '800' },
  downloadBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  viewBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
});

export default LabReportsScreen;
