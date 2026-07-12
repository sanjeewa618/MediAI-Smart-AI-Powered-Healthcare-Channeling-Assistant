import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, Modal, Animated, PanResponder, Dimensions, BackHandler } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { Bell, Calendar, LogOut, X, Clock, FileEdit, Plus, Play, Users, CheckSquare, Activity } from 'lucide-react-native';

const { height } = Dimensions.get('window');
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const greyShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 3,
};

const DoctorDashboard = () => {
  const navigation = useNavigation<any>();
  const isLoggingOut = useRef(false);
  const { token } = useAuth();

  const [doctorName, setDoctorName] = useState('Loading...');
  const [doctorSpecialty, setDoctorSpecialty] = useState('Doctor');
  const [timeSlotModalVisible, setTimeSlotModalVisible] = useState(false);
  const [todaySlots, setTodaySlots] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, pendingApprovals: 0 });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, dashboardRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/doctor/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const profileData = await profileRes.json();
        if (profileRes.ok && profileData) {
          const name = profileData.name || 'Doctor';
          setDoctorName(name.startsWith('Dr.') ? name : `Dr. ${name}`);
          setDoctorSpecialty(profileData.specialization || 'General Practitioner');
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

    if (token) {
      fetchData();
    }
  }, [token]);

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
              <Image source={{ uri: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png' }} style={styles.docAvatar} />
              <View>
                <Text style={styles.docName}>{doctorName}</Text>
                <Text style={styles.docSpecialty}>{doctorSpecialty}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={openTimeSlotModal}>
                <Calendar size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Bell size={20} color="#FFF" />
                <View style={styles.badge} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => {
                  isLoggingOut.current = true;
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

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Today's Schedule</Text>
          {todaySlots.length === 0 ? (
            <View style={styles.emptyBox}>
              <Clock size={40} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No slots today</Text>
            </View>
          ) : (
            todaySlots.map((slot, idx) => {
              const timeSlotStr = `${slot.startTime} - ${slot.endTime}`;
              const patientsForSlot = todayAppointments.filter(app => app.timeSlot === timeSlotStr);
              return (
                <TouchableOpacity 
                  key={slot._id || idx} 
                  style={styles.slotCard}
                  onPress={() => navigation.navigate('DoctorSession', { slot, appointments: patientsForSlot })}
                  activeOpacity={0.8}
                >
                  <View style={styles.slotLeft}>
                    <View style={styles.slotIconBox}>
                      <Clock size={20} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.slotTime}>{timeSlotStr}</Text>
                      <Text style={styles.slotMeta}>{patientsForSlot.length} Patient{patientsForSlot.length !== 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                  <View style={styles.startBtn}>
                    <Play size={14} color="#FFF" fill="#FFF" />
                    <Text style={styles.startBtnText}>Start</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
  slotLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slotIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
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
    backgroundColor: '#ECFDF5',
  },
  statusBooked: {
    backgroundColor: '#FEF2F2',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
});

export default DoctorDashboard;