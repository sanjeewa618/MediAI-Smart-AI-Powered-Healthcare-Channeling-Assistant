import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Platform, Dimensions, TextInput, ActivityIndicator,
  Animated, PanResponder, Modal, KeyboardAvoidingView
} from 'react-native';
import {
  ChevronLeft, Bell, Search, FileText, Download,
  Filter, TrendingUp, Droplets, Activity, Zap,
  Microscope, Shield, FlaskConical, CheckCircle,
  Clock, Calendar, ChevronRight, BarChart2, AlertCircle, Plus, X
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const getIconForCategory = (categoryName: string) => {
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('blood') || cat.includes('hematology')) {
    return { icon: Droplets, color: '#EF4444', bg: '#FEE2E2' };
  }
  if (cat.includes('ecg') || cat.includes('heart') || cat.includes('cardio')) {
    return { icon: Activity, color: '#0EA5E9', bg: '#E0F2FE' };
  }
  if (cat.includes('mri') || cat.includes('scan')) {
    return { icon: Zap, color: '#6366F1', bg: '#F3F4FF' };
  }
  if (cat.includes('xray') || cat.includes('x-ray')) {
    return { icon: Shield, color: '#CA8A04', bg: '#FEF9C3' };
  }
  return { icon: FlaskConical, color: '#DB2777', bg: '#FDF2F8' };
};

const LabReportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  
  // Data States
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Form States
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [nurseProfile, setNurseProfile] = useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showBookingSelector, setShowBookingSelector] = useState(false);
  const [testType, setTestType] = useState('');
  const [result, setResult] = useState('Normal');
  const [status, setStatus] = useState('Completed');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Draggable FAB positions (Initial positioning: bottom right)
  const pan = useRef(new Animated.ValueXY({ x: width - 80, y: height - 180 })).current;

  const panResponderFAB = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();
        // Check if it's a simple tap gesture (very small delta movement)
        if (Math.abs(gestureState.dx) < 8 && Math.abs(gestureState.dy) < 8) {
          handleOpenAddModal();
        }
      },
    })
  ).current;

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/labs/reports?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setReports(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch lab reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = async () => {
    setAddModalVisible(true);
    try {
      // 1. Fetch Profile
      const profileRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData) {
        setNurseProfile(profileData);
      }

      // 2. Fetch Active Bookings
      const bookingsRes = await fetch(`${API_BASE_URL}/api/labs/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      if (bookingsRes.ok && bookingsData.success) {
        const active = (bookingsData.data || []).filter((b: any) =>
          ['Pending', 'Confirmed', 'Checked-In', 'Sample-Collected', 'Testing'].includes(b.status)
        );
        setActiveBookings(active);
        if (active.length > 0) {
          setSelectedBooking(active[0]);
          setTestType(active[0].lab?.name || 'Lab Test');
        } else {
          setSelectedBooking(null);
          setTestType('');
        }
      }
    } catch (err) {
      console.error('Error opening add report modal:', err);
    }
  };

  const handleSelectBooking = (booking: any) => {
    setSelectedBooking(booking);
    setTestType(booking.lab?.name || 'Lab Test');
  };

  const handleSubmitReport = async () => {
    if (!selectedBooking) {
      alert('Please select an active patient appointment.');
      return;
    }
    if (!testType.trim()) {
      alert('Test Type is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        bookingId: selectedBooking._id,
        labId: selectedBooking.lab?._id || selectedBooking.lab,
        testType: testType,
        category: nurseProfile?.department || 'Diabetes',
        result,
        status,
        nurse: nurseProfile?._id,
        notes
      };

      const res = await fetch(`${API_BASE_URL}/api/labs/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        alert('Report created successfully!');
        setAddModalVisible(false);
        // Reset states
        setSelectedBooking(null);
        setTestType('');
        setResult('Normal');
        setStatus('Completed');
        setNotes('');
        // Refresh
        fetchReports();
      } else {
        alert(resData.message || 'Failed to create report.');
      }
    } catch (err) {
      console.error('Error creating report:', err);
      alert('Error creating report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchReports();
      }
    }, [token])
  );

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

  // Sort reports date-wise based on booking appointmentDate
  const sortedReports = [...reports].sort((a, b) => {
    const dateA = a.booking?.appointmentDate ? new Date(a.booking.appointmentDate).getTime() : (a.reportDate ? new Date(a.reportDate).getTime() : 0);
    const dateB = b.booking?.appointmentDate ? new Date(b.booking.appointmentDate).getTime() : (b.reportDate ? new Date(b.reportDate).getTime() : 0);
    return dateB - dateA;
  });

  const filteredReports = sortedReports.filter(r => {
    const patientName = r.patient?.fullName || '';
    const testType = r.testType || '';
    const refNo = r.refNo || '';
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate dynamic stats
  const totalReportsCount = reports.length;
  const thisMonthCount = reports.filter(r => {
    const reportDate = r.reportDate || r.createdAt;
    return reportDate && moment(reportDate).isSame(moment(), 'month');
  }).length;
  const pendingCount = reports.filter(r => r.status === 'Pending Review' || r.status === 'Pending').length;
  const abnormalCount = reports.filter(r => {
    const res = (r.result || '').toLowerCase();
    return res !== 'normal' && res !== 'negative';
  }).length;

  const stats = [
    { label: 'Total Reports', value: String(totalReportsCount), icon: FileText, color: COLORS.primary },
    { label: 'This Month', value: String(thisMonthCount), icon: Calendar, color: '#10B981' },
    { label: 'Pending', value: String(pendingCount), icon: Clock, color: '#F59E0B' },
    { label: 'Abnormal', value: String(abnormalCount), icon: AlertCircle, color: '#EF4444' },
  ];

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

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {stats.map((stat, idx) => (
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
            const iconConfig = getIconForCategory(report.category || report.testType);
            const IconComponent = iconConfig.icon;
            
            return (
              <View key={report._id} style={[styles.reportCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }]}>
                <View style={styles.reportTop}>
                  <View style={styles.reportLeft}>
                    <View style={[styles.reportIconBox, { backgroundColor: iconConfig.bg }]}>
                      <IconComponent size={20} color={iconConfig.color} />
                    </View>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportPatient}>{report.patient?.fullName || 'N/A'}</Text>
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
                    <Text style={styles.reportMetaText}>{moment(report.booking?.appointmentDate || report.reportDate).format('MMM DD, YYYY')}</Text>
                    <Clock size={12} color={COLORS.textSecondary} style={{ marginLeft: 10 }} />
                    <Text style={styles.reportMetaText}>{moment(report.booking?.appointmentDate || report.reportDate).format('hh:mm A')}</Text>
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
      )}

      {/* Draggable FAB */}
      <Animated.View
        style={[
          styles.fab,
          SHADOWS.medium,
          {
            transform: pan.getTranslateTransform()
          }
        ]}
        {...panResponderFAB.panHandlers}
      >
        <Plus size={28} color="#FFF" />
      </Animated.View>

      {/* Add Report Modal */}
      <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Lab Report</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Select Patient Appointment</Text>
              {selectedBooking ? (
                <TouchableOpacity style={styles.selectorBtn} onPress={() => setShowBookingSelector(!showBookingSelector)}>
                  <Text style={styles.selectorBtnText}>
                    {selectedBooking.patient?.fullName} - {selectedBooking.bookingRef}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.noBookingsWarning}>
                  <Text style={styles.noBookingsWarningText}>No active appointments available.</Text>
                </View>
              )}

              {showBookingSelector && (
                <View style={styles.bookingsDropdown}>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                    {activeBookings.map((b) => (
                      <TouchableOpacity
                        key={b._id}
                        style={[styles.dropdownItem, selectedBooking?._id === b._id && styles.dropdownItemActive]}
                        onPress={() => {
                          handleSelectBooking(b);
                          setShowBookingSelector(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, selectedBooking?._id === b._id && styles.dropdownItemTextActive]}>
                          {b.patient?.fullName} ({b.bookingRef} - {b.lab?.name || 'Lab'})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.modalLabel}>Test Type / Description</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Fasting Blood Sugar"
                value={testType}
                onChangeText={setTestType}
              />

              <Text style={styles.modalLabel}>Result Value</Text>
              <View style={styles.btnRow}>
                {['Normal', 'Abnormal', 'Borderline', 'Negative', 'Positive'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.choiceBtn, result === r && styles.choiceBtnActive]}
                    onPress={() => setResult(r)}
                  >
                    <Text style={[styles.choiceBtnText, result === r && styles.choiceBtnTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Status</Text>
              <View style={styles.btnRow}>
                {['Completed', 'Pending Review'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.choiceBtn, status === s && styles.choiceBtnActive]}
                    onPress={() => setStatus(s)}
                  >
                    <Text style={[styles.choiceBtnText, status === s && styles.choiceBtnTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Report Notes</Text>
              <TextInput
                style={[styles.modalInput, { height: 85, textAlignVertical: 'top' }]}
                placeholder="Enter notes (e.g. Blood glucose: 110 mg/dL)"
                multiline
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReport} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Generate Report</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

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

  // Draggable FAB
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  closeBtn: {
    padding: 4,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginTop: 14,
    marginBottom: 6,
  },
  selectorBtn: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  selectorBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textHeader,
  },
  noBookingsWarning: {
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  noBookingsWarningText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingsDropdown: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  dropdownItemText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  choiceBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  choiceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  choiceBtnTextActive: {
    color: '#FFF',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textHeader,
    backgroundColor: '#F8FAFC',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default LabReportsScreen;
