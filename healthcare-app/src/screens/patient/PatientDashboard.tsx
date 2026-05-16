import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, Animated, PanResponder, Pressable, StatusBar, Modal } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { Search, Calendar, User, FileText, Activity, MoreHorizontal, Home, Heart, Shield, MessageCircle, FileEdit, FlaskConical, ChevronRight, Baby, Droplets, Sparkles, Plus, Bell, LogOut, Pill, Truck, Settings, X, LifeBuoy, Stethoscope, Dna, Brain, Bone, Eye, Smile } from 'lucide-react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

type PatientDashboardProp = StackNavigationProp<RootStackParamList, 'PatientDashboard'>;

const PatientDashboard = () => {
  const navigation = useNavigation<PatientDashboardProp>();
  const [moreModalVisible, setMoreModalVisible] = useState(false);
  const [aiCardPressed, setAiCardPressed] = useState(false);
  const [aiCardHovered, setAiCardHovered] = useState(false);
  const aiCardScale = useRef(new Animated.Value(1)).current;
  const aiCardLift = useRef(new Animated.Value(0)).current;
  const aiGlowPulse = useRef(new Animated.Value(0.75)).current;

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
          colors={['#8B3DFF', '#6A11CB', '#5F0FFF']}
          style={styles.topPurpleBackground}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={() => navigation.navigate('PatientProfile')}
            >
              <Image
                source={require('../../../assets/signup-image2.png')}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Hello, Sarah 👋</Text>
              <Text style={styles.subGreeting}>Take care of your health</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerActionButton}>
                <Bell size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerActionButton, styles.logoutButtonSpacing]}
                onPress={() => navigation.navigate('SignIn', { role: 'patient' })}
              >
                <LogOut size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>Search doctors, hospitals, tests...</Text>
          </View>

          {/* AI Health Assistant Card */}
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
        </LinearGradient>

        {/* Bottom White Section */}
        <View style={styles.whiteCurveContainer}>
          
          {/* Specialties Categories */}
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

            <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('SpecialtyDoctors', { specialty: 'Dental' })}>
              <View style={[styles.categoryIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Smile size={28} color="#059669" />
              </View>
              <Text style={styles.categoryText}>Dental</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Upcoming Appointment */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
          </View>

          <View style={styles.appointmentCard}>
            <Image 
              source={require('../../../assets/dr-emma.png')} 
              style={styles.docAvatar} 
            />
            <View style={styles.docInfo}>
              <Text style={styles.docName}>Dr. Emma Watson</Text>
              <Text style={styles.docSpecialty}>Cardiologist</Text>
              <Text style={styles.docTime}>20 May 2024 • 10:30 AM</Text>
            </View>
            <TouchableOpacity style={styles.calendarIconBtn}>
              <Calendar size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

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

            <TouchableOpacity style={styles.quickActionItem}>
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
          onPress={() => navigation.navigate('DoctorAvailability', {})}
        >
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

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

              <TouchableOpacity style={styles.modalGridItem}>
                <View style={[styles.modalIconWrap, { backgroundColor: '#F1F5F9' }]}>
                  <Settings size={28} color="#64748B" />
                </View>
                <Text style={styles.modalIconText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalGridItem}
                onPress={() => {
                  setMoreModalVisible(false);
                  navigation.navigate('SignIn', { role: 'patient' });
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
    color: COLORS.textSecondary   },
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
});

export default PatientDashboard;
