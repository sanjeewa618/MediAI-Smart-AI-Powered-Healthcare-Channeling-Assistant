import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, Animated, PanResponder } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { Search, Calendar, User, FileText, Activity, MoreHorizontal, Home, Heart, Shield, MessageCircle, FilePenLine, FlaskConical, ChevronRight, Baby, Droplets, Sun, Sparkles, Plus } from 'lucide-react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

type PatientDashboardProp = StackNavigationProp<RootStackParamList, 'PatientDashboard'>;

const PatientDashboard = () => {
  const navigation = useNavigation<PatientDashboardProp>();

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Purple Top Background Section */}
        <LinearGradient
          colors={['#724CF9', '#5E3BEE']}
          style={styles.topPurpleBackground}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, Sarah 👋</Text>
              <Text style={styles.subGreeting}>Take care of your health</Text>
            </View>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../../assets/robot-avatar.png')} 
                style={styles.avatar} 
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>Search doctors, hospitals, tests...</Text>
          </View>

          {/* AI Health Assistant Card */}
          <LinearGradient
            colors={['#815CFB', '#6737EA']}
            style={styles.aiCard}
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
            <Image 
              source={require('../../../assets/bot-image.png')} 
              style={styles.aiCardImage} 
              resizeMode="contain"
            />
            {/* Gradient overlay to blend the left side of the image into the background */}
            <LinearGradient
              colors={['#6139f1', 'transparent']}
              start={{ x: 0.04, y: 0 }}
              end={{ x: 0.5, y: 0 }}
              style={styles.aiCardImageOverlay}
            />
          </LinearGradient>
        </LinearGradient>

        {/* Bottom White Section */}
        <View style={styles.whiteCurveContainer}>
          
          {/* Specialties Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesContainer}
            
          >
            <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('DoctorAvailability')}>
              <View style={styles.categoryIconWrap}>
                <Heart size={28} color="#4B5563" />
              </View>
              <Text style={styles.categoryText}>Cardiology</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('DoctorAvailability')}>
              <View style={styles.categoryIconWrap}>
                <Baby size={28} color="#4B5563" />
              </View>
              <Text style={styles.categoryText}>Paediatrics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('DoctorAvailability')}>
              <View style={styles.categoryIconWrap}>
                <Droplets size={28} color="#4B5563" />
              </View>
              <Text style={styles.categoryText}>Urology</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('DoctorAvailability')}>
              <View style={styles.categoryIconWrap}>
                <Sun size={28} color="#4B5563" />
              </View>
              <Text style={styles.categoryText}>Oncology</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryItem} onPress={() => navigation.navigate('DoctorAvailability')}>
              <View style={styles.categoryIconWrap}>
                <Sparkles size={28} color="#4B5563" />
              </View>
              <Text style={styles.categoryText}>Dermatology</Text>
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
            <LinearGradient colors={['#7C4DFF', '#5E3BEE']} style={styles.infoCard}>
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
            <LinearGradient colors={['#7C4DFF', '#5E3BEE']} style={styles.infoCard}>
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
            <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('DoctorAvailability')}>
              <View style={styles.quickActionIconWrap}>
                <User size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Find Doctor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem}>
              <View style={styles.quickActionIconWrap}>
                <FlaskConical size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Book Lab Test</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem}>
              <View style={styles.quickActionIconWrap}>
                <FilePenLine size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>Health Records</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionItem}>
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
          onPress={() => navigation.navigate('DoctorAvailability')}
        >
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
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
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
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
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  avatar: { 
    width: '100%', 
    height: '100%' 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 24 
  },
  searchPlaceholder: { 
    marginLeft: 12, 
    color: '#9CA3AF', 
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
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginTop: 10
  },
  aiCardContent: { 
    flex: 1, 
    zIndex: 2,
    marginRight: 80
  },
  aiCardTitle: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 6 
  },
  aiCardText: { 
    color: 'rgba(255, 255, 255, 0.85)', 
    fontSize: 11, 
    marginBottom: 14, 
    lineHeight: 16 
  },
  aiCardBtn: { 
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 10, 
    alignSelf: 'flex-start' 
  },
  aiCardBtnText: { 
    color: COLORS.primary, 
    fontWeight: '700', 
    fontSize: 12 
  },
  aiCardImage: { 
    width: 150, 
    height: 150, 
    position: 'absolute', 
    right: -10, 
    bottom: -5,
    zIndex: 1,
    opacity: 0.85
  },
  aiCardImageOverlay: {
    position: 'absolute',
    right: -10,
    bottom: -5,
    width: 150,
    height: 150,
    zIndex: 2,
  },
  whiteCurveContainer: {
    backgroundColor: '#F9FAFB',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
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
    color: '#111827' 
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
    color: '#111827',
    marginBottom: 4
  },
  docSpecialty: { 
    fontSize: 12, 
    color: '#6B7280',
    marginBottom: 6
  },
  docTime: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600'
  },
  calendarIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
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
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center'
  },
  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 85, 
    backgroundColor: '#FFFFFF', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10
  },
  navItem: { 
    alignItems: 'center' 
  },
  navText: { 
    fontSize: 10, 
    marginTop: 6, 
    fontWeight: '600', 
    color: '#9CA3AF'   },
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
  }
});

export default PatientDashboard;
