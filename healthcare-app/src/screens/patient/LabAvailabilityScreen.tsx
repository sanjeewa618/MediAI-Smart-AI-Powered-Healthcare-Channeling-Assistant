import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  TextInput, SafeAreaView, Platform, StatusBar, Modal, Dimensions,
  Animated, PanResponder
} from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  Search, Bell, ArrowLeft, Filter, FlaskConical, Clock, ChevronRight, 
  CheckCircle2, AlertCircle, Calendar, User, MapPin, 
  Activity, Heart, Droplets, Baby, Sun, Shield, 
  Stethoscope, Microscope, Thermometer, Brain, Bone, Eye, Smile, X, ArrowRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../../components/BottomNavBar';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'LabAvailability'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const labCategories = [
  { id: '1', name: 'Blood Tests', icon: '🩸', color: '#FEE2E2' },
  { id: '2', name: 'Urine Tests', icon: '🧪', color: '#FEF3C7' },
  { id: '3', name: 'Diabetes', icon: '💉', color: '#E0F2FE' },
  { id: '4', name: 'Heart', icon: '❤️', color: '#FCE7F3' },
  { id: '5', name: 'Liver', icon: '🫀', color: '#F0FDF4' },
  { id: '6', name: 'Kidney', icon: '🧬', color: '#F5F3FF' },
  { id: '7', name: 'Thyroid', icon: '🦋', color: '#FFF7ED' },
  { id: '8', name: 'Hormone', icon: '⚕️', color: '#ECFDF5' },
  { id: '9', name: 'Pregnancy', icon: '👶', color: '#FFF1F2' },
  { id: '10', name: 'Full Body', icon: '🏥', color: '#F1F5F9' },
];

const mockLabs = [
  {
    id: '1',
    category: '1',
    name: 'Lab 01',
    description: 'Complete Blood Count (CBC)',
    floor: '2nd Floor',
    duration: '4 Hours',
    price: 'LKR 2500',
    status: 'Available',
    nurse: 'Amanda Silva',
    rating: 4.9,
    queue: 4,
    wait: '18 mins',
    currentToken: 21,
    yourToken: 25,
    openTime: '07:00 AM',
    closeTime: '02:00 PM', // AM Shift
    image: 'https://img.freepik.com/free-photo/scientist-working-with-blood-samples-lab_23-2148810769.jpg'
  },
  {
    id: '2',
    category: '1',
    name: 'Lab 02',
    description: 'Blood Grouping & Rh',
    floor: '2nd Floor',
    duration: '1 Hour',
    price: 'LKR 800',
    status: 'Available',
    nurse: 'Janaka Perera',
    rating: 4.8,
    queue: 2,
    wait: '10 mins',
    currentToken: 15,
    yourToken: 17,
    openTime: '02:00 PM',
    closeTime: '09:00 PM', // PM Shift
    image: 'https://img.freepik.com/free-photo/doctor-working-with-blood-tubes-lab_23-2148810771.jpg'
  },
  {
    id: '3',
    category: '2',
    name: 'Lab 05',
    description: 'Full Urine Analysis',
    floor: '3rd Floor',
    duration: '3 Hours',
    price: 'LKR 1800',
    status: 'Available',
    nurse: 'Janet Gomes',
    rating: 4.6,
    queue: 5,
    wait: '25 mins',
    currentToken: 30,
    yourToken: 36,
    openTime: '07:30 AM',
    closeTime: '01:30 PM', // AM Shift
    image: 'https://img.freepik.com/free-photo/medical-specialist-analyzing-urine-sample-laboratory_23-2148810766.jpg'
  },
  {
    id: '4',
    category: '2',
    name: 'Lab 06',
    description: 'Urine Culture',
    floor: '3rd Floor',
    duration: '48 Hours',
    price: 'LKR 3200',
    status: 'Busy',
    nurse: 'Robert Wilson',
    rating: 4.7,
    queue: 8,
    wait: '45 mins',
    currentToken: 5,
    yourToken: 13,
    openTime: '01:30 PM',
    closeTime: '08:30 PM', // PM Shift
    image: 'https://img.freepik.com/free-photo/biologist-woman-working-medical-research-laboratory_482257-26895.jpg'
  },
  {
    id: '5',
    category: '3',
    name: 'Lab 09',
    description: 'Fasting Blood Sugar (FBS)',
    floor: '2nd Floor',
    duration: '2 Hours',
    price: 'LKR 1200',
    status: 'Available',
    nurse: 'Sarah Perera',
    rating: 4.8,
    queue: 2,
    wait: '10 mins',
    currentToken: 45,
    yourToken: 48,
    openTime: '07:00 AM',
    closeTime: '07:00 PM',
    image: 'https://img.freepik.com/free-photo/doctor-hand-taking-blood-sample-from-patient_1150-18451.jpg'
  }
];

const dates = [
  { id: '1', day: 'Mon', date: '12' },
  { id: '2', day: 'Tue', date: '13' },
  { id: '3', day: 'Wed', date: '14' },
  { id: '4', day: 'Thu', date: '15' },
  { id: '5', day: 'Fri', date: '16' },
  { id: '6', day: 'Sat', date: '17' },
];

const timeSlotsData: any = {
  '12': [
    { time: '08:00 AM', status: 'Available' },
    { time: '09:30 AM', status: 'Busy' },
    { time: '11:00 AM', status: 'Available' },
  ],
  '13': [
    { time: '10:00 AM', status: 'Available' },
    { time: '11:30 AM', status: 'Available' },
    { time: '01:00 PM', status: 'Busy' },
  ],
  'default': [
    { time: '08:00 AM', status: 'Available' },
    { time: '10:00 AM', status: 'Available' },
    { time: '12:00 PM', status: 'Busy' },
    { time: '02:00 PM', status: 'Closed' },
  ]
};

const LabAvailabilityScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('13');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLabForAvailability, setSelectedLabForAvailability] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Animation for Swipe to Close
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 100) {
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

  const filteredLabs = mockLabs.filter(lab => 
    lab.category === selectedCategory && 
    (lab.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     lab.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentTimeSlots = timeSlotsData[selectedDate] || timeSlotsData['default'];

  const openAvailability = (lab: any) => {
    setSelectedLabForAvailability(lab);
    setIsModalVisible(true);
    panY.setValue(0);
  };

  const closeModal = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      panY.setValue(0);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#8B3DFF', '#5F0FFF']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerGreeting}>Good Morning 👋</Text>
            <Text style={styles.headerTitle}>Book Your Lab Test</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search tests, labs..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {labCategories.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[
                  styles.categoryItem, 
                  selectedCategory === cat.id && styles.categoryItemActive,
                  SHADOWS.small
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <View style={[styles.categoryIconWrap, { backgroundColor: cat.color }]}>
                  <Text style={styles.categoryIconText}>{cat.icon}</Text>
                </View>
                <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lab Availability Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Lab Tests</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>

          {filteredLabs.length > 0 ? (
            filteredLabs.map((lab) => (
              <View key={lab.id} style={styles.labCard}>
                <View style={styles.labCardTop}>
                  <Image source={{ uri: lab.image }} style={styles.labImage} />
                  <View style={styles.labMainInfo}>
                    <Text style={styles.labName}>{lab.name}</Text>
                    <Text style={styles.labDesc}>{lab.description}</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingText}>⭐ {lab.rating}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: lab.status === 'Available' ? '#DCFCE7' : '#FFEDD5' }]}>
                        <Text style={[styles.statusBadgeText, { color: lab.status === 'Available' ? '#166534' : '#9A3412' }]}>
                          {lab.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.labDetailsGrid}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>{lab.duration} Result</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <User size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>{lab.nurse}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MapPin size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>{lab.floor}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Activity size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>Queue: {lab.queue}</Text>
                  </View>
                </View>

                {/* Token/Queue System Preview */}
                <View style={styles.queueBox}>
                  <View style={styles.queueItem}>
                    <Text style={styles.queueLabel}>Current Token</Text>
                    <Text style={styles.queueValue}>{lab.currentToken}</Text>
                  </View>
                  <View style={styles.queueDivider} />
                  <View style={styles.queueItem}>
                    <Text style={styles.queueLabel}>Wait Time</Text>
                    <Text style={styles.queueValue}>{lab.wait}</Text>
                  </View>
                </View>

                <View style={styles.labCardBottom}>
                  <View>
                    <Text style={styles.priceLabel}>Price</Text>
                    <Text style={styles.priceValue}>{lab.price}</Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={styles.availabilityBtn}
                      onPress={() => openAvailability(lab)}
                    >
                      <Calendar size={18} color="#FFF" />
                      <Text style={styles.availabilityBtnText}>Check Availability</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <FlaskConical size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No tests available in this category</Text>
            </View>
          )}
        </View>

        {/* Info Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#8B3DFF', '#5F0FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoGradient}
          >
            <View style={styles.promoTextWrap}>
              <Text style={styles.promoTitle}>Home Sample Collection</Text>
              <Text style={styles.promoSub}>We come to you! Safe & fast service.</Text>
              <TouchableOpacity style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>Book Home Visit</Text>
              </TouchableOpacity>
            </View>
            <Microscope size={80} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
          </LinearGradient>
        </View>

      </ScrollView>

      {/* Availability Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={closeModal} 
            style={StyleSheet.absoluteFill} 
          />
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY: panY }] }
            ]}
          >
            {/* Swipe Handle */}
            <View {...panResponder.panHandlers} style={styles.swipeHandleWrap}>
              <View style={styles.swipeHandle} />
            </View>

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedLabForAvailability?.name} Availability</Text>
                <Text style={styles.modalSub}>{selectedLabForAvailability?.description}</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <X size={24} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Calendar in Modal */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalDateList}>
                  {dates.map((d) => (
                    <TouchableOpacity 
                      key={d.id} 
                      style={[styles.dateCard, selectedDate === d.date && styles.dateCardActive, SHADOWS.small]}
                      onPress={() => setSelectedDate(d.date)}
                    >
                      <Text style={[styles.dateDay, selectedDate === d.date && styles.dateDayActive]}>{d.day}</Text>
                      <Text style={[styles.dateNumber, selectedDate === d.date && styles.dateNumberActive]}>{d.date}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Time Slots in Modal */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Available Slots for {selectedDate} May</Text>
                <View style={styles.timeGrid}>
                  {currentTimeSlots.map((slot: any, i: number) => (
                    <TouchableOpacity 
                      key={i} 
                      style={[
                        styles.timeSlot, 
                        slot.status === 'Available' ? styles.timeSlotAvailable : 
                        slot.status === 'Busy' ? styles.timeSlotBusy : styles.timeSlotClosed,
                        selectedTimeSlot === slot.time && styles.timeSlotSelected
                      ]}
                      onPress={() => setSelectedTimeSlot(slot.time)}
                      disabled={slot.status === 'Closed'}
                    >
                      <Text style={[
                        styles.timeText,
                        slot.status === 'Available' ? styles.timeTextAvailable : 
                        slot.status === 'Busy' ? styles.statusFew : styles.statusFull,
                        selectedTimeSlot === slot.time && styles.timeTextSelected
                      ]}>
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Time Legend */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>Available</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>Few Slots Left</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
                    <Text style={styles.legendText}>Full / Closed</Text>
                  </View>
                </View>
              </View>

              {/* Nurse in Modal */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Nurse In Charge</Text>
                <View style={[styles.nurseCardModal, SHADOWS.small]}>
                  <Image 
                    source={{ uri: 'https://img.freepik.com/free-photo/female-nurse-white-coat-standing-with-clipboard-isolated_1303-31411.jpg' }} 
                    style={styles.nurseImageSmall} 
                  />
                  <View style={styles.nurseInfo}>
                    <Text style={styles.nurseNameSmall}>{selectedLabForAvailability?.nurse}</Text>
                    <Text style={styles.nurseShiftSmall}>
                      Shift: {selectedLabForAvailability?.openTime} - {selectedLabForAvailability?.closeTime}
                    </Text>
                  </View>
                  <View style={styles.activeIndicator} />
                </View>
              </View>

              <TouchableOpacity 
                style={styles.confirmBookingBtn}
                onPress={() => {
                  setIsModalVisible(false);
                  navigation.navigate('LabBookingFlow', { 
                    lab: selectedLabForAvailability,
                    initialDate: selectedDate,
                    initialTime: selectedTimeSlot
                  });
                }}
              >
                <Text style={styles.confirmBookingBtnText}>Book Now</Text>
                <ArrowRight size={20} color="#FFF" />
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textHeader,
  },
  filterBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  categoryList: {
    paddingRight: 24,
  },
  categoryItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 12,
    width: 100,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  categoryItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F3F0FF',
  },
  categoryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: COLORS.primary,
  },
  labCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(243, 244, 246, 0.6)',
    // Premium Shadow
    shadowColor: '#8B3DFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  labCardTop: {
    flexDirection: 'row',
    gap: 16,
  },
  labImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  labMainInfo: {
    flex: 1,
  },
  labName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  labDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  labDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  queueBox: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  queueItem: {
    flex: 1,
    alignItems: 'center',
  },
  queueDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  queueLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  queueValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  labCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  availabilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    ...SHADOWS.small,
  },
  availabilityBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  bookBtn_card: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookBtnText_card: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  promoBanner: {
    marginHorizontal: 24,
    marginTop: 30,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  promoGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoTextWrap: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  promoSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    marginBottom: 16,
  },
  promoBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  promoIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  swipeHandleWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  swipeHandle: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  closeBtn: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 12,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 16,
  },
  modalDateList: {
    paddingRight: 10,
  },
  dateCard: {
    backgroundColor: '#F9FAFB',
    width: 60,
    height: 80,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dateCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateDay: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  dateDayActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginTop: 4,
  },
  dateNumberActive: {
    color: '#FFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    width: '31%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  timeSlotAvailable: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  timeSlotBusy: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  timeSlotClosed: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  timeSlotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  timeTextAvailable: { color: '#166534' },
  timeTextBusy: { color: '#9A3412' },
  timeTextClosed: { color: '#6B7280' },
  timeTextSelected: { color: '#FFF' },
  statusFew: { color: '#9A3412' },
  statusFull: { color: '#6B7280' },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  nurseCardModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  nurseImageSmall: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  nurseInfo: {
    flex: 1,
  },
  nurseNameSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  nurseShiftSmall: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 'auto',
  },
  confirmBookingBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  confirmBookingBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  }
});

export default LabAvailabilityScreen;
