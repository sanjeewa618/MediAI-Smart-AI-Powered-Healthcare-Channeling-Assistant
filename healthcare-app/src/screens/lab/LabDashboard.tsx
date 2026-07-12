import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, StatusBar, Modal, Pressable, Animated, PanResponder, Dimensions, BackHandler } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { Microscope, FileText, Bell, Plus, CheckCircle, Clock, ChevronLeft, LogOut, Calendar, Activity, AlertCircle, FlaskConical, ClipboardList, TrendingUp, Users, Heart, Droplets, Baby, Dna, Sparkles, X, ChevronRight, MapPin } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import NurseBottomNavBar from '../../components/NurseBottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

import moment from 'moment';

const LabDashboard = () => {
  const navigation = useNavigation<any>();
  const isLoggingOut = useRef(false);

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

  const { role, token } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning 👋';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon ☀️';
    } else if (hour >= 17 && hour < 22) {
      return 'Good Evening 🌆';
    } else {
      return 'Good Night 🌙';
    }
  };

  const [selectedLab, setSelectedLab] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState('');
  const [stats, setStats] = useState({ todayTotal: 0, pending: 0, processing: 0, completed: 0 });
  const [activeQueue, setActiveQueue] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch(`${API_BASE_URL}/api/labs/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) {
        setStats(statsData.data);
      }

      const bookingsRes = await fetch(`${API_BASE_URL}/api/labs/bookings?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      if (bookingsRes.ok && bookingsData.success) {
        const allBookings = bookingsData.data || [];
        const processingList = allBookings.filter((b: any) => 
          ['Pending', 'Confirmed', 'Checked-In', 'Sample-Collected', 'Testing'].includes(b.status)
        );
        setActiveQueue(processingList);
        setRecentActivities(allBookings.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats/bookings:', err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data) {
          setUserName(data.name || '');
          setDepartment(data.department || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile in LabDashboard:', err);
      }
    };

    if (token) {
      fetchProfile();
      fetchDashboardData();
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchDashboardData();
      }
    }, [token])
  );

  const firstName = userName ? userName.split(' ')[0] : 'User';
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
      setSelectedLab(null);
      panY.setValue(0);
    });
  };

  const taskStats = [
    { label: 'Today\'s Tests', value: String(stats.todayTotal).padStart(2, '0'), icon: <FlaskConical size={20} color="#FFF" />, bg: COLORS.primary, desc: 'Schedules booked for today' },
    { label: 'Pending', value: String(stats.pending).padStart(2, '0'), icon: <Clock size={20} color="#FFF" />, bg: COLORS.warning, desc: 'Booking is not confirmed yet' },
    { label: 'Processing', value: String(stats.processing).padStart(2, '0'), icon: <Activity size={20} color="#FFF" />, bg: '#60A5FA', desc: 'Patient is arriving/test is in progress' },
    { label: 'Completed', value: String(stats.completed).padStart(2, '0'), icon: <CheckCircle size={20} color="#FFF" />, bg: COLORS.success, desc: 'Appointment finished & report collected' },
  ];

  const laboratorySections = [
    { 
      id: '1', name: 'Blood Tests', type: 'Hematology', icon: <Droplets size={24} color="#E11D48" />, color: '#FEE2E2', queue: 4,
      floor: '2nd Floor', openTime: '07:00 AM', closeTime: '02:00 PM', currentToken: 21, nextToken: 25, status: 'Active',
      remainingSlots: 15
    },
    { 
      id: '2', name: 'Urine Tests', type: 'Urology', icon: <Droplets size={24} color="#22C55E" />, color: '#F0FDF4', queue: 2,
      floor: '3rd Floor', openTime: '07:30 AM', closeTime: '01:30 PM', currentToken: 30, nextToken: 33, status: 'Active',
      remainingSlots: 8
    },
    { 
      id: '3', name: 'Diabetes', type: 'Endocrine', icon: <Activity size={24} color="#0EA5E9" />, color: '#E0F2FE', queue: 5,
      floor: '2nd Floor', openTime: '07:00 AM', closeTime: '02:00 PM', currentToken: 45, nextToken: 51, status: 'Busy',
      remainingSlots: 3
    },
    { 
      id: '4', name: 'Heart', type: 'Cardiology', icon: <Heart size={24} color="#E11D48" />, color: '#FFF1F2', queue: 8,
      floor: '4th Floor', openTime: '08:00 AM', closeTime: '04:00 PM', currentToken: 12, nextToken: 21, status: 'Overloaded',
      remainingSlots: 0
    },
    { 
      id: '5', name: 'Liver', type: 'Hepatology', icon: <Activity size={24} color="#F97316" />, color: '#FFF7ED', queue: 3,
      floor: '2nd Floor', openTime: '07:00 AM', closeTime: '02:00 PM', currentToken: 8, nextToken: 12, status: 'Active',
      remainingSlots: 12
    },
    { 
      id: '6', name: 'Kidney', type: 'Nephrology', icon: <Dna size={24} color="#9333EA" />, color: '#F5F3FF', queue: 6,
      floor: '3rd Floor', openTime: '07:30 AM', closeTime: '01:30 PM', currentToken: 15, nextToken: 22, status: 'Active',
      remainingSlots: 5
    },
    { 
      id: '7', name: 'Thyroid', type: 'Thyroidology', icon: <Sparkles size={24} color="#CA8A04" />, color: '#FEF9C3', queue: 1,
      floor: '2nd Floor', openTime: '07:00 AM', closeTime: '02:00 PM', currentToken: 5, nextToken: 7, status: 'Available',
      remainingSlots: 20
    },
    { 
      id: '8', name: 'Hormone', type: 'Endocrinology', icon: <FlaskConical size={24} color="#10B981" />, color: '#ECFDF5', queue: 4,
      floor: '3rd Floor', openTime: '07:30 AM', closeTime: '01:30 PM', currentToken: 19, nextToken: 24, status: 'Active',
      remainingSlots: 7
    },
    { 
      id: '9', name: 'Pregnancy', type: 'Obs/Gyn', icon: <Baby size={24} color="#DB2777" />, color: '#FDF2F8', queue: 2,
      floor: '1st Floor', openTime: '08:00 AM', closeTime: '08:00 PM', currentToken: 10, nextToken: 13, status: 'Active',
      remainingSlots: 10
    },
    { 
      id: '10', name: 'Full Body', type: 'Diagnostic', icon: <Microscope size={24} color="#475569" />, color: '#F1F5F9', queue: 10,
      floor: 'Ground Floor', openTime: '07:00 AM', closeTime: '09:00 PM', currentToken: 55, nextToken: 66, status: 'Critical',
      remainingSlots: 2
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.wrapper}>
        {/* Modern Task-Oriented Header */}
        <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>{getGreeting()} {firstName}</Text>
              <Text style={styles.headerTitle}>{role === 'nurse' ? 'Nurse Portal' : 'Lab Portal'}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.iconBtn}
                onPress={() => navigation.navigate('LabScheduling')}
              >
                <Calendar size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Bell size={20} color="#FFF" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconBtn} 
                onPress={() => {
                  isLoggingOut.current = true;
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'SignIn', params: { role: role || 'lab' } }],
                  });
                }}
              >
                <LogOut size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats Row */}
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStat}>
              <TrendingUp size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.quickStatText}>12% Load Increase</Text>
            </View>
            <View style={styles.quickStat}>
              <AlertCircle size={16} color="#FCA5A5" />
              <Text style={[styles.quickStatText, { color: '#FCA5A5' }]}>3 Urgent Tasks</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          
          {/* Workflow Status Grid */}
          <Text style={styles.sectionTitle}>Workflow Overview</Text>
          <View style={styles.statusGrid}>
            {taskStats.map((stat, idx) => (
              <TouchableOpacity key={idx} style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: stat.bg }]}>
                  {stat.icon}
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                {stat.desc ? (
                  <Text style={styles.statDesc}>{stat.desc}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>

          {/* Schedule Management Quick Access Card */}
          <TouchableOpacity 
            style={[styles.scheduleFastCard, { marginTop: 20 }]}
            onPress={() => navigation.navigate('LabScheduling')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.scheduleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.scheduleFastInfo}>
                <View style={styles.scheduleFastIconBox}>
                  <Calendar size={24} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={styles.scheduleFastTitle}>Schedule Management</Text>
                  <Text style={styles.scheduleFastSub}>Configure slots, staff & lab capacity</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Urgent Queue Management */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Processing Queue</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LabAppointments')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {activeQueue.length === 0 ? (
            <View style={[styles.queueCard, { padding: 20, alignItems: 'center' }]}>
              <Text style={{ color: COLORS.textSecondary, fontWeight: '600' }}>No active queue bookings</Text>
            </View>
          ) : (
            (() => {
              const status = activeQueue[0].status || 'Pending';
              let borderLeftColor = COLORS.primary;
              let badgeBg = COLORS.primaryLight;
              let badgeText = COLORS.primary;

              if (status === 'Pending') {
                borderLeftColor = COLORS.warning;
                badgeBg = COLORS.warning + '1A';
                badgeText = COLORS.warning;
              } else if (['Checked-In', 'Sample-Collected', 'Testing'].includes(status)) {
                borderLeftColor = '#60A5FA';
                badgeBg = '#DBEAFE';
                badgeText = '#2563EB';
              } else if (status === 'Completed') {
                borderLeftColor = COLORS.success;
                badgeBg = COLORS.success + '1A';
                badgeText = COLORS.success;
              } else if (status === 'Cancelled') {
                borderLeftColor = COLORS.error;
                badgeBg = '#FEE2E2';
                badgeText = COLORS.error;
              }

              const timeStr = activeQueue[0].scheduleSlot && activeQueue[0].scheduleSlot.startTime && activeQueue[0].scheduleSlot.endTime
                ? `${activeQueue[0].scheduleSlot.startTime} - ${activeQueue[0].scheduleSlot.endTime}`
                : activeQueue[0].scheduleSlot?.startTime || '09:00 AM';

              return (
                <View style={[styles.queueCard, { borderLeftColor, borderLeftWidth: 4 }]}>
                  <View style={styles.queueInfo}>
                    <View style={styles.patientRow}>
                      <Text style={styles.patientName}>{activeQueue[0].patient?.fullName}</Text>
                      <View style={[styles.urgentBadge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.urgentText, { color: badgeText }]}>
                          {status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.testType}>{activeQueue[0].lab?.name || 'Lab Test'}</Text>
                    <View style={styles.timeRow}>
                      <Clock size={14} color={COLORS.textSecondary} />
                      <Text style={styles.timeText}>
                        {moment(activeQueue[0].appointmentDate).format('MMM DD, YYYY')} • {timeStr}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.processBtn}
                    onPress={() => navigation.navigate('LabAppointments')}
                  >
                    <Text style={styles.processBtnText}>Manage</Text>
                  </TouchableOpacity>
                </View>
              );
            })()
          )}

          {/* Active Tasks List */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Activities</Text>
          {recentActivities.length === 0 ? (
            <View style={[styles.activityItem, { justifyContent: 'center', padding: 20 }]}>
              <Text style={{ color: COLORS.textSecondary, fontWeight: '600' }}>No recent activities</Text>
            </View>
          ) : (
            recentActivities.map((item) => {
              let statusColor = COLORS.warning;
              if (item.status === 'Completed') statusColor = COLORS.success;
              else if (['Confirmed', 'Checked-In', 'Testing'].includes(item.status)) statusColor = '#60A5FA';
              else if (item.status === 'Cancelled') statusColor = COLORS.error;

              return (
                <View key={item._id} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: statusColor + '15' }]}>
                    <ClipboardList size={22} color={statusColor} />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>{item.patient?.fullName}</Text>
                    <Text style={styles.activitySub}>ID: {item.bookingRef} • Room {item.scheduleSlot?.room || 'N/A'}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusColor + '15' }]}>
                    <Text style={[styles.statusPillText, { color: statusColor }]}>{item.status}</Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
        
        <NurseBottomNavBar />

        {/* Lab Status Detail Modal */}
        <Modal
          visible={!!selectedLab}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
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
              <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTitleBox}>
                    <View style={[styles.modalIconWrap, { backgroundColor: selectedLab?.color }]}>
                      {selectedLab?.icon}
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>{selectedLab?.name}</Text>
                      <Text style={styles.modalSub}>{selectedLab?.type} Department</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  {/* Availability Section */}
                  <Text style={styles.modalSectionLabel}>Daily Availability</Text>
                  <View style={[styles.infoRow, { backgroundColor: '#F9FAFB' }]}>
                    <View style={styles.infoItem}>
                      <Clock size={16} color={COLORS.primary} />
                      <Text style={styles.infoLabel}>Operating Hours</Text>
                      <Text style={styles.infoValue}>{selectedLab?.openTime} - {selectedLab?.closeTime}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Calendar size={16} color={COLORS.primary} />
                      <Text style={styles.infoLabel}>Avail. Appointments</Text>
                      <Text style={[styles.infoValue, { color: selectedLab?.remainingSlots > 5 ? COLORS.success : COLORS.warning }]}>
                        {selectedLab?.remainingSlots} Bookings Left
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.infoRow, { backgroundColor: '#F9FAFB', marginTop: 10 }]}>
                    <View style={styles.infoItem}>
                      <MapPin size={16} color={COLORS.primary} />
                      <Text style={styles.infoLabel}>Location</Text>
                      <Text style={styles.infoValue}>{selectedLab?.floor}</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.modalActionBtn, { backgroundColor: COLORS.primary, marginTop: 15 }]}
                    onPress={() => {
                      closeModal();
                      navigation.navigate('LabScheduling');
                    }}
                  >
                    <Calendar size={18} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.modalActionText}>Manage Category Schedule</Text>
                  </TouchableOpacity>

                  {/* Live Queue Status */}
                  <Text style={[styles.modalSectionLabel, { marginTop: 20 }]}>Live Queue Status</Text>
                  <View style={styles.queueMainBox}>
                    <View style={styles.tokenBox}>
                      <Text style={styles.tokenLabel}>CURRENT TOKEN</Text>
                      <Text style={styles.tokenValue}>{selectedLab?.currentToken}</Text>
                    </View>
                    <View style={styles.tokenDivider} />
                    <View style={styles.tokenBox}>
                      <Text style={styles.tokenLabel}>NEXT TOKEN</Text>
                      <Text style={[styles.tokenValue, { color: COLORS.primary }]}>{selectedLab?.nextToken}</Text>
                    </View>
                  </View>

                  <View style={styles.queueStatsRow}>
                    <View style={styles.qStat}>
                      <Users size={18} color="#4B5563" />
                      <Text style={styles.qStatValue}>{selectedLab?.queue}</Text>
                      <Text style={styles.qStatLabel}>Waiting</Text>
                    </View>
                    <View style={styles.qStat}>
                      <Activity size={18} color="#4B5563" />
                      <Text style={styles.qStatValue}>{selectedLab?.status}</Text>
                      <Text style={styles.qStatLabel}>Status</Text>
                    </View>
                    <View style={styles.qStat}>
                      <TrendingUp size={18} color="#4B5563" />
                      <Text style={styles.qStatValue}>~15m</Text>
                      <Text style={styles.qStatLabel}>Avg. Wait</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.manageBtn}>
                    <Text style={styles.manageBtnText}>Manage Tokens</Text>
                    <ChevronRight size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FC' },
  wrapper: { flex: 1 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4D',
    borderWidth: 2,
    borderColor: '#8B3DFF',
  },
  quickStatsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 15,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quickStatText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 110,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  labCategoriesContainer: {
    paddingRight: 20,
    paddingBottom: 20,
    gap: 16,
  },
  labSectionCard: {
    backgroundColor: '#FFF',
    width: 140,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  labIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  labIdText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  labTypeText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  labBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  queueCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
    minHeight: 500,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  modalSub: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
  },
  modalSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    gap: 20,
  },
  infoItem: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    ...SHADOWS.small,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  queueMainBox: {
    flexDirection: 'row',
    backgroundColor: '#F5F3FF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  tokenBox: {
    flex: 1,
    alignItems: 'center',
  },
  tokenDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(139, 61, 255, 0.2)',
  },
  tokenLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
  },
  queueStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    padding: 16,
  },
  qStat: {
    alignItems: 'center',
    flex: 1,
  },
  qStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
  },
  qStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  manageBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  manageBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  statDesc: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  scheduleFastCard: {
    borderRadius: 24,
    marginVertical: 10,
    overflow: 'hidden',
    height: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  scheduleGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  scheduleFastInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scheduleFastIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleFastTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  scheduleFastSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  queueCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  queueInfo: {
    flex: 1,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  urgentBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  testType: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  processBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  processBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  activityItem: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  activitySub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default LabDashboard;


