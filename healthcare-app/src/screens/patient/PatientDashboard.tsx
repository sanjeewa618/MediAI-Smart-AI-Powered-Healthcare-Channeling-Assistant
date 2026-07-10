import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, Animated, PanResponder, Pressable, StatusBar, Modal, BackHandler } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { Search, Calendar, User, FileText, Activity, MoreHorizontal, Home, Heart, Shield, MessageCircle, FileEdit, FlaskConical, ChevronRight, Baby, Droplets, Sparkles, Plus, Bell, LogOut, Pill, Truck, Settings, X, LifeBuoy, Stethoscope, Dna, Brain, Bone, Eye, Smile, Wallet, Clock, AlertCircle } from 'lucide-react-native';
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

// --- Countdown Timer Helpers ---
const DOCTOR_APPT = new Date(2026, 4, 20, 10, 30, 0);  // 20 May 2026 10:30 AM
const LAB_APPT = new Date(2026, 4, 22, 8, 0, 0);  // 22 May 2026 08:00 AM

const calcCountdown = (target: Date): string => {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return 'Now!';
  const totalSec = Math.floor(diff / 1000);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600) % 24;
  const d = Math.floor(totalSec / 86400);
  const ss = String(s).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const hh = String(h).padStart(2, '0');
  if (d > 0) return `${d}d ${hh}h ${mm}m ${ss}s`;
  return `${hh}h ${mm}m ${ss}s`;
};

// Staggered Entrance Animation Wrapper
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

const PatientDashboard = () => {
  const navigation = useNavigation<PatientDashboardProp>();
  const isLoggingOut = useRef(false);
  const { token } = useAuth();
  const [patientName, setPatientName] = useState('Patient');
  const [patientFullName, setPatientFullName] = useState('Patient Name');
  const [patientEmail, setPatientEmail] = useState('patient@example.com');
  const [activeAppointmentTab, setActiveAppointmentTab] = useState<'Doctor' | 'Lab'>('Doctor');
  
  const [upcomingDoctorAppointment, setUpcomingDoctorAppointment] = useState<any>(null);
  const [upcomingLabAppointment, setUpcomingLabAppointment] = useState<any>(null);

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
          setPatientName(data.name ? data.name.split(' ')[0] : 'Patient');
          setPatientFullName(data.name || 'Patient Name');
          setPatientEmail(data.email || 'patient@example.com');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      const fetchDashboardData = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/patient/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok && data.success) {
            setUpcomingDoctorAppointment(data.data.doctorAppointments[0] || null);
            setUpcomingLabAppointment(data.data.labAppointments[0] || null);
          }
        } catch (err) {
          console.error('Failed to fetch dashboard data:', err);
        }
      };

      if (token) {
        fetchDashboardData();
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

  // Live countdown state
  const [doctorCountdown, setDoctorCountdown] = useState(() => calcCountdown(DOCTOR_APPT));
  const [labCountdown, setLabCountdown] = useState(() => calcCountdown(LAB_APPT));
  const [reminderVisible, setReminderVisible] = useState(false);
  const [reminderMsg, setReminderMsg] = useState('');

  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      const labDiff = LAB_APPT.getTime() - now;
      const docDiff = DOCTOR_APPT.getTime() - now;

      // Check for 30 minutes (1800000 ms)
      if (labDiff > 0 && labDiff <= 1800000) {
        setReminderMsg('Your Lab Appointment is coming up in 30 minutes!');
        setReminderVisible(true);
      } else if (docDiff > 0 && docDiff <= 1800000) {
        setReminderMsg('Your Doctor Appointment is coming up in 30 minutes!');
        setReminderVisible(true);
      } else {
        setReminderVisible(false);
      }
    };

    const timer = setInterval(() => {
      setDoctorCountdown(calcCountdown(DOCTOR_APPT));
      setLabCountdown(calcCountdown(LAB_APPT));
      checkReminders();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
                <Text style={styles.greeting}>Hello, {patientName} 👋</Text>
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
            upcomingDoctorAppointment ? (
              <View style={styles.appointmentSubSection}>
                <TouchableOpacity
                  style={[styles.mainAppointmentCard, SHADOWS.small]}
                  onPress={() => navigation.navigate('PatientAppointments')}
                >
                  <View style={[styles.mainAppIconWrap, { backgroundColor: '#F3F0FF' }]}>
                    <Stethoscope size={28} color={COLORS.primary} />
                  </View>
                  <View style={styles.mainAppInfo}>
                    <Text style={styles.mainAppTitle}>
                      {upcomingDoctorAppointment.doctor?.name || 'Doctor Appointment'}
                    </Text>
                    <Text style={styles.mainAppSub}>
                      {upcomingDoctorAppointment.doctor?.specialization || 'Consultation'}  •  {moment(upcomingDoctorAppointment.date).format('DD MMM')}  •  {upcomingDoctorAppointment.timeSlot || 'TBD'}
                    </Text>
                    <View style={styles.countdownPill}>
                      <Activity size={11} color={COLORS.primary} />
                      <Text style={styles.countdownText}>Upcoming</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.mainAppointmentCard, SHADOWS.small, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
                <Text style={{ color: COLORS.textSecondary, fontWeight: '500' }}>No upcoming doctor appointments</Text>
              </View>
            )
          ) : (
            upcomingLabAppointment ? (
              <View style={styles.appointmentSubSection}>
                <TouchableOpacity
                  style={[styles.mainAppointmentCard, SHADOWS.small]}
                  onPress={() => navigation.navigate('Reports')}
                >
                  <View style={[styles.mainAppIconWrap, { backgroundColor: '#ECFDF5' }]}>
                    <FlaskConical size={28} color="#10B981" />
                  </View>
                  <View style={styles.mainAppInfo}>
                    <Text style={styles.mainAppTitle}>
                      {upcomingLabAppointment.testName || 'Lab Test'}
                    </Text>
                    <Text style={styles.mainAppSub}>
                      Lab Visit  •  {moment(upcomingLabAppointment.date).format('DD MMM')}  •  {upcomingLabAppointment.timeSlot || 'TBD'}
                    </Text>
                    <View style={[styles.countdownPill, { backgroundColor: '#ECFDF5' }]}>
                      <Activity size={11} color="#10B981" />
                      <Text style={[styles.countdownText, { color: '#10B981' }]}>Upcoming</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.mainAppointmentCard, SHADOWS.small, { alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
                <Text style={{ color: COLORS.textSecondary, fontWeight: '500' }}>No upcoming lab appointments</Text>
              </View>
            )
          )}

          {/* Two Info Cards Box */}
          <View style={styles.infoCardsRow}>
            {/* Live Queue Card */}
            <LinearGradient colors={['#9333EA', '#5F0FFF']} style={styles.infoCard}>
              <View style={styles.infoCardTop}>
                <Text style={styles.infoCardTitle}>Live Queue</Text>
                <View style={styles.smallArrowIndicator}>
                  <ChevronRight size={14} color="#FFF" />
                </View>
              </View>
              <Text style={styles.infoCardNumber}>12</Text>
              <View style={styles.infoCardBottom}>
                <View>
                  <Text style={styles.infoCardSubtext}>Your Number</Text>
                  <Text style={styles.infoCardSubtextSmall}>Estimated 25 min</Text>
                </View>
                <View style={styles.iconCircle}>
                  <MessageCircle size={16} color={COLORS.primary} fill={COLORS.primary} />
                </View>
              </View>
            </LinearGradient>

            {/* Medicine Reminder Card */}
            <LinearGradient colors={['#9333EA', '#5F0FFF']} style={styles.infoCard}>
              <View style={styles.infoCardTop}>
                <Text style={styles.infoCardTitle}>Medicine Reminder</Text>
              </View>
              <Text style={styles.infoCardNumber}>2</Text>
              <View style={styles.infoCardBottom}>
                <View>
                  <Text style={styles.infoCardSubtext}>Medicines Today</Text>
                  <Text style={styles.infoCardSubtextSmall}>View All</Text>
                </View>
                <View style={styles.iconCircle}>
                  <Shield size={16} color={COLORS.primary} fill={COLORS.primary} />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('DoctorAvailability', {})}>
              <View style={[styles.quickActionIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <User size={24} color="#0EA5E9" />
              </View>
              <Text style={styles.quickActionText}>Find Doctor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('AvailabilitySelection')}>
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
                source={require('../../../assets/signup-image2.png')}
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
    fontSize: 22,
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
  }
});

export default PatientDashboard;
