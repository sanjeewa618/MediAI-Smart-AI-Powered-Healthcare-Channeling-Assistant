import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, Animated, PanResponder, Pressable, StatusBar, Modal, BackHandler, Easing } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { Search, Calendar, User, FileText, Activity, MoreHorizontal, Home, Heart, Shield, MessageCircle, FileEdit, FlaskConical, ChevronRight, Baby, Droplets, Sparkles, Plus, Bell, LogOut, Pill, Truck, Settings, X, LifeBuoy, Stethoscope, Dna, Brain, Bone, Eye, Smile, Wallet, Clock, AlertCircle, Hourglass, Users } from 'lucide-react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

type PatientDashboardProp = StackNavigationProp<RootStackParamList, 'PatientDashboard'>;

const StaggeredView = ({ children, delay = 0, style }: { children: React.ReactNode; delay: number; style?: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// =============================================================
//  Utility for Dynamic Gradients
// =============================================================
const getGradientForDate = (dateVal: string | Date) => {
  const dateStr = moment(dateVal).format('YYYY-MM-DD');
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  const gradients = [
    ['#1E3A8A', '#3B82F6'], // Deep Blue
    ['#0F766E', '#14B8A6'], // Premium Teal
    ['#0369A1', '#0EA5E9'], // Sky Blue
    ['#065F46', '#10B981'], // Emerald Green
    ['#083344', '#06B6D4'], // Bright Cyan
    ['#1D4ED8', '#60A5FA'], // Classic Blue
    ['#047857', '#34D399'], // Sea Green
  ] as const;
  return gradients[hash % gradients.length] as readonly [string, string];
};

// =============================================================
//  QueueAppointmentCard
//  Beautifully redesigned card that prominently shows the
//  patient's live queue number along with live status indicators
//  (currently serving, patients ahead, estimated wait, etc.).
// =============================================================
const QueueAppointmentCard = ({
  appointment,
  queueInfo,
  onPress,
  lastRefresh
}: {
  appointment: any;
  queueInfo?: any;
  onPress: () => void;
  lastRefresh?: Date | null;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (queueInfo) {
      Animated.timing(progressAnim, {
        toValue: Math.min(1, Math.max(0, (queueInfo.currentlyServing || 1) / Math.max(1, queueInfo.queueNumber || 1))),
        duration: 800,
        useNativeDriver: false
      }).start();
    }
  }, [queueInfo?.currentlyServing, queueInfo?.queueNumber]);

  const queueNumber = queueInfo?.queueNumber ?? appointment?.queueNumber ?? '—';
  const totalInSlot = queueInfo?.totalInSlot ?? 0;
  const patientsAhead = queueInfo?.patientsAhead ?? 0;
  const currentlyServing = queueInfo?.currentlyServing ?? 1;
  const estimatedWait = queueInfo?.estimatedWaitMinutes ?? 0;
  const isYourTurn = patientsAhead === 0;

  const waitHours = Math.floor(estimatedWait / 60);
  const waitMinutes = estimatedWait % 60;
  const waitLabel = estimatedWait === 0
    ? "It's your turn!"
    : waitHours > 0
      ? `~${waitHours}h ${waitMinutes}m wait`
      : `~${waitMinutes}m wait`;

  const isLab = !!appointment?.testName;
  const statusColor = isYourTurn ? '#10B981' : patientsAhead <= 2 ? '#F59E0B' : COLORS.primary;
  const statusBg = isYourTurn ? '#D1FAE5' : patientsAhead <= 2 ? '#FEF3C7' : '#F3F0FF';
  const dateLabel = appointment?.date ? moment(appointment.date).format('ddd, DD MMM YYYY') : '';
  const timeLabel = appointment?.timeSlot || '';
  const displayName = isLab ? appointment.testName : (appointment?.doctor?.name || 'Doctor');
  const displaySpec = isLab ? (appointment.room || 'Room 01') : (appointment?.doctor?.specialization || 'Consultation');
  const displayHospital = isLab ? 'Laboratory' : (appointment?.doctor?.hospital || '');

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.queueCardOuter}>
      <LinearGradient
        colors={isLab ? (isYourTurn ? ['#2563EB', '#1D4ED8'] : ['#3B82F6', '#2563EB']) : (isYourTurn ? ['#065F46', '#10B981'] : ['#5F0FFF', '#8B3DFF'])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.queueCardGradient}
      >
        {/* Top Row: Doctor/Lab Info + Live Status Pill */}
        <View style={styles.queueCardTopRow}>
          <View style={styles.queueDoctorInfo}>
            <View style={[styles.queueDoctorAvatar, isLab && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              {isLab ? (
                <FlaskConical size={20} color="#FFFFFF" />
              ) : (
                <Stethoscope size={20} color="#FFFFFF" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.queueDoctorName} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.queueDoctorSpec} numberOfLines={1}>
                {displaySpec}{displayHospital ? `  •  ${displayHospital}` : ''}
              </Text>
            </View>
          </View>
          <View style={[styles.livePill, isYourTurn && styles.livePillYourTurn]}>
            <View style={[styles.liveDot, isYourTurn && styles.liveDotYourTurn]} />
            <Text style={[styles.livePillText, isYourTurn && styles.livePillTextYourTurn]}>
              {isYourTurn ? 'YOUR TURN' : 'LIVE'}
            </Text>
          </View>
        </View>

        {/* Big Queue Number Section */}
        <View style={styles.queueNumberSection}>
          <View>
            <Text style={styles.queueLabel}>Your Queue Number</Text>
            <Text style={styles.queueSubLabel}>{dateLabel}  •  {timeLabel}</Text>
          </View>
          <Animated.View style={[styles.queueNumberCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.queueNumberHash}>#</Text>
            <Text style={styles.queueNumberDigit}>{queueNumber}</Text>
          </Animated.View>
        </View>

        {/* Divider */}
        <View style={styles.queueDivider} />

        {/* Live Metrics Row */}
        <View style={styles.queueMetricsRow}>
          <View style={styles.queueMetric}>
            <View style={styles.queueMetricIconWrap}>
              <Users size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.queueMetricValue}>{patientsAhead}</Text>
            <Text style={styles.queueMetricLabel}>Ahead</Text>
          </View>

          <View style={styles.queueMetricDivider} />

          <View style={styles.queueMetric}>
            <View style={styles.queueMetricIconWrap}>
              <Activity size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.queueMetricValue}>{currentlyServing}</Text>
            <Text style={styles.queueMetricLabel}>Now Serving</Text>
          </View>

          <View style={styles.queueMetricDivider} />

          <View style={styles.queueMetric}>
            <View style={styles.queueMetricIconWrap}>
              <Hourglass size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.queueMetricValue}>{totalInSlot}</Text>
            <Text style={styles.queueMetricLabel}>In Slot</Text>
          </View>
        </View>

        {/* Estimated Wait Banner */}
        <View style={[styles.waitBanner, { backgroundColor: statusBg }]}>
          <Hourglass size={14} color={statusColor} />
          <Text style={[styles.waitBannerText, { color: statusColor }]}>{waitLabel}</Text>
          {lastRefresh && (
            <Text style={styles.refreshLabel}>
              · Updated {moment(lastRefresh).format('HH:mm:ss')}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// =============================================================
//  QueueLabAppointmentCard
//  Beautifully redesigned card for lab tests that matches
//  the size and layout structure of doctor queue cards,
//  using a vibrant teal gradient.
// =============================================================
const QueueLabAppointmentCard = ({
  appointment,
  onPress
}: {
  appointment: any;
  onPress: () => void;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const queueNumber = appointment?.queueNumber ?? '—';
  const status = appointment?.status || 'Pending';
  const method = appointment?.collectionMethod || 'Hospital';
  const payment = appointment?.paymentStatus || 'Pending';

  const dateLabel = appointment?.date ? moment(appointment.date).format('ddd, DD MMM YYYY') : '';
  const timeLabel = appointment?.timeSlot || '';
  const testName = appointment?.testName || 'Lab Test';
  const roomLabel = appointment?.room || 'Room 01';

  const isConfirmed = status.toLowerCase() === 'confirmed';
  const isPending = status.toLowerCase() === 'pending';

  const pillBgColor = isConfirmed
    ? 'rgba(16, 185, 129, 0.25)'
    : isPending
      ? 'rgba(245, 158, 11, 0.35)'
      : 'rgba(255, 255, 255, 0.25)';

  const dotColor = isConfirmed
    ? '#10B981'
    : isPending
      ? '#F59E0B'
      : '#FFFFFF';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.queueCardOuter}>
      <LinearGradient
        colors={['#0F766E', '#14B8A6']} // Premium Teal/Turquoise gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.queueCardGradient}
      >
        {/* Top Row: Lab Info + Live Status Pill */}
        <View style={styles.queueCardTopRow}>
          <View style={styles.queueDoctorInfo}>
            <View style={styles.queueDoctorAvatar}>
              <FlaskConical size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.queueDoctorName} numberOfLines={1}>{testName}</Text>
              <Text style={styles.queueDoctorSpec} numberOfLines={1}>
                Lab Test  •  {roomLabel}
              </Text>
            </View>
          </View>
          <View style={[styles.livePill, { backgroundColor: pillBgColor }]}>
            <View style={[styles.liveDot, { backgroundColor: dotColor }]} />
            <Text style={styles.livePillText}>
              {status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Big Queue Number Section */}
        <View style={styles.queueNumberSection}>
          <View>
            <Text style={styles.queueLabel}>Your Token Number</Text>
            <Text style={styles.queueSubLabel}>{dateLabel}  •  {timeLabel}</Text>
          </View>
          <Animated.View style={[styles.queueNumberCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.queueNumberHash}>#</Text>
            <Text style={styles.queueNumberDigit}>{queueNumber}</Text>
          </Animated.View>
        </View>

        {/* Divider */}
        <View style={styles.queueDivider} />

        {/* Live Metrics Row */}
        <View style={styles.queueMetricsRow}>
          <View style={styles.queueMetric}>
            <View style={styles.queueMetricIconWrap}>
              <Activity size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.queueMetricValue}>{status}</Text>
            <Text style={styles.queueMetricLabel}>Status</Text>
          </View>

          <View style={styles.queueMetricDivider} />

          <View style={styles.queueMetric}>
            <View style={styles.queueMetricIconWrap}>
              <Home size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.queueMetricValue}>{method === 'Home' ? 'Home' : 'Lab'}</Text>
            <Text style={styles.queueMetricLabel}>Method</Text>
          </View>

          <View style={styles.queueMetricDivider} />

          <View style={styles.queueMetric}>
            <View style={styles.queueMetricIconWrap}>
              <Wallet size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.queueMetricValue}>{payment}</Text>
            <Text style={styles.queueMetricLabel}>Payment</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const isApptExpiredFrontend = (apptDateStr: string, timeSlotStr: string) => {
  if (!apptDateStr) return true;
  if (!timeSlotStr) return false;

  try {
    let timePart = timeSlotStr;
    if (timeSlotStr.includes('-')) {
      timePart = timeSlotStr.split('-')[1].trim();
    }

    let hours = 0;
    let minutes = 0;
    const match = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    } else {
      const match24 = timePart.match(/(\d{1,2}):(\d{2})/);
      if (match24) {
        hours = parseInt(match24[1], 10);
        minutes = parseInt(match24[2], 10);
      }
    }

    const apptDateLocal = moment(apptDateStr).startOf('day');
    apptDateLocal.hours(hours);
    apptDateLocal.minutes(minutes);
    apptDateLocal.seconds(0);
    apptDateLocal.milliseconds(0);

    return moment().isAfter(apptDateLocal);
  } catch (err) {
    console.error('Error checking expiry in frontend:', err);
    return false;
  }
};

const PatientDashboard = () => {
  const navigation = useNavigation<PatientDashboardProp>();
  const isLoggingOut = useRef(false);
  const { token } = useAuth();
  const [patientName, setPatientName] = useState('Patient');
  const [patientFullName, setPatientFullName] = useState('Patient Name');
  const [patientEmail, setPatientEmail] = useState('patient@example.com');
  const [patientPhoto, setPatientPhoto] = useState('');
  const [activeAppointmentTab, setActiveAppointmentTab] = useState<'Doctor' | 'Lab'>('Doctor');

  const [upcomingDoctorAppointments, setUpcomingDoctorAppointments] = useState<any[]>([]);
  const [upcomingLabAppointments, setUpcomingLabAppointments] = useState<any[]>([]);
  const [liveQueue, setLiveQueue] = useState<any[]>([]);
  const [lastQueueRefresh, setLastQueueRefresh] = useState<Date | null>(null);

  // Lab Availability
  const [labCategories, setLabCategories] = useState<any[]>([]);
  const [labSlotCounts, setLabSlotCounts] = useState<{ [catId: string]: number }>({});
  const [labSlotsLoading, setLabSlotsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchQueue = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/patient/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (res.ok && json.success) {
            const startOfToday = moment().startOf('day');
            const endOfTwoDays = moment().add(2, 'days').endOf('day');
            const filterNextTwoDays = (appts: any[]) => {
              if (!appts) return [];
              return appts.filter(appt => {
                const dateInRange = moment(appt.date).isBetween(startOfToday, endOfTwoDays, null, '[]');
                if (!dateInRange) return false;
                return !isApptExpiredFrontend(appt.date, appt.timeSlot);
              });
            };
            const filterUnique = (appts: any[]) => {
              const seen = new Set();
              return appts.filter(a => {
                if (!a || !a._id) return true;
                const dup = seen.has(a._id);
                seen.add(a._id);
                return !dup;
              });
            };
            setUpcomingDoctorAppointments(filterUnique(filterNextTwoDays(json.data.doctorAppointments)));
            setUpcomingLabAppointments(filterUnique(filterNextTwoDays(json.data.labAppointments)));
            setLiveQueue(json.data.liveQueue || []);
            setLastQueueRefresh(new Date());
          }
        } catch (e) {
          console.error('Queue fetch error:', e);
        }
      };
      if (token) {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000);
        return () => clearInterval(interval);
      }
    }, [token])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchLabAvailability = async () => {
        setLabSlotsLoading(true);
        try {
          const today = moment().format('YYYY-MM-DD');
          const [catsRes, labsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/labs/categories`),
            fetch(`${API_BASE_URL}/api/labs?limit=100`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);
          const catsData = await catsRes.json();
          const labsData = await labsRes.json();
          if (!catsData.success || !labsData.success) return;
          const cats = catsData.data || [];
          const labs = labsData.data || [];
          setLabCategories(cats);
          // For each category, sum available slots across all labs in that category
          const counts: { [catId: string]: number } = {};
          await Promise.all(cats.map(async (cat: any) => {
            const catLabs = labs.filter((l: any) => {
              const catId = l.category?._id || l.category;
              return catId?.toString() === cat._id?.toString();
            });
            let total = 0;
            await Promise.all(catLabs.map(async (lab: any) => {
              try {
                const r = await fetch(`${API_BASE_URL}/api/labs/${lab._id}/schedule?date=${today}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                const d = await r.json();
                if (r.ok && d.success) {
                  const slots: any[] = d.data || [];
                  total += slots.filter((s: any) => (s.booked || 0) < s.maxPatients).length;
                }
              } catch (_) { }
            }));
            counts[cat._id] = total;
          }));
          setLabSlotCounts(counts);
        } catch (e) {
          console.error('Lab availability fetch error:', e);
        } finally {
          setLabSlotsLoading(false);
        }
      };
      if (token) fetchLabAvailability();
    }, [token])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (response.ok && data) {
            setPatientName(data.name ? data.name.split(' ')[0] : 'Patient');
            setPatientFullName(data.name || 'Patient Name');
            setPatientEmail(data.email || 'patient@example.com');
            setPatientPhoto(data.photo || '');
          }
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      };
      if (token) {
        fetchProfile();
      }
    }, [token])
  );



  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
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


  const [moreModalVisible, setMoreModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);


  const [aiCardPressed, setAiCardPressed] = useState(false);
  const [aiCardHovered, setAiCardHovered] = useState(false);
  const aiCardScale = useRef(new Animated.Value(1)).current;
  const aiCardLift = useRef(new Animated.Value(0)).current;
  const aiGlowPulse = useRef(new Animated.Value(0.75)).current;

  // Menu Animation & PanResponder
  const menuAnimX = useRef(new Animated.Value(-width * 0.75)).current;

  const overlayOpacity = menuAnimX.interpolate({
    inputRange: [-width * 0.75, 0],
    outputRange: [0, 0.5],
    extrapolate: 'clamp'
  });

  const closeMenu = () => {
    Animated.spring(menuAnimX, {
      toValue: -width * 0.75,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start(() => {
      setMenuModalVisible(false);
    });
  };

  const openMenu = () => {
    setMenuModalVisible(true);
    menuAnimX.setValue(-width * 0.75);
    Animated.spring(menuAnimX, {
      toValue: 0,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start();
  };

  const menuPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => {
        return gestureState.dx < -15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        menuAnimX.setOffset((menuAnimX as any)._value);
        menuAnimX.setValue(0);
      },
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dx < 0) {
          menuAnimX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        menuAnimX.flattenOffset();
        if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          closeMenu();
        } else {
          Animated.spring(menuAnimX, {
            toValue: 0,
            damping: 20,
            stiffness: 90,
            useNativeDriver: true,
          }).start();
        }
      }
    })
  ).current;

  // Reminder state — based on actual fetched appointments
  const [reminderVisible, setReminderVisible] = useState(false);
  const [reminderMsg, setReminderMsg] = useState('');

  useEffect(() => {
    const computeApptMs = (appt: any): number | null => {
      if (!appt || !appt.date) return null;
      const dateStr = moment(appt.date).format('YYYY-MM-DD');
      const timeStr: string = appt.timeSlot || '';
      // Try parsing timeSlot like "10:30 AM" or "14:30"
      let time24 = timeStr;
      const m12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (m12) {
        let h = parseInt(m12[1], 10);
        const min = m12[2];
        const ampm = m12[3].toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        time24 = `${String(h).padStart(2, '0')}:${min}`;
      }
      const combined = moment(`${dateStr} ${time24}`, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD h:mm A']).valueOf();
      return isNaN(combined) ? null : combined;
    };

    const checkReminders = () => {
      const now = Date.now();
      let reminderFound = false;

      // Check Lab Appointments
      for (const appt of upcomingLabAppointments) {
        const ms = computeApptMs(appt);
        if (ms !== null) {
          const diff = ms - now;
          if (diff > 0 && diff <= 30 * 60 * 1000) {
            setReminderMsg('Your Lab Appointment is coming up in 30 minutes!');
            setReminderVisible(true);
            reminderFound = true;
            break;
          }
        }
      }

      if (!reminderFound) {
        // Check Doctor Appointments
        for (const appt of upcomingDoctorAppointments) {
          const ms = computeApptMs(appt);
          if (ms !== null) {
            const diff = ms - now;
            if (diff > 0 && diff <= 30 * 60 * 1000) {
              setReminderMsg('Your Doctor Appointment is coming up in 30 minutes!');
              setReminderVisible(true);
              reminderFound = true;
              break;
            }
          }
        }
      }

      if (!reminderFound) {
        setReminderVisible(false);
      }
    };

    checkReminders();
    const timer = setInterval(checkReminders, 30000);
    return () => clearInterval(timer);
  }, [upcomingDoctorAppointments, upcomingLabAppointments]);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(aiGlowPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(aiGlowPulse, {
          toValue: 0.65,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [aiGlowPulse]);

  const handleAiCardHoverIn = () => {
    setAiCardHovered(true);
    Animated.timing(aiCardLift, {
      toValue: -4,
      duration: 160,
      useNativeDriver: true,
    }).start();
  };

  const handleAiCardHoverOut = () => {
    setAiCardHovered(false);
    Animated.timing(aiCardLift, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  };

  const handleAiCardPressIn = () => {
    setAiCardPressed(true);
    Animated.spring(aiCardScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handleAiCardPressOut = () => {
    setAiCardPressed(false);
    Animated.spring(aiCardScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => {
        // Trigger only if dragging moves more than a few pixels to allow normal onPress
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Purple Top Background Section */}
        <LinearGradient
          colors={COLORS.screenHeaderGradient}
          style={styles.topPurpleBackground}
        >
          {/* Header */}
          <StaggeredView delay={100}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.menuIconBtn}
                onPress={openMenu}
              >
                <View style={styles.hamburgerLine} />
                <View style={[styles.hamburgerLine, { width: 18 }]} />
                <View style={styles.hamburgerLine} />
              </TouchableOpacity>

              <View style={styles.headerTextContainer}>
                <Text style={styles.greeting} numberOfLines={1}>Hello, {patientName} 👋</Text>
                <Text style={styles.subGreeting}>Take care of your health</Text>
              </View>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerActionButton}
                  onPress={() => setAppointmentModalVisible(true)}
                >
                  <Calendar size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.headerActionButton, { marginLeft: 10 }]}>
                  <Bell size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.headerActionButton, { marginLeft: 10 }]}
                  onPress={() => {
                    isLoggingOut.current = true;
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'SignIn', params: { role: 'patient' } }],
                    });
                  }}
                >
                  <LogOut size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </StaggeredView>

          {/* Search Bar */}
          <StaggeredView delay={200}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#9CA3AF" />
              <Text style={styles.searchPlaceholder}>Search doctors, hospitals, tests...</Text>
            </View>
          </StaggeredView>

          {/* Appointment Reminder Alert */}
          {reminderVisible && (
            <TouchableOpacity
              style={styles.reminderBanner}
              onPress={() => setReminderVisible(false)}
            >
              <AlertCircle size={24} color={COLORS.error} />
              <Text style={styles.reminderText}>{reminderMsg}</Text>
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}

          {/* AI Health Assistant Card */}
          <StaggeredView delay={300}>
            <Pressable
              onPressIn={handleAiCardPressIn}
              onPressOut={handleAiCardPressOut}
            >
              <Animated.View
                style={[
                  {
                    transform: [{ scale: aiCardScale }, { translateY: aiCardLift }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F7F2FF']}
                  style={[
                    styles.aiCard,
                    aiCardPressed ? styles.aiCardPressed : null,
                    aiCardHovered ? styles.aiCardHovered : null
                  ]}
                >
                  <View style={styles.aiCardContent}>
                    <Text style={styles.aiCardTitle}>AI Health Assistant</Text>
                    <Text style={styles.aiCardText}>Check your symptoms and get{'\n'}AI health suggestions</Text>
                    <TouchableOpacity
                      style={styles.aiCardBtn}
                      onPress={() => navigation.navigate('AIHealthAssistant')}
                    >
                      <Text style={styles.aiCardBtnText}>Check Now</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.aiCardImageContainer}>
                    <Animated.View style={[styles.aiCardGlowWrap, { opacity: aiGlowPulse }]}>
                      <LinearGradient
                        colors={['rgba(89, 58, 202, 0.56)', 'rgba(126, 69, 232, 0.14)']}
                        style={styles.aiCardImageGlow}
                      />
                    </Animated.View>
                    <Image
                      source={require('../../../assets/bot2.jpg')}
                      style={styles.aiCardImage}
                      resizeMode="contain"
                    />
                  </View>
                </LinearGradient>
              </Animated.View>
            </Pressable>
          </StaggeredView>
        </LinearGradient>

        {/* Bottom White Section */}
        <View style={styles.whiteCurveContainer}>

          {/* Specialties Categories */}
          <StaggeredView delay={400}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('SpecialtyDoctors', { specialty: 'Cardiology' })}>
                <View style={[styles.categoryIconWrap, { backgroundColor: '#FFF1F2' }]}>
                  <Heart size={28} color="#E11D48" fill="#E11D48" />
                </View>
                <Text style={styles.categoryText}>Cardiology</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('SpecialtyDoctors', { specialty: 'Paediatrics' })}>
                <View style={[styles.categoryIconWrap, { backgroundColor: '#E0F2FE' }]}>
                  <Baby size={28} color="#0EA5E9" />
                </View>
                <Text style={styles.categoryText}>Paediatrics</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('SpecialtyDoctors', { specialty: 'Urology' })}>
                <View style={[styles.categoryIconWrap, { backgroundColor: '#F0FDF4' }]}>
                  <Droplets size={28} color="#22C55E" />
                </View>
                <Text style={styles.categoryText}>Urology</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('SpecialtyDoctors', { specialty: 'Oncology' })}>
                <View style={[styles.categoryIconWrap, { backgroundColor: '#FFF7ED' }]}>
                  <Dna size={28} color="#F97316" />
                </View>
                <Text style={styles.categoryText}>Oncology</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('SpecialtyDoctors', { specialty: 'Dermatology' })}>
                <View style={[styles.categoryIconWrap, { backgroundColor: '#F5F3FF' }]}>
                  <Sparkles size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.categoryText}>Dermatology</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('SpecialtyDoctors', { specialty: 'Neurology' })}>
                <View style={[styles.categoryIconWrap, { backgroundColor: '#FDF2F8' }]}>
                  <Brain size={28} color="#DB2777" />
                </View>
                <Text style={styles.categoryText}>Neurology</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('SpecialtyDoctors', { specialty: 'Orthopedics' })}>
                <View style={[styles.categoryIconWrap, { backgroundColor: '#F1F5F9' }]}>
                  <Bone size={28} color="#475569" />
                </View>
                <Text style={styles.categoryText}>Orthopedics</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('SpecialtyDoctors', { specialty: 'Ophthalmology' })}>
                <View style={[styles.categoryIconWrap, { backgroundColor: '#FFF7ED' }]}>
                  <Eye size={28} color="#EA580C" />
                </View>
                <Text style={styles.categoryText}>Ophthalmology</Text>
              </TouchableOpacity>

            </ScrollView>
          </StaggeredView>

          {/* Upcoming Appointments Main Section */}
          <View style={[styles.sectionHeader, { marginTop: 5, marginBottom: 15 }]}>
            <Text style={[styles.sectionTitle, { fontSize: 18, color: '#000000' }]}>Upcoming Appointments</Text>
          </View>

          {/* Custom Segmented Control */}
          <View style={styles.appointmentTabsContainer}>
            <TouchableOpacity
              style={[styles.appointmentTab, activeAppointmentTab === 'Doctor' && styles.activeAppointmentTab]}
              onPress={() => setActiveAppointmentTab('Doctor')}
            >
              <Text style={[styles.appointmentTabText, activeAppointmentTab === 'Doctor' && styles.activeAppointmentTabText]}>Doctor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.appointmentTab, activeAppointmentTab === 'Lab' && styles.activeAppointmentTab]}
              onPress={() => setActiveAppointmentTab('Lab')}
            >
              <Text style={[styles.appointmentTabText, activeAppointmentTab === 'Lab' && styles.activeAppointmentTabText]}>Lab Test</Text>
            </TouchableOpacity>
          </View>

          {activeAppointmentTab === 'Doctor' ? (
            upcomingDoctorAppointments.length > 0 ? (
              <View style={styles.appointmentSubSection}>
                {upcomingDoctorAppointments.map((appt, idx) => (
                  <View key={idx} style={{ marginBottom: 15 }}>
                    <QueueAppointmentCard
                      appointment={appt}
                      queueInfo={liveQueue.find((q) => q.appointmentId === appt._id)}
                      onPress={() => navigation.navigate('PatientAppointments')}
                      lastRefresh={lastQueueRefresh}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.mainAppointmentCard, SHADOWS.small, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
                <Text style={{ color: COLORS.textSecondary, fontWeight: '500' }}>No upcoming doctor appointments in next 2 days</Text>
              </View>
            )
          ) : (
            upcomingLabAppointments.length > 0 ? (
              <View style={styles.appointmentSubSection}>
                {upcomingLabAppointments.map((appt, idx) => (
                  <View key={idx} style={{ marginBottom: 15 }}>
                    <QueueAppointmentCard
                      appointment={appt}
                      queueInfo={liveQueue.find((q) => q.appointmentId === appt._id)}
                      onPress={() => navigation.navigate('PatientAppointments')}
                      lastRefresh={lastQueueRefresh}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.mainAppointmentCard, SHADOWS.small, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
                <Text style={{ color: COLORS.textSecondary, fontWeight: '500' }}>No upcoming lab appointments in next 2 days</Text>
              </View>
            )
          )}

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('DoctorAvailability', {})}>
              <View style={[styles.quickActionIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <User size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.quickActionText}>Find Doctor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('LabAvailability')}>
              <View style={[styles.quickActionIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <FlaskConical size={24} color="#10B981" />
              </View>
              <Text style={styles.quickActionText}>Book Lab Test</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem}>
              <View style={[styles.quickActionIconWrap, { backgroundColor: '#F5F3FF' }]}>
                <FileEdit size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Health Records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => setMoreModalVisible(true)}
            >
              <View style={styles.quickActionIconWrap}>
                <MoreHorizontal size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>More</Text>
            </TouchableOpacity>
          </View>

          {/* Lab Availability Section */}
          <View style={{ marginTop: 28, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={[styles.sectionTitle, { fontSize: 18, color: '#000000' }]}>Lab Availability</Text>
              <TouchableOpacity onPress={() => navigation.navigate('LabAvailability')}>
                <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 13 }}>See All</Text>
              </TouchableOpacity>
            </View>

            {labSlotsLoading ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>Loading availability...</Text>
              </View>
            ) : labCategories.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 20, backgroundColor: '#F8F9FA', borderRadius: 16 }}>
                <FlaskConical size={32} color="#CBD5E1" />
                <Text style={{ color: COLORS.textSecondary, marginTop: 8, fontSize: 13 }}>No lab categories found</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 2, paddingBottom: 4 }}>
                {labCategories.map((cat: any) => {
                  const slotCount = labSlotCounts[cat._id] ?? null;
                  const hasSlots = slotCount !== null && slotCount > 0;
                  const catIcons: { [key: string]: string } = {
                    'Blood Test': '🩸', 'Urine Test': '🧪', 'Diabetes': '🍬',
                    'Heart': '❤️', 'Liver': '🧬', 'Pregnancy': '🤰',
                    'X-Ray': '🦴', 'MRI': '🧲', 'CT Scan': '📡', 'Ultrasound': '🔊'
                  };
                  const emoji = catIcons[cat.name] || '🔬';
                  return (
                    <TouchableOpacity
                      key={cat._id}
                      style={{
                        width: 130,
                        marginRight: 12,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        padding: 14,
                        shadowColor: '#8B3DFF',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        elevation: 4,
                        borderWidth: hasSlots ? 1.5 : 1,
                        borderColor: hasSlots ? '#A78BFA' : '#E5E7EB',
                      }}
                      onPress={() => navigation.navigate('LabAvailability')}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 6 }} numberOfLines={2}>
                        {cat.name}
                      </Text>
                      {slotCount === null ? (
                        <View style={{ backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600' }}>Checking...</Text>
                        </View>
                      ) : hasSlots ? (
                        <View style={{ backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: 10, color: '#10B981', fontWeight: '700' }}>✓ {slotCount} slot{slotCount !== 1 ? 's' : ''} today</Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600' }}>No slots today</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar />

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fabWrapper,
          { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.fab, SHADOWS.medium]}
          onPress={() => navigation.navigate('AvailabilitySelection')}
        >
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Side Menu Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={menuModalVisible}
        onRequestClose={closeMenu}
      >
        <View style={styles.menuOverlay}>
          <Animated.View style={[styles.menuDismissArea, { opacity: overlayOpacity }]}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={closeMenu}
            />
          </Animated.View>
          <Animated.View
            style={[styles.menuContent, { transform: [{ translateX: menuAnimX }] }]}
            {...menuPanResponder.panHandlers}
          >
            <LinearGradient
              colors={['#8B3DFF', '#5F0FFF']}
              style={styles.menuHeader}
            >
              <TouchableOpacity
                style={styles.menuCloseBtn}
                onPress={closeMenu}
              >
                <X size={24} color="#FFF" />
              </TouchableOpacity>

              <Image
                source={patientPhoto ? { uri: `${API_BASE_URL}${patientPhoto}` } : require('../../../assets/signup-image2.png')}
                style={styles.menuAvatar}
              />
              <Text style={styles.menuUserName}>{patientFullName}</Text>
              <Text style={styles.menuUserEmail}>{patientEmail}</Text>

              <View style={styles.membershipBadge}>
                <Sparkles size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.membershipText}>Premium Member</Text>
              </View>
            </LinearGradient>

            <View style={styles.menuItemsContainer}>
              <ScrollView style={styles.menuItemsList} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModalVisible(false); menuAnimX.setValue(-width * 0.75); navigation.navigate('PatientDashboard'); }}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#F3F0FF' }]}>
                    <Home size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuItemText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModalVisible(false); menuAnimX.setValue(-width * 0.75); navigation.navigate('PatientAppointments'); }}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#E0F2FE' }]}>
                    <Calendar size={20} color="#0EA5E9" />
                  </View>
                  <Text style={styles.menuItemText}>My Appointments</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModalVisible(false); menuAnimX.setValue(-width * 0.75); navigation.navigate('AIHealthAssistant'); }}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#FDF2F8' }]}>
                    <Heart size={20} color="#DB2777" />
                  </View>
                  <Text style={styles.menuItemText}>AI Health Assistant</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModalVisible(false); menuAnimX.setValue(-width * 0.75); navigation.navigate('AvailabilitySelection'); }}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#FEF9C3' }]}>
                    <Clock size={20} color="#CA8A04" />
                  </View>
                  <Text style={styles.menuItemText}>Availability</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModalVisible(false); menuAnimX.setValue(-width * 0.75); navigation.navigate('Reports'); }}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <FileText size={20} color="#10B981" />
                  </View>
                  <Text style={styles.menuItemText}>Reports</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModalVisible(false); menuAnimX.setValue(-width * 0.75); navigation.navigate('PatientProfile'); }}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#FFF7ED' }]}>
                    <User size={20} color="#F97316" />
                  </View>
                  <Text style={styles.menuItemText}>My Profile</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuModalVisible(false); menuAnimX.setValue(-width * 0.75); navigation.navigate('Settings'); }}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#F9FAFB' }]}>
                    <Settings size={20} color="#6B7280" />
                  </View>
                  <Text style={styles.menuItemText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#F9FAFB' }]}>
                    <LifeBuoy size={20} color="#6B7280" />
                  </View>
                  <Text style={styles.menuItemText}>Help & Support</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuItem, { marginTop: 5 }]}
                  onPress={() => {
                    closeMenu();
                    isLoggingOut.current = true;
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'SignIn', params: { role: 'patient' } }],
                    });
                  }}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                    <LogOut size={20} color="#EF4444" />
                  </View>
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Logout</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />
              </ScrollView>
            </View>

            <Text style={styles.menuVersion}>Version 1.0.2 (Beta)</Text>
          </Animated.View>
        </View>
      </Modal>

      {/* Appointments Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={appointmentModalVisible}
        onRequestClose={() => setAppointmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Calendar size={24} color={COLORS.primary} />
                <Text style={[styles.modalTitle, { marginLeft: 10 }]}>My Schedule</Text>
              </View>
              <TouchableOpacity onPress={() => setAppointmentModalVisible(false)}>
                <X size={24} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.scheduleSectionTitle}>Doctor Appointments</Text>
              <View style={styles.scheduleItem}>
                <View style={[styles.scheduleIconWrap, { backgroundColor: '#E0F2FE' }]}>
                  <Stethoscope size={20} color="#0EA5E9" />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleName}>Dr. Emma Watson</Text>
                  <Text style={styles.scheduleType}>Cardiologist • Room 204</Text>
                  <Text style={styles.scheduleTime}>20 May 2024 • 10:30 AM</Text>
                </View>
              </View>

              <Text style={[styles.scheduleSectionTitle, { marginTop: 20 }]}>Lab Tests</Text>
              <View style={styles.scheduleItem}>
                <View style={[styles.scheduleIconWrap, { backgroundColor: '#F3F0FF' }]}>
                  <FlaskConical size={20} color={COLORS.primary} />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleName}>Lab 01 (CBC Test)</Text>
                  <Text style={styles.scheduleType}>2nd Floor • Hospital Visit</Text>
                  <Text style={styles.scheduleTime}>22 May 2024 • 09:00 AM</Text>
                </View>
              </View>

              <View style={styles.scheduleItem}>
                <View style={[styles.scheduleIconWrap, { backgroundColor: '#FDF2F8' }]}>
                  <FlaskConical size={20} color="#DB2777" />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleName}>Lab 05 (Urine Analysis)</Text>
                  <Text style={styles.scheduleType}>3rd Floor • Home Collection</Text>
                  <Text style={styles.scheduleTime}>25 May 2024 • 08:30 AM</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* More Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={moreModalVisible}
        onRequestClose={() => setMoreModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalDismissArea}
            onPress={() => setMoreModalVisible(false)}
          />
          <Animated.View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>More Services</Text>
              <TouchableOpacity
                onPress={() => setMoreModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={24} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalGrid}>
              <TouchableOpacity style={styles.modalGridItem}>
                <View style={[styles.modalIconWrap, { backgroundColor: '#E0F2FE' }]}>
                  <Pill size={28} color="#0EA5E9" />
                </View>
                <Text style={styles.modalIconText}>Pharmacy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalGridItem}>
                <View style={[styles.modalIconWrap, { backgroundColor: '#FEF2F2' }]}>
                  <Truck size={28} color="#EF4444" />
                </View>
                <Text style={styles.modalIconText}>Ambulance</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalGridItem}>
                <View style={[styles.modalIconWrap, { backgroundColor: '#F0FDF4' }]}>
                  <Activity size={28} color="#22C55E" />
                </View>
                <Text style={styles.modalIconText}>Blood Bank</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalGridItem}>
                <View style={[styles.modalIconWrap, { backgroundColor: '#FFF7ED' }]}>
                  <Shield size={28} color="#F97316" />
                </View>
                <Text style={styles.modalIconText}>Insurance</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalGridItem}>
                <View style={[styles.modalIconWrap, { backgroundColor: '#F5F3FF' }]}>
                  <Stethoscope size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.modalIconText}>Telemedicine</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalGridItem}>
                <View style={[styles.modalIconWrap, { backgroundColor: '#FDF2F8' }]}>
                  <LifeBuoy size={28} color="#DB2777" />
                </View>
                <Text style={styles.modalIconText}>Support</Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={styles.modalGridItem}
                onPress={() => {
                  setMoreModalVisible(false);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'SignIn', params: { role: 'patient' } }],
                  });
                }}
              >
                <View style={[styles.modalIconWrap, { backgroundColor: '#FFF1F2' }]}>
                  <LogOut size={28} color="#E11D48" />
                </View>
                <Text style={styles.modalIconText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    paddingBottom: 120
  },
  topPurpleBackground: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 24,
    paddingBottom: 60, // Extra padding for the white curve overlay
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  profileImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  logoutButtonSpacing: {
    marginLeft: 10,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4
  },
  reminderBanner: {
    marginHorizontal: 24,
    marginTop: 10,
    backgroundColor: '#FFF2F2',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCCACA',
  },
  reminderText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  // Menu Icon Styles
  menuIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginRight: 15,
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  // Side Menu Styles
  menuOverlay: {
    flex: 1,
  },
  menuDismissArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  menuContent: {
    width: width * 0.75,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
    overflow: 'hidden',
  },
  menuHeader: {
    padding: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    alignItems: 'center',
    paddingBottom: 35,
    overflow: 'hidden',
  },
  menuItemsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -30, // Overlap the purple header
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    paddingTop: 10,
  },
  menuCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 15,
  },
  menuUserName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  menuUserEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 15,
    gap: 6,
  },
  membershipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuItemsList: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 15,
  },
  menuVersion: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  appointmentTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  appointmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeAppointmentTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeAppointmentTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  appointmentSubSection: {
    marginBottom: 5,
  },
  appointmentSubTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginLeft: 4,
  },
  mainAppointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  mainAppIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainAppInfo: {
    flex: 1,
    marginLeft: 16,
  },
  mainAppTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 4,
  },
  mainAppSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchPlaceholder: {
    marginLeft: 12,
    color: COLORS.textSecondary,
    fontSize: 14
  },
  aiCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 140,
    borderWidth: 1,
    borderColor: 'rgba(114, 76, 249, 0.14)',
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  aiCardPressed: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  aiCardHovered: {
    borderColor: 'rgba(123, 47, 247, 0.32)',
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 9 },
    elevation: 10,
  },
  aiCardContent: {
    flex: 1,
    zIndex: 2,
    marginRight: 100
  },
  aiCardTitle: {
    color: '#342350',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6
  },
  aiCardText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 16
  },
  aiCardBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start'
  },
  aiCardBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  aiCardImageContainer: {
    width: 140,
    height: 140,
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  aiCardGlowWrap: {
    position: 'absolute',
  },
  aiCardImageGlow: {
    position: 'absolute',
    width: 200,
    height: 180,
    borderRadius: 70,
    opacity: 0.98,
  },
  aiCardImage: {
    width: 142,
    height: 170,
    zIndex: 0,
  },
  whiteCurveContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30, // Pulls the white section up over the purple background
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  categoriesContainer: {
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 10
  },
  categoryIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader
  },
  viewAll: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  docAvatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 14,
    backgroundColor: '#EEE'
  },
  docInfo: {
    flex: 1
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 4
  },
  docSpecialty: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6
  },
  docTime: {
    fontSize: 11,
    color: COLORS.textMain,
    fontWeight: '600'
  },
  calendarIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  infoCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  infoCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  infoCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600'
  },
  smallArrowIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoCardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12
  },
  infoCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  infoCardSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '500'
  },
  infoCardSubtextSmall: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    width: '23%'
  },
  quickActionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMain,
    textAlign: 'center'
  },
  navText: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 100, // Just above the bottom nav
    right: 20,
    zIndex: 1000,
  },
  fab: {
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 20, // slightly rounded for a square-ish look
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalGridItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  modalIconText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMain,
    textAlign: 'center',
  },
  // Schedule Modal Styles
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    gap: 16,
  },
  scheduleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  scheduleType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scheduleTime: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 6,
  },
  // =============================================================
  //  QueueAppointmentCard styles
  // =============================================================
  queueCardOuter: {
    borderRadius: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  queueCardGradient: {
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
  },
  queueCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  queueDoctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  queueDoctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueDoctorName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  queueDoctorSpec: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '600',
    marginTop: 2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  livePillYourTurn: {
    backgroundColor: '#FFFFFF',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  liveDotYourTurn: {
    backgroundColor: '#10B981',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  livePillTextYourTurn: {
    color: '#065F46',
  },
  queueNumberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  queueLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  queueSubLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '600',
    marginTop: 6,
  },
  queueNumberCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  queueNumberHash: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    marginTop: -8,
  },
  queueNumberDigit: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    marginLeft: 1,
  },
  queueDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginVertical: 16,
  },
  queueMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueMetric: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  queueMetricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  queueMetricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  queueMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  queueMetricDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  waitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
  },
  waitBannerText: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  refreshLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  }
});

export default PatientDashboard;
