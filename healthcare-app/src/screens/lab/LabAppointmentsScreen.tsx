import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Image, Modal, Platform, Switch,
  Animated, PanResponder, Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell, Search, Clock, Calendar as CalendarIcon, CheckCircle,
  Phone, MessageCircle, Download, Activity, DollarSign,
  AlertCircle, User, X, FileText, ChevronLeft,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';
import { useCallback } from 'react';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';



const HISTORY_STATS = { totalTests: 1250, revenue: 'Rs. 1.2M', avgWaitTime: '15 mins' };

const PAST_HISTORY = [
  {
    id: 'h1', patientName: 'Kamal Perera', testType: 'Full Blood Count (CBC)', date: 'Oct 20, 2023', time: '09:15 AM', lab: 'Hematology Lab 02', nurse: 'Nurse. Silva', photo: 'https://img.icons8.com/bubbles/100/000000/user.png'
  },
  {
    id: 'h2', patientName: 'Nimali Fernando', testType: 'Fasting Blood Sugar', date: 'Oct 18, 2023', time: '07:30 AM', lab: 'Endocrine Lab 01', nurse: 'Nurse. Perera', photo: 'https://img.icons8.com/bubbles/100/000000/user-female.png'
  },
  {
    id: 'h3', patientName: 'Kasun Silva', testType: 'Lipid Profile', date: 'Oct 15, 2023', time: '10:00 AM', lab: 'Cardiology Lab 01', nurse: 'Nurse. Jayasuriya', photo: 'https://img.icons8.com/bubbles/100/000000/user.png'
  }
];

const LabAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const slTime = new Date(utc + (5.5 * 3600000));
      
      const dateStr = slTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = slTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      setCurrentDateTime(`${dateStr} • ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const [department, setDepartment] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ todayTotal: 0, pending: 0, completed: 0, urgent: 0 });
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data) {
        setDepartment(data.department || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile in LabAppointmentsScreen:', err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/labs/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const list = data.data || [];
        setAppointments(list);

        // Compute stats dynamically
        const todayStr = moment().format('YYYY-MM-DD');
        const todayApps = list.filter((b: any) => moment(b.appointmentDate).format('YYYY-MM-DD') === todayStr).length;
        const pendingApps = list.filter((b: any) => b.status === 'Pending').length;
        const completedApps = list.filter((b: any) => b.status === 'Completed').length;
        const urgentApps = list.filter((b: any) => b.paymentStatus === 'Paid' && b.status === 'Pending').length;

        setStats({
          todayTotal: todayApps,
          pending: pendingApps,
          completed: completedApps,
          urgent: urgentApps,
        });

        // Show alert if there is a new pending booking
        const hasPending = list.some((b: any) => b.status === 'Pending');
        setShowAlert(hasPending);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchAppointments();
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchAppointments();
      }
    }, [token])
  );

  const handleAccept = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/labs/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Confirmed' })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Appointment Accepted successfully!');
        fetchAppointments();
      } else {
        alert(data.message || 'Failed to accept appointment');
      }
    } catch (err) {
      console.error(err);
      alert('Error accepting appointment');
    }
  };

  const handleRemind = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/labs/bookings/${bookingId}/remind`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Reminder sent to patient successfully!');
      } else {
        alert(data.message || 'Failed to send reminder');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending reminder');
    }
  };

  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          closeModal();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const closeModal = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  useEffect(() => {
    if (modalVisible) {
      panY.setValue(0);
    }
  }, [modalVisible]);

  const dynamicStats = [
    { label: 'Today Apps', value: String(stats.todayTotal), icon: CalendarIcon, color: COLORS.primary },
    { label: 'Pending', value: String(stats.pending), icon: Clock, color: COLORS.warning },
    { label: 'Completed', value: String(stats.completed), icon: CheckCircle, color: COLORS.success },
    { label: 'Urgent', value: String(stats.urgent), icon: AlertCircle, color: COLORS.error },
  ];

  const dynamicFilterTabs = ['All', department || 'Lab Category'];

  const filteredAppointments = appointments.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.patient?.fullName || '').toLowerCase().includes(q) ||
      (item.bookingRef || '').toLowerCase().includes(q) ||
      (item.lab?.name || '').toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.labName}>Test Appointments</Text>
              <Text style={styles.dateTime}>{currentDateTime}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusToggle}>
              <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
              <Switch value={isOnline} onValueChange={setIsOnline}
                trackColor={{ false: 'rgba(255,255,255,0.3)', true: COLORS.success }} thumbColor="#FFF" />
            </View>
            <TouchableOpacity style={styles.bellBtn}>
              <Bell size={20} color="#FFF" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput style={styles.searchInput}
            placeholder="Search by patient name, ID, or test..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          {dynamicStats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <View style={[styles.statIconWrapper, { backgroundColor: stat.color + '1A' }]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Real-Time Alert */}
        {showAlert && appointments.length > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <View style={styles.alertBadge}>
                <View style={styles.alertDot} />
                <Text style={styles.alertBadgeText}>New Appointment Received</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAlert(false)}>
                <X size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.alertContent}>
              <View>
                <Text style={styles.alertName}>{appointments.find(b => b.status === 'Pending')?.patient?.fullName}</Text>
                <Text style={styles.alertDetails}>{appointments.find(b => b.status === 'Pending')?.lab?.name || 'Lab Test'} • {appointments.find(b => b.status === 'Pending')?.scheduleSlot?.startTime}</Text>
              </View>
              <View style={styles.statusPillPaid}>
                <Text style={styles.statusPillTextPaid}>{appointments.find(b => b.status === 'Pending')?.paymentStatus} ✅</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dynamicFilterTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity key={tab}
                  style={[styles.filterTab, isActive && styles.filterTabActive]}
                  onPress={() => setActiveTab(tab)}>
                  <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>{tab}</Text>
                  {isActive && <View style={styles.activeUnderline} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Appointment Cards */}
        <View style={styles.listContainer}>
          {filteredAppointments.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textSecondary, fontWeight: '600' }}>No appointments found</Text>
            </View>
          ) : (
            filteredAppointments.map((item) => {
              const patientPhoto = 'https://img.icons8.com/bubbles/100/000000/user.png';
              const priority = item.paymentStatus === 'Paid' ? 'Urgent' : 'Normal';
              return (
                <View key={item._id} style={styles.appCard}>
                  <View style={styles.appCardHeader}>
                    <View style={styles.appCardHeaderLeft}>
                      <Image source={{ uri: patientPhoto }} style={styles.patientPhoto} />
                      <View>
                        <Text style={styles.patientName}>{item.patient?.fullName}</Text>
                        <Text style={styles.patientInfo}>{item.patient?.gender} • {item.patient?.mobile}</Text>
                      </View>
                    </View>
                    <View style={styles.queueBadge}>
                      <Text style={styles.queueText}>T-{item.queueToken || 1}</Text>
                    </View>
                  </View>
                  <View style={styles.appCardDetails}>
                    <View style={styles.detailRow}>
                      <Activity size={14} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>{item.lab?.name || 'Lab Test'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Clock size={14} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>
                        {moment(item.appointmentDate).format('MMM DD, YYYY')} • {item.scheduleSlot?.startTime && item.scheduleSlot?.endTime ? `${item.scheduleSlot.startTime} - ${item.scheduleSlot.endTime}` : item.scheduleSlot?.startTime || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <User size={14} color={COLORS.textSecondary} />
                      <Text style={styles.detailText}>Room: {item.scheduleSlot?.room || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.appCardBadges}>
                    <Text style={[styles.badge, {
                      backgroundColor: item.paymentStatus === 'Paid' ? COLORS.success + '1A' : COLORS.warning + '1A',
                      color: item.paymentStatus === 'Paid' ? COLORS.success : COLORS.warning,
                    }]}>{item.paymentStatus}</Text>
                    <Text style={[styles.badge, {
                      backgroundColor: priority === 'Urgent' ? COLORS.error + '1A' : COLORS.primaryLight,
                      color: priority === 'Urgent' ? COLORS.error : COLORS.primary,
                    }]}>{priority}</Text>
                    <Text style={[styles.badge, {
                      backgroundColor: item.status === 'Confirmed' ? COLORS.success + '1A' : COLORS.primaryLight,
                      color: item.status === 'Confirmed' ? COLORS.success : COLORS.primary,
                    }]}>{item.status}</Text>
                  </View>
                  <View style={styles.appCardActions}>
                    <TouchableOpacity style={styles.btnSecondary}
                      onPress={() => { setSelectedAppt(item); setModalVisible(true); }}>
                      <Text style={styles.btnSecondaryText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.btnRemind} 
                      onPress={() => handleRemind(item._id)}
                    >
                      <Text style={styles.btnRemindText}>Remind</Text>
                    </TouchableOpacity>
                    {item.status === 'Pending' ? (
                      <TouchableOpacity 
                        style={styles.btnPrimary} 
                        onPress={() => handleAccept(item._id)}
                      >
                        <Text style={styles.btnPrimaryText}>Accept</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.btnPrimary, { backgroundColor: COLORS.success, opacity: 0.8 }]}>
                        <Text style={styles.btnPrimaryText}>Accepted</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Appointments History Section */}
        <View style={styles.bottomSection}>
          <View style={[styles.sectionHeader, { marginTop: 0 }]}>
            <Text style={styles.sectionTitle}>Appointments History</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20, paddingBottom: 10 }}>
            {PAST_HISTORY.map((hist) => (
              <View key={hist.id} style={styles.historyItemCard}>
                <View style={styles.historyItemHeader}>
                  <Image source={{ uri: hist.photo }} style={styles.historyItemPhoto} />
                  <View>
                    <Text style={styles.historyItemName}>{hist.patientName}</Text>
                    <Text style={styles.historyItemTest}>{hist.testType}</Text>
                  </View>
                </View>
                <View style={styles.historyItemDetails}>
                  <View style={styles.detailRow}><Clock size={12} color={COLORS.textSecondary} /><Text style={styles.detailTextSmall}>{hist.date} • {hist.time}</Text></View>
                  <View style={styles.detailRow}><Activity size={12} color={COLORS.textSecondary} /><Text style={styles.detailTextSmall}>{hist.lab}</Text></View>
                  <View style={styles.detailRow}><User size={12} color={COLORS.textSecondary} /><Text style={styles.detailTextSmall}>{hist.nurse}</Text></View>
                </View>
                <TouchableOpacity style={styles.viewReportBtn}>
                  <FileText size={14} color={COLORS.primary} />
                  <Text style={styles.viewReportBtnText}>View Report</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Performance Summary</Text>
          <View style={styles.historyCard}>
            <View style={styles.historyRow}>
              <View><Text style={styles.historyLabel}>Total Tests Done</Text><Text style={styles.historyValue}>{HISTORY_STATS.totalTests}</Text></View>
              <View><Text style={styles.historyLabel}>Total Revenue</Text><Text style={styles.historyValue}>{HISTORY_STATS.revenue}</Text></View>
              <View><Text style={styles.historyLabel}>Avg Wait Time</Text><Text style={styles.historyValue}>{HISTORY_STATS.avgWaitTime}</Text></View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY: panY }] }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            {selectedAppt != null && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Appointment Details</Text>
                  <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                    <X size={20} color={COLORS.textHeader} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalProfileRow}>
                    <Image source={{ uri: 'https://img.icons8.com/bubbles/100/000000/user.png' }} style={styles.modalPhoto} />
                    <View>
                      <Text style={styles.modalName}>{selectedAppt.patient?.fullName}</Text>
                      <Text style={styles.modalSub}>{selectedAppt.patient?.gender} • {selectedAppt.patient?.mobile}</Text>
                    </View>
                  </View>
                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity style={styles.iconBtn}><Phone size={18} color={COLORS.primary} /></TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#25D3661A' }]}><MessageCircle size={18} color="#25D366" /></TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}><Download size={18} color={COLORS.primary} /></TouchableOpacity>
                  </View>
                  <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Test Details</Text>
                    <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Requested Test:</Text> {selectedAppt.lab?.name || 'Lab Test'}</Text>
                    <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Booking Ref:</Text> {selectedAppt.bookingRef}</Text>
                    <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Schedule Slot:</Text> {selectedAppt.scheduleSlot?.startTime} - {selectedAppt.scheduleSlot?.endTime}</Text>
                    <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Payment:</Text> {selectedAppt.paymentStatus} ({selectedAppt.paymentMethod})</Text>
                    <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Status:</Text> {selectedAppt.status}</Text>
                  </View>
                  <View style={styles.modalBtnColumn}>
                    {selectedAppt.status === 'Pending' && (
                      <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={async () => {
                          await handleAccept(selectedAppt._id);
                          closeModal();
                        }}
                      >
                        <CheckCircle size={18} color="#FFF" />
                        <Text style={styles.actionBtnText}>Accept Appointment</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: COLORS.success, marginTop: 10 }]}
                      onPress={async () => {
                        await handleRemind(selectedAppt._id);
                        closeModal();
                      }}
                    >
                      <Bell size={18} color="#FFF" />
                      <Text style={styles.actionBtnText}>Send Reminder Notification</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
      <NurseBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerGradient: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  labName: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  dateTime: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statusToggle: { alignItems: 'center' },
  statusText: { fontSize: 10, color: '#FFF', fontWeight: '600', marginBottom: 2 },
  bellBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error, borderWidth: 1, borderColor: COLORS.primary },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16, height: 50, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, color: COLORS.textHeader },
  scrollContent: { paddingBottom: 40 },
  statsScroll: { padding: 20, gap: 12 },
  statCard: { 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 20, 
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  statIconWrapper: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.textHeader },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, fontWeight: '500' },
  alertContainer: { 
    marginHorizontal: 20, 
    backgroundColor: COLORS.primaryLight, 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: COLORS.primary + '30', 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  alertBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  alertDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF', marginRight: 6 },
  alertBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  alertContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertName: { fontSize: 16, fontWeight: '700', color: COLORS.textHeader },
  alertDetails: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  statusPillPaid: { backgroundColor: COLORS.success + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusPillTextPaid: { fontSize: 11, fontWeight: '700', color: COLORS.success },
  filtersContainer: { paddingHorizontal: 20, marginBottom: 16 },
  filterTab: { marginRight: 24, paddingBottom: 8 },
  filterTabActive: {},
  filterTabText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  filterTabTextActive: { color: COLORS.primary, fontWeight: '800' },
  activeUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: COLORS.primary, borderRadius: 3 },
  listContainer: { paddingHorizontal: 20, gap: 16 },
  appCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  appCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  appCardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  patientPhoto: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight },
  patientName: { fontSize: 16, fontWeight: '700', color: COLORS.textHeader },
  patientInfo: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  queueBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  queueText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  appCardDetails: { gap: 8, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  appCardBadges: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  appCardActions: { flexDirection: 'row', gap: 12 },
  btnSecondary: { flex: 1, paddingVertical: 8, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center' },
  btnSecondaryText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  btnPrimary: { flex: 1, paddingVertical: 8, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
  btnPrimaryText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  btnRemind: { flex: 1, paddingVertical: 8, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', borderWidth: 1, borderColor: '#BFDBFE' },
  btnRemindText: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  bottomSection: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textHeader, marginBottom: 0 },
  viewAllText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  calendarCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  calDaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  calDay: { alignItems: 'center', gap: 8 },
  calDayText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  calSlot: { width: 36, height: 36, borderRadius: 12 },
  calSlotGreen: { backgroundColor: COLORS.success + '30', borderColor: COLORS.success, borderWidth: 1 },
  calSlotOrange: { backgroundColor: COLORS.warning + '30', borderColor: COLORS.warning, borderWidth: 1 },
  calSlotRed: { backgroundColor: COLORS.error + '30', borderColor: COLORS.error, borderWidth: 1 },
  calLegend: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.primaryLight },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  historyCard: { 
    backgroundColor: COLORS.primaryDark, 
    borderRadius: 20, 
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6
  },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  historyLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  historyValue: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  historyItemCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 16, 
    marginRight: 16, 
    width: 260, 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  historyItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  historyItemPhoto: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight },
  historyItemName: { fontSize: 15, fontWeight: '700', color: COLORS.textHeader },
  historyItemTest: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  historyItemDetails: { gap: 6, marginBottom: 16, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 12 },
  detailTextSmall: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  viewReportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primaryLight, paddingVertical: 6, borderRadius: 12 },
  viewReportBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingTop: 10, maxHeight: '90%' },
  dragHandleContainer: { width: '100%', alignItems: 'center', paddingVertical: 10, marginBottom: 10 },
  dragHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textHeader },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  modalProfileRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  modalPhoto: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primaryLight },
  modalName: { fontSize: 18, fontWeight: '700', color: COLORS.textHeader },
  modalSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  modalActionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  iconBtn: { flex: 1, height: 48, borderRadius: 16, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  infoSection: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16, gap: 12, marginBottom: 24 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textHeader, marginBottom: 4 },
  infoText: { fontSize: 14, color: COLORS.textHeader, lineHeight: 22 },
  modalBtnColumn: { gap: 12, paddingBottom: 20 },
  actionBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16 },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});

export default LabAppointmentsScreen;
