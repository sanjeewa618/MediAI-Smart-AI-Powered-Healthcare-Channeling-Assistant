import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, Modal, Animated, PanResponder, Dimensions, BackHandler, Alert, TextInput, ActivityIndicator } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { Bell, Calendar, LogOut, X, Clock, FileEdit, Plus, Play, Users, CheckSquare, Activity, Search, MessageCircle, RefreshCcw } from 'lucide-react-native';

const { height } = Dimensions.get('window');
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.158.225.227:4000';

const greyShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 3,
};

const parseTime = (timeStr: string) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s(AM|PM)/);
  if (!match) return 0;
  let [, h, m, mod] = match;
  let hours = parseInt(h, 10);
  if (hours === 12) hours = 0;
  if (mod === 'PM') hours += 12;
  const d = new Date();
  d.setHours(hours, parseInt(m, 10), 0, 0);
  return d.getTime();
};

const DoctorDashboard = () => {
  const navigation = useNavigation<any>();
  const isLoggingOut = useRef(false);
  const { token, setToken, setRole } = useAuth();

  const [doctorName, setDoctorName] = useState('Loading...');
  const [doctorSpecialty, setDoctorSpecialty] = useState('Doctor');
  const [doctorPhoto, setDoctorPhoto] = useState('');
  const [timeSlotModalVisible, setTimeSlotModalVisible] = useState(false);
  const [todaySlots, setTodaySlots] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, pendingApprovals: 0 });
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Search and Patient Details State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [patientModalVisible, setPatientModalVisible] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<any>(null);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (e.data.action.type === 'RESET') {
        return;
      }
      if (isLoggingOut.current) {
        return;
      }
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        subscription.remove();
      };
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      const [profileRes, dashboardRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/doctor/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const profileData = await profileRes.json();
      if (profileRes.ok && profileData) {
        const name = profileData.name || 'Doctor';
        const rawName = name.replace(/^Dr\.\s*/i, '').trim();
        const firstName = rawName.split(' ')[0] || 'Doctor';
        setDoctorName(`Dr. ${firstName}`);
        setDoctorSpecialty(profileData.specialization || 'General Practitioner');
        setDoctorPhoto(profileData.photo || '');
      }

      const dashboardData = await dashboardRes.json();
      if (dashboardRes.ok && dashboardData.success) {
        setTodaySlots(dashboardData.data.todaySlots || []);
        setTodayAppointments(dashboardData.data.todayAppointments || []);
        setStats(dashboardData.data.stats || { totalPatients: 0, todayAppointments: 0, pendingApprovals: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const handleStartSessionFromDashboard = async (slot: any) => {
    try {
      const hasActiveSession = todaySlots.some(s => s.sessionStatus === 'started');
      if (hasActiveSession) {
        Alert.alert('Action Blocked', 'You cannot start a new session until the currently active session is ended.');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/doctor/session/start`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          date: new Date().toISOString(),
          timeSlot: `${slot.startTime} - ${slot.endTime}`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to start session');
      }
      fetchDashboardData();
    } catch (error: any) {
      console.error('Failed to start session from dashboard', error);
      Alert.alert('Error', error.message || 'Failed to start session from dashboard');
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const query = searchQuery.toLowerCase();
      const uniquePatients = new Map();
      todayAppointments.forEach(appt => {
        if (appt.patient && appt.patient.name && appt.patient.name.toLowerCase().includes(query)) {
          uniquePatients.set(appt.patient._id, appt.patient);
        }
      });
      setSearchResults(Array.from(uniquePatients.values()));
    }
  }, [searchQuery, todayAppointments]);

  const handleSelectPatient = async (patientId: string) => {
    setSearchQuery('');
    setSearchResults([]);
    setPatientModalVisible(true);
    setLoadingPatientDetails(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/patient/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedPatientDetails(data.data);
      } else {
        Alert.alert('Error', 'Failed to load patient details');
        setPatientModalVisible(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
      setPatientModalVisible(false);
    } finally {
      setLoadingPatientDetails(false);
    }
  };

  // Animation and PanResponder for Bottom Sheet
  const transitionAnim = useRef(new Animated.Value(height)).current;

  const openTimeSlotModal = () => {
    setTimeSlotModalVisible(true);
    Animated.spring(transitionAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8
    }).start();
  };

  const closeTimeSlotModal = () => {
    Animated.timing(transitionAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true
    }).start(() => setTimeSlotModalVisible(false));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only trigger if moving downwards significantly
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          transitionAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeTimeSlotModal();
        } else {
          Animated.spring(transitionAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8
          }).start();
        }
      }
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>

        {/* Top Header Section */}
        <LinearGradient colors={['#8B3DFF', '#6A11CB', '#5F0FFF']} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.headerProfile}>
              <Image 
                source={
                  doctorPhoto 
                    ? { uri: doctorPhoto.startsWith('http') ? doctorPhoto : `${API_BASE_URL}${doctorPhoto}` } 
                    : { uri: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png' }
                } 
                style={styles.docAvatar} 
              />
              <View>
                <Text style={styles.docName}>{doctorName}</Text>
                <Text style={styles.docSpecialty}>{doctorSpecialty}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={fetchDashboardData}>
                <RefreshCcw size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Bell size={20} color="#FFF" />
                <View style={styles.badge} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => {
                  isLoggingOut.current = true;
                  setToken(null);
                  setRole(null);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'SignIn', params: { role: 'doctor' } }],
                  });
                }}
              >
                <LogOut size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Analytics Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Clock size={20} color="#FFF" />
              </View>
              <Text style={styles.statValue}>{stats.todayAppointments}</Text>
              <Text style={styles.statLabel}>Today's Apps</Text>
            </LinearGradient>

            <LinearGradient colors={['#10B981', '#059669']} style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Users size={20} color="#FFF" />
              </View>
              <Text style={styles.statValue}>{stats.totalPatients}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </LinearGradient>

            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statCard}>
              <View style={styles.statIconBox}>
                <CheckSquare size={20} color="#FFF" />
              </View>
              <Text style={styles.statValue}>{stats.pendingApprovals || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </LinearGradient>
          </ScrollView>

          {/* Quick Search */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Patient Search</Text>
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search today's patients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          
          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              {searchResults.map(patient => (
                <TouchableOpacity 
                  key={patient._id} 
                  style={styles.searchResultItem}
                  onPress={() => handleSelectPatient(patient._id)}
                >
                  <View style={styles.searchResultAvatar}>
                    <Text style={styles.searchResultAvatarText}>{patient.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.searchResultName}>{patient.name}</Text>
                    <Text style={styles.searchResultPhone}>{patient.phone || 'No phone provided'}</Text>
                  </View>
                  <Activity size={18} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Today's Schedule</Text>
          {todaySlots.length === 0 ? (
            <View style={styles.emptyBox}>
              <Clock size={40} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No slots today</Text>
            </View>
          ) : (() => {
            const hasActiveSession = todaySlots.some(s => s.sessionStatus === 'started');
            
            return todaySlots.map((slot, idx) => {
              const timeSlotStr = `${slot.startTime} - ${slot.endTime}`;
              const patientsForSlot = todayAppointments.filter(app => app.timeSlot === timeSlotStr);

              const cardStyle = [
                styles.slotCard,
                slot.sessionStatus === 'started' && { backgroundColor: '#ECFDF5', borderColor: '#10B981', borderWidth: 1 },
                slot.sessionStatus === 'ended' && { backgroundColor: '#FEF2F2', borderColor: '#DC2626', borderWidth: 1 }
              ];

              const cardContent = (
                <TouchableOpacity 
                  style={cardStyle}
                  onPress={() => navigation.navigate('DoctorSession', { slot, appointments: patientsForSlot })}
                  activeOpacity={0.8}
                >
                  <View style={styles.slotLeft}>
                    <View style={styles.slotIconBox}>
                      <Clock size={20} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.slotTime}>{timeSlotStr}</Text>
                      <Text style={styles.slotMeta}>
                        {patientsForSlot.length} Patient{patientsForSlot.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    {slot.sessionStatus === 'started' ? (
                      <View style={{ paddingVertical: 10 }}>
                        <Text style={{ color: '#059669', fontWeight: '700', fontSize: 13 }}>Session Started</Text>
                      </View>
                    ) : slot.sessionStatus === 'ended' ? (
                      <View style={{ paddingVertical: 10 }}>
                        <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 13 }}>Session Ended</Text>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.startBtn, hasActiveSession && { opacity: 0.5 }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (hasActiveSession) {
                            Alert.alert('Session Active', 'You cannot start a new session until the currently active session is ended.');
                            return;
                          }
                          handleStartSessionFromDashboard(slot);
                        }}
                      >
                        <Play size={14} color="#FFF" fill="#FFF" />
                        <Text style={styles.startBtnText}>Start</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );

              return <View key={slot._id || idx}>{cardContent}</View>;
            });
          })()}
          <View style={{ height: 60 }} />
        </ScrollView>
        <DoctorBottomNavBar />

        {/* Time Slot Management Bottom Sheet */}
        <Modal
          visible={timeSlotModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeTimeSlotModal}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalDismissArea}
              activeOpacity={1}
              onPress={closeTimeSlotModal}
            />
            <Animated.View
              style={[
                styles.bottomSheet,
                { transform: [{ translateY: transitionAnim }] }
              ]}
            >
              <View style={styles.sheetHandleContainer} {...panResponder.panHandlers}>
                <View style={styles.sheetHandle} />
              </View>

              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Manage Time Slots</Text>
                <TouchableOpacity onPress={closeTimeSlotModal} style={styles.sheetCloseBtn}>
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
                <View style={styles.slotActionRow}>
                  <TouchableOpacity style={styles.addSlotBtn}>
                    <Plus size={18} color="#FFF" />
                    <Text style={styles.addSlotText}>Add New Slot</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.slotSectionTitle}>Available Slots Today</Text>

                {[
                  { time: '09:00 AM - 10:00 AM', status: 'Available' },
                  { time: '10:30 AM - 11:30 AM', status: 'Booked' },
                  { time: '02:00 PM - 03:00 PM', status: 'Available' },
                ].map((slot, i) => (
                  <View key={i} style={styles.slotItem}>
                    <View style={styles.slotInfo}>
                      <Clock size={16} color={COLORS.primary} />
                      <Text style={styles.slotTimeText}>{slot.time}</Text>
                    </View>
                    <View style={styles.slotActions}>
                      <TouchableOpacity style={styles.slotEditBtn}>
                        <FileEdit size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                      <View style={[styles.statusPill, slot.status === 'Booked' ? styles.statusBooked : styles.statusAvailable]}>
                        <Text style={styles.statusPillText}>{slot.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                <View style={{ height: 40 }} />
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
        {/* Patient Details Modal */}
        <Modal visible={patientModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.patientModalContent}>
              <View style={styles.patientModalHeader}>
                <Text style={styles.patientModalTitle}>Patient Details</Text>
                <TouchableOpacity onPress={() => setPatientModalVisible(false)} style={styles.patientModalCloseBtn}>
                  <X size={20} color="#1F2937" />
                </TouchableOpacity>
              </View>
              
              {loadingPatientDetails ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : selectedPatientDetails ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.patientProfileTop}>
                    <View style={styles.patientBigAvatar}>
                      <Text style={styles.patientBigAvatarText}>
                        {selectedPatientDetails.patient?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.patientBigName}>{selectedPatientDetails.patient?.name}</Text>
                    <Text style={styles.patientSubDetail}>{selectedPatientDetails.patient?.email}</Text>
                  </View>
                  
                  <View style={styles.patientInfoBox}>
                    <View style={styles.patientInfoRow}>
                      <Text style={styles.patientInfoLabel}>Phone</Text>
                      <Text style={styles.patientInfoVal}>{selectedPatientDetails.patient?.phone || 'N/A'}</Text>
                    </View>
                    <View style={styles.patientInfoRow}>
                      <Text style={styles.patientInfoLabel}>Gender</Text>
                      <Text style={styles.patientInfoVal}>{selectedPatientDetails.patient?.gender || 'N/A'}</Text>
                    </View>
                    <View style={styles.patientInfoRow}>
                      <Text style={styles.patientInfoLabel}>NIC</Text>
                      <Text style={styles.patientInfoVal}>{selectedPatientDetails.patient?.nic || 'N/A'}</Text>
                    </View>
                  </View>

                  <Text style={styles.patientSectionTitle}>Medical History</Text>
                  {selectedPatientDetails.reports?.length > 0 ? (
                    selectedPatientDetails.reports.map((report: any, idx: number) => (
                      <View key={idx} style={styles.reportCard}>
                        <FileEdit size={16} color={COLORS.primary} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={styles.reportTitle}>{report.title || 'Medical Report'}</Text>
                          <Text style={styles.reportDate}>{new Date(report.recordDate || report.createdAt).toLocaleDateString()}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noReportsText}>No medical records found.</Text>
                  )}
                </ScrollView>
              ) : null}
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },
  wrapper: { flex: 1 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  statCard: {
    width: 140,
    padding: 16,
    borderRadius: 20,
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16, marginTop: 10, paddingHorizontal: 20 },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  quickActionBtn: {
    alignItems: 'center',
    width: 80,
  },
  quickActionIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  slotCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginHorizontal: 20,
    shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextSlotCard: {
    backgroundColor: '#10B981', // A bright emerald color
    borderWidth: 0,
    paddingVertical: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  upNextBadge: {
    color: '#D1FAE5',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  slotLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slotIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  patientModalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  searchResultsContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchResultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchResultAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchResultPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // Patient Details Modal Styles
  patientModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    height: '80%',
  },
  patientModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  patientModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  patientProfileTop: {
    alignItems: 'center',
    marginBottom: 20,
  },
  patientBigAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  patientBigAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  patientBigName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  patientSubDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  patientInfoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  patientInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  patientInfoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  patientInfoVal: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  patientSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reportDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  noReportsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },

  slotTime: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  slotMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  startBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  emptyBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
  },
  docName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  docSpecialty: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  content: {
    paddingTop: 20,
    paddingBottom: 130,
  },
  // Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    minHeight: height * 0.5,
    maxHeight: height * 0.8,
    ...SHADOWS.medium,
  },
  sheetHandleContainer: {
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  sheetCloseBtn: {
    padding: 4,
  },
  sheetContent: {
    flex: 1,
  },
  slotActionRow: {
    marginBottom: 20,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: 'flex-start',
    gap: 8,
  },
  addSlotText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  slotSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slotEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusAvailable: {
    backgroundColor: '#D1FAE5',
  },
  statusBooked: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  statusPillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusStarted: { backgroundColor: '#D1FAE5' },
  statusEnded: { backgroundColor: '#FEE2E2' },
  statusPending: { backgroundColor: '#F3F4F6' },
  statusStartedText: { color: '#059669', fontSize: 12, fontWeight: '700' },
  statusEndedText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },
  statusPendingText: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
});

export default DoctorDashboard;