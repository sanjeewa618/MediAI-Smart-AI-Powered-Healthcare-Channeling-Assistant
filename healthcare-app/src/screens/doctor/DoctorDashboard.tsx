import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, TextInput, Modal, Animated, PanResponder, Dimensions, BackHandler } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { Search, Bell, Video, User, FileText, Calendar, Activity, Phone, Clock, FileEdit, RefreshCw, AlertCircle, CheckCircle2, LogOut, X, Plus } from 'lucide-react-native';

const { height } = Dimensions.get('window');
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const MOCK_APPOINTMENTS = [
  { id: '1', name: 'Sarah Johnson', age: 28, time: '09:00 AM', minutes: 540, type: 'Physical', status: 'Emergency', img: 'https://i.pravatar.cc/150?img=5' },
  { id: '2', name: 'Michael Smith', age: 45, time: '09:15 AM', minutes: 555, type: 'Video', status: 'Waiting', img: 'https://i.pravatar.cc/150?img=11' },
  { id: '3', name: 'Emma Brown', age: 34, time: '10:00 AM', minutes: 600, type: 'Physical', status: 'Upcoming', img: 'https://i.pravatar.cc/150?img=9' },
  { id: '4', name: 'James Wilson', age: 52, time: '10:30 AM', minutes: 630, type: 'Physical', status: 'Completed', img: 'https://i.pravatar.cc/150?img=8' },
  { id: '5', name: 'Ayesha Fernando', age: 31, time: '10:45 AM', minutes: 645, type: 'Video', status: 'Upcoming', img: 'https://i.pravatar.cc/150?img=47' },
  { id: '6', name: 'David Perera', age: 39, time: '11:15 AM', minutes: 675, type: 'Physical', status: 'Upcoming', img: 'https://i.pravatar.cc/150?img=12' },
  { id: '7', name: 'Nuwan Silva', age: 41, time: '11:45 AM', minutes: 705, type: 'Physical', status: 'Cancelled', img: 'https://i.pravatar.cc/150?img=15' },
  { id: '8', name: 'Priya Nair', age: 29, time: '12:00 PM', minutes: 720, type: 'Video', status: 'Cancelled', img: 'https://i.pravatar.cc/150?img=25' },
  { id: '9', name: 'Tom Baker', age: 44, time: '12:15 PM', minutes: 735, type: 'Physical', status: 'Waiting', img: 'https://i.pravatar.cc/150?img=19' },
  { id: '10', name: 'Anna Scott', age: 28, time: '12:45 PM', minutes: 765, type: 'Physical', status: 'Completed', img: 'https://i.pravatar.cc/150?img=31' },
];

type Appointment = (typeof MOCK_APPOINTMENTS)[number];

const todayStartMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

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

  const [searchQuery, setSearchQuery] = useState('');
  const [currentMinutes, setCurrentMinutes] = useState(todayStartMinutes());
  const [timeSlotModalVisible, setTimeSlotModalVisible] = useState(false);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMinutes(todayStartMinutes());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const filteredAppointments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return MOCK_APPOINTMENTS.filter((appointment) => {
      if (!query) return true;
      return (
        appointment.name.toLowerCase().includes(query) ||
        String(appointment.age).includes(query) ||
        appointment.time.toLowerCase().includes(query) ||
        appointment.status.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const nextThreePatients = useMemo(() => {
    return filteredAppointments
      .filter((appointment) => appointment.status === 'Upcoming' && appointment.minutes >= currentMinutes)
      .sort((a, b) => a.minutes - b.minutes)
      .slice(0, 3);
  }, [filteredAppointments, currentMinutes]);

  const emergencyList = useMemo(
    () => filteredAppointments.filter((appointment) => appointment.status === 'Emergency'),
    [filteredAppointments]
  );

  const waitingList = useMemo(
    () => filteredAppointments.filter((appointment) => appointment.status === 'Waiting'),
    [filteredAppointments]
  );

  const completedList = useMemo(
    () => filteredAppointments.filter((appointment) => appointment.status === 'Completed'),
    [filteredAppointments]
  );

  const cancelledList = useMemo(
    () => filteredAppointments.filter((appointment) => appointment.status === 'Cancelled'),
    [filteredAppointments]
  );

  const summaryCards = [
    { label: 'Next 3', value: nextThreePatients.length, color: '#7C3AED', bg: '#F3E8FF' },
    { label: 'Emergency', value: emergencyList.length, color: '#EF4444', bg: '#FEE2E2' },
    { label: 'Waiting', value: waitingList.length, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Completed', value: completedList.length, color: '#10B981', bg: '#ECFDF5' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Emergency': return '#EF4444';
      case 'Waiting': return '#F59E0B';
      case 'Completed': return '#10B981';
      case 'Cancelled': return '#6B7280';
      default: return '#3B82F6';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Emergency': return '#FEF2F2';
      case 'Waiting': return '#FFFBEB';
      case 'Completed': return '#ECFDF5';
      case 'Cancelled': return '#F3F4F6';
      default: return '#EFF6FF';
    }
  };

  const renderAppointmentCard = (patient: any) => (
    <View key={patient.id} style={[styles.patientCard, greyShadow, patient.status === 'Emergency' && styles.emergencyCard]}>
      <View style={styles.patientHeader}>
        <Image source={{ uri: patient.img }} style={styles.patientAvatar} />
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientSub}>Age: {patient.age} • {patient.type} Consult</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(patient.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(patient.status) }]}>{patient.status}</Text>
        </View>
      </View>

      <View style={styles.timeRow}>
        <Clock size={16} color="#6B7280" />
        <Text style={styles.timeText}>Scheduled for {patient.time}</Text>
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.actionBtnSecondary}>
          <FileText size={16} color="#4B5563" />
          <Text style={styles.actionBtnTextSecondary}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnSecondary}>
          <FileEdit size={16} color="#4B5563" />
          <Text style={styles.actionBtnTextSecondary}>Prescribe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtnPrimary, patient.status === 'Emergency' && { backgroundColor: '#EF4444' }]}>
          {patient.type === 'Video' ? <Video size={16} color="#FFF" /> : <User size={16} color="#FFF" />}
          <Text style={styles.actionBtnTextPrimary}>{patient.status === 'Completed' ? 'Done' : patient.status === 'Cancelled' ? 'Cancelled' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (title: string, data: Appointment[], emptyText: string, accentColor: string, highlight?: boolean) => (
    <View style={[styles.queueSection, highlight && styles.nextSection]}>
      <View style={styles.queueSectionHeader}>
        <View>
          <Text style={styles.queueSectionTitle}>{title}</Text>
          <Text style={styles.queueSectionSub}>{emptyText}</Text>
        </View>
        <View style={[styles.queuePill, { backgroundColor: accentColor + '18' }]}>
          <Text style={[styles.queuePillText, { color: accentColor }]}>{data.length}</Text>
        </View>
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyStateBox}>
          <Text style={styles.emptyStateText}>No patients in this section</Text>
        </View>
      ) : (
        data.map(renderAppointmentCard)
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        
        {/* Top Header Section */}
        <LinearGradient colors={['#8B3DFF', '#6A11CB', '#5F0FFF']} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.headerProfile}>
              <Image source={{ uri: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png' }} style={styles.docAvatar} />
              <View>
                <Text style={styles.docName}>Dr. Saman Perera</Text>
                <Text style={styles.docSpecialty}>Senior Cardiologist</Text>
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

          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color="#9CA3AF" />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search patient name or ID..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Queue Overview */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsScrollContent}>
            {summaryCards.map((item) => (
              <View key={item.label} style={[styles.statBox, greyShadow, { borderColor: item.color + '22' }]}>
                <View style={[styles.statIconWrap, { backgroundColor: item.bg }]}>
                  {item.label === 'Next 3' ? <Clock size={22} color={item.color} /> : null}
                  {item.label === 'Emergency' ? <AlertCircle size={22} color={item.color} /> : null}
                  {item.label === 'Waiting' ? <RefreshCw size={22} color={item.color} /> : null}
                  {item.label === 'Completed' ? <CheckCircle2 size={22} color={item.color} /> : null}
                </View>
                <Text style={styles.statNum}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.highlightStrip}>
            <View style={styles.highlightRow}>
             
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightTitle}>Live Upcoming Queue</Text>
                <Text style={styles.highlightSub}>Next 3 updates automatically as the time moves forward</Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>Live</Text>
              </View>
            </View>
          </View>

          {renderSection('Upcoming - Next 3', nextThreePatients, 'Automatically sorted by time', '#7C3AED', true)}
          {renderSection('Emergency List', emergencyList, 'Needs immediate attention', '#141313')}
          {renderSection('Waiting List', waitingList, 'Waiting for the doctor now', '#F59E0B')}
          {renderSection('Completed List', completedList, 'Already seen today', '#10B981')}
          {renderSection('Cancelled Appointments', cancelledList, 'Appointments cancelled by patient or doctor', '#6B7280')}
          
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
  dateText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 0,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  content: {
    paddingTop: 20,
    paddingBottom: 130,
  },
  statsScroll: {
    marginBottom: 24,
  },
  statsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statBox: {
    width: 130,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
  },
  highlightStrip: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    ...SHADOWS.small,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  highlightSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  queueSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  nextSection: {
    padding: 18,
    borderRadius: 28,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    ...SHADOWS.medium,
    marginBottom: 24,
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
  queueSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  queueSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  queueSectionSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },
  queuePill: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queuePillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyStateBox: {
    paddingVertical: 22,
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  patientCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  emergencyCard: {
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
  },
  patientInfo: {
    flex: 1,
    marginLeft: 14,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  patientSub: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  actionBtnTextSecondary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    gap: 6,
  },
  actionBtnTextPrimary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default DoctorDashboard;
