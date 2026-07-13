import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Platform, Modal, ActivityIndicator, Alert, Linking, TextInput
} from 'react-native';
import { Calendar, Clock, Video, User, ChevronRight, ChevronLeft, X, Activity, FileText, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.158.225.227:4000';

const generateMonthDays = (targetDate: Date) => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  const numDays = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= numDays; i++) {
    const d = new Date(year, month, i);
    const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday = d.toDateString() === today.toDateString();
    
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(i).padStart(2, '0');

    days.push({
      dayName: dayNames[d.getDay()],
      dateStr: i.toString(),
      fullDateStr: `${year}-${mStr}-${dStr}`,
      isPast,
      isToday
    });
  }
  return days;
};

const getStatusColor = (s: string) => {
  const status = s?.toLowerCase();
  if (status === 'emergency') return '#EF4444';
  if (['waiting', 'pending', 'confirmed'].includes(status)) return '#F59E0B';
  if (status === 'in') return '#D97706';
  if (['ready', 'started'].includes(status)) return '#2563EB';
  if (status === 'completed') return '#10B981';
  if (status === 'cancelled') return '#DC2626';
  if (status === 'skipped') return '#6B7280';
  return '#3B82F6';
};

const getStatusBg = (s: string) => {
  const status = s?.toLowerCase();
  if (status === 'emergency') return '#FEF2F2';
  if (['waiting', 'pending', 'confirmed'].includes(status)) return '#FFFBEB';
  if (status === 'in') return '#FEF3C7';
  if (['ready', 'started'].includes(status)) return '#DBEAFE';
  if (status === 'completed') return '#ECFDF5';
  if (status === 'cancelled') return '#FEE2E2';
  if (status === 'skipped') return '#F3F4F6';
  return '#EFF6FF';
};

const DoctorAppointmentsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const monthDays = generateMonthDays(currentMonthDate);
  const currentMonthStr = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${mStr}-${dStr}`;
  });

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = appointments.filter(appt => 
    appt.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appt.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Profile Modal State
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [richPatientData, setRichPatientData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const openPatientProfile = async (appt: any) => {
    setProfileModalVisible(true);
    setLoadingProfile(true);
    setRichPatientData(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/patient/${appt.patient._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRichPatientData(data.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not load full patient profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    const activeIndex = monthDays.findIndex(wd => wd.fullDateStr === selectedDay);
    if (activeIndex > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: activeIndex * 70, animated: true });
      }, 100);
    }
  }, [currentMonthDate, selectedDay]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments?date=${selectedDay}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', `Appointment has been ${newStatus}.`);
        fetchAppointments();
      } else {
        Alert.alert('Error', data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      Alert.alert('Error', 'Unable to update status.');
    }
  };

  useEffect(() => {
    if (token && selectedDay) {
      fetchAppointments();
    }
  }, [token, selectedDay]);

  const getDayLabel = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (selectedDay === todayStr) return "Today's Appointments";
    
    const selectedDate = new Date(selectedDay);
    if (selectedDate < today) return "Past Appointments";
    return "Upcoming Appointments";
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#8B3DFF', '#6A11CB']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('DoctorDashboard')} style={styles.backBtn}>
            <ChevronRight size={22} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.headerTitle}>Appointments</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{appointments.length}</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>{getDayLabel()}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1))} style={styles.monthNavBtn}>
          <ChevronLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.monthTitleContainer} onPress={() => {
          setPickerYear(currentMonthDate.getFullYear());
          setShowMonthPicker(true);
        }}>
          <Calendar size={18} color={COLORS.primary} />
          <Text style={styles.monthText}>{currentMonthStr}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1))} style={styles.monthNavBtn}>
          <ChevronRight size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayScrollContent} ref={scrollRef}>
        {monthDays.map((wd, i) => {
          const isActive = selectedDay === wd.fullDateStr;
          return (
            <TouchableOpacity key={i + '-' + wd.dayName} onPress={() => setSelectedDay(wd.fullDateStr)} style={[styles.dayBtn, wd.isPast && !wd.isToday && styles.dayBtnPast, isActive && styles.dayBtnActive]}>
              <Text style={[styles.dayName, isActive && styles.dayNameActive]}>{wd.dayName}</Text>
              <Text style={[styles.dayDate, isActive && styles.dayDateActive]}>{wd.dateStr}</Text>
              {wd.isToday && <View style={[styles.dayDot, isActive && { backgroundColor: '#FFF' }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Month/Year Picker Modal */}
      <Modal visible={showMonthPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { minHeight: 400 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month & Year</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 10 }}>
              <TouchableOpacity onPress={() => setPickerYear(y => y - 1)} style={{ padding: 10, backgroundColor: '#F9FAFB', borderRadius: 12 }}>
                <ChevronLeft size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#1F2937' }}>{pickerYear}</Text>
              <TouchableOpacity onPress={() => setPickerYear(y => y + 1)} style={{ padding: 10, backgroundColor: '#F9FAFB', borderRadius: 12 }}>
                <ChevronRight size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                const isActive = currentMonthDate.getMonth() === i && currentMonthDate.getFullYear() === pickerYear;
                return (
                  <TouchableOpacity 
                    key={m} 
                    style={[
                      { width: '30%', paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
                      isActive && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                    ]} 
                    onPress={() => {
                      setCurrentMonthDate(new Date(pickerYear, i, 1));
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text style={[
                      { fontSize: 15, fontWeight: '600', color: '#4B5563' },
                      isActive && { color: '#FFF', fontWeight: '700' }
                    ]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.centerBox}>
            <Calendar size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No appointments for this date</Text>
          </View>
        ) : filteredAppointments.length === 0 ? (
          <View style={styles.centerBox}>
            <Search size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No patients match your search</Text>
          </View>
        ) : (
          filteredAppointments.map((appt, idx) => {
            const patientName = appt.patient?.name || 'Unknown Patient';
            const issueText = appt.notes || 'Consultation'; 
            
            return (
              <View key={appt._id} style={[styles.card, SHADOWS.medium]}>
                <View style={styles.cardTop}>
                  <View style={styles.info}>
                    <Text style={styles.name}>{patientName}</Text>
                    <Text style={styles.sub}>{issueText}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getStatusBg(appt.status) }]}>
                    <Text style={[styles.badgeText, { color: getStatusColor(appt.status) }]}>{appt.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.timeRow}>
                  <View style={styles.timeItem}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.timeText}>{appt.timeSlot}</Text>
                  </View>
                  <View style={styles.timeItem}>
                    <Calendar size={14} color="#6B7280" />
                    <Text style={styles.timeText}>{new Date(appt.date).toLocaleDateString()}</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  {appt.status === 'pending' ? (
                    <>
                      <TouchableOpacity 
                        style={[styles.btnOutline, { flex: 1, borderColor: '#DC2626' }]} 
                        onPress={() => handleUpdateStatus(appt._id, 'cancelled')}
                      >
                        <Text style={[styles.btnOutlineText, { color: '#DC2626' }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.btnPrimary, { flex: 1 }]} 
                        onPress={() => handleUpdateStatus(appt._id, 'confirmed')}
                      >
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.gradBtn}>
                          <Text style={styles.btnPrimaryText}>Accept</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.btnOutline, { flex: 0.8, borderColor: '#9333EA' }]} 
                        onPress={() => openPatientProfile(appt)}
                      >
                        <Text style={[styles.btnOutlineText, { color: '#9333EA' }]}>Details</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.btnPrimary} onPress={() => openPatientProfile(appt)}>
                      <LinearGradient colors={['#9333EA', '#5B21B6']} style={styles.gradBtn}>
                        <Text style={styles.btnPrimaryText}>View Details</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
          <View style={styles.profileModalHeader}>
            <TouchableOpacity onPress={() => setProfileModalVisible(false)} style={styles.closeBtn}>
              <ChevronRight size={24} color="#374151" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Patient Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {loadingProfile ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : richPatientData ? (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              <View style={styles.profileCard}>
                <View style={styles.profileIconCircle}>
                  <User size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.profileName}>{richPatientData.patient.name}</Text>
                <Text style={styles.profileEmail}>{richPatientData.patient.email}</Text>
                <View style={styles.tagsRow}>
                  {richPatientData.patient.gender && (
                    <View style={styles.infoTag}><Text style={styles.infoTagText}>{richPatientData.patient.gender}</Text></View>
                  )}
                  {richPatientData.patient.bloodGroup && (
                    <View style={styles.infoTag}><Text style={styles.infoTagText}>Blood: {richPatientData.patient.bloodGroup}</Text></View>
                  )}
                </View>
              </View>

              <Text style={styles.profileSectionTitle}>Health Information</Text>
              <View style={styles.profileListCard}>
                <View style={styles.profileListItem}>
                  <Activity size={20} color="#6B7280" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.profileListLabel}>Allergies</Text>
                    <Text style={styles.profileListValue}>
                      {richPatientData.patient.allergies?.length > 0 ? richPatientData.patient.allergies.join(', ') : 'None Reported'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.profileListItem, { borderBottomWidth: 0 }]}>
                  <Activity size={20} color="#6B7280" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.profileListLabel}>Chronic Conditions</Text>
                    <Text style={styles.profileListValue}>
                      {richPatientData.patient.chronicConditions?.length > 0 ? richPatientData.patient.chronicConditions.join(', ') : 'None Reported'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.profileSectionTitle}>Medical Reports</Text>
              {richPatientData.reports?.length > 0 ? (
                richPatientData.reports.map((report: any) => (
                  <TouchableOpacity 
                    key={report._id} 
                    style={styles.reportCard}
                    onPress={() => {
                      if (report.attachments && report.attachments.length > 0) {
                        let url = report.attachments[0];
                        if (url.startsWith('/')) {
                          url = `${API_BASE_URL}${url}`;
                        }
                        Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot open this report. Ensure you have a PDF/Image viewer installed.'));
                      } else {
                        Alert.alert('No Attachment', 'There is no file attached to this report.');
                      }
                    }}
                  >
                    <FileText size={24} color={COLORS.primary} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.reportTitle}>{report.title || 'Medical Report'}</Text>
                      <Text style={styles.reportDate}>{new Date(report.recordDate).toLocaleDateString()}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noReportsText}>No previous reports available.</Text>
              )}
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>

      <DoctorBottomNavBar />
      <NurseBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30 
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTextWrap: { marginLeft: 15 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: '#FFF',
    fontSize: 25,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 20,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  monthTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthNavBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  monthText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  dayScroll: { height: 90, minHeight: 90, flexShrink: 0, flexGrow: 0 },
  dayScrollContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  dayBtn: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', minWidth: 56 },
  dayBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayBtnPast: { opacity: 0.6, backgroundColor: '#F9FAFB' },
  dayName: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  dayNameActive: { color: '#FFF' },
  dayDate: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginTop: 2 },
  dayDateActive: { color: '#FFF' },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 3 },
  
  list: { padding: 16, gap: 14, flexGrow: 1 },
  centerBox: { alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF', fontWeight: '600' },
  
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F3F4F6' },
  info: { flex: 1 },
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  
  // Profile Modal Styles
  profileModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  closeBtn: { padding: 8 },
  profileCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20 },
  profileIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  profileName: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  profileEmail: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  infoTag: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  infoTagText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  profileSectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12, marginLeft: 4 },
  profileListCard: { backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 },
  profileListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  profileListLabel: { fontSize: 13, color: '#9CA3AF' },
  profileListValue: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginTop: 2 },
  reportCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reportTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  reportDate: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  noReportsText: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic', marginLeft: 4 },
});

export default DoctorAppointmentsScreen;
