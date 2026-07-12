import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  TextInput, SafeAreaView, Platform, StatusBar, Modal, Dimensions,
  Animated, PanResponder, ActivityIndicator
} from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  Search, Bell, ArrowLeft, Filter, FlaskConical, Clock, ChevronLeft, ChevronRight, 
  CheckCircle2, AlertCircle, Calendar, User, MapPin, Users,
  Activity, Heart, Droplets, Baby, Sun, Shield, 
  Stethoscope, Microscope, Thermometer, Brain, Bone, Eye, Smile, X, ArrowRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../../components/BottomNavBar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type NavigationProp = StackNavigationProp<RootStackParamList, 'LabAvailability'>;

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

const labCategories = [
  { id: '1', name: 'Blood Test', icon: '🩸', color: '#FEE2E2' },
  { id: '2', name: 'Urine Test', icon: '🧪', color: '#FEF3C7' },
  { id: '3', name: 'Diabetes', icon: '🍬', color: '#E0F2FE' },
  { id: '4', name: 'Heart', icon: '❤️', color: '#FCE7F3' },
  { id: '5', name: 'Liver', icon: '🧬', color: '#FDF2F8' },
  { id: '6', name: 'Pregnancy', icon: '🤰', color: '#FFF1F2' }
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
    image: require('../../../assets/lab.jpg')
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
    image: require('../../../assets/lab.jpg')
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
    image: require('../../../assets/lab.jpg')
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
    image: require('../../../assets/lab.jpg')
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
    image: require('../../../assets/lab.jpg')
  }
];

const getUpcomingDays = () => {
  const list = [];
  for (let i = 0; i < 14; i++) {
    const m = moment().add(i, 'days');
    list.push({
      id: String(i + 1),
      day: m.format('ddd'),
      date: m.format('D'),
      fullDate: m.format('YYYY-MM-DD')
    });
  }
  return list;
};

const timeSlotsData: any = {
  'default': []
};

const LabAvailabilityScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLabForAvailability, setSelectedLabForAvailability] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [currentMonthYear, setCurrentMonthYear] = useState(moment().format('MMMM YYYY'));

  const dates = useMemo(() => {
    const list = getUpcomingDays();
    const exists = list.some(d => d.fullDate === selectedDate);
    if (!exists && selectedDate) {
      const m = moment(selectedDate);
      list.push({
        id: 'custom-selected',
        day: m.format('ddd'),
        date: m.format('D'),
        fullDate: selectedDate
      });
      list.sort((a, b) => a.fullDate.localeCompare(b.fullDate));
    }
    return list;
  }, [selectedDate]);

  // Animation for Swipe to Close
  const panY = useRef(new Animated.Value(0)).current;
  const greyShadow = { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 };

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

  const { token } = useAuth();
  const [dbLabs, setDbLabs] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbSlots, setDbSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlotsCount, setAvailableSlotsCount] = useState<{[key: string]: number}>({});
  const [currentTokens, setCurrentTokens] = useState<{[key: string]: number}>({});

  useFocusEffect(
    useCallback(() => {
      const fetchLabsAndCategories = async () => {
        setLoading(true);
        try {
          const [catsRes, labsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/labs/categories`),
            fetch(`${API_BASE_URL}/api/labs?limit=100`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
          ]);
          const catsData = await catsRes.json();
          const labsData = await labsRes.json();
          if (catsData.success) setDbCategories(catsData.data || []);
          if (labsData.success) setDbLabs(labsData.data || []);
        } catch (error) {
          console.error('Error fetching labs:', error);
        } finally {
          setLoading(false);
        }
      };
      if (token) fetchLabsAndCategories();
    }, [token])
  );

  useEffect(() => {
    const fetchDbSlots = async () => {
      if (!selectedLabForAvailability) return;
      setSlotsLoading(true);
      try {
        const fullDateStr = selectedDate;
        const res = await fetch(`${API_BASE_URL}/api/labs/${selectedLabForAvailability.id}/availability?date=${fullDateStr}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setDbSlots(data.data?.slots || []);
        } else {
          setDbSlots([]);
        }
      } catch (err) {
        console.error(err);
        setDbSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    if (token && selectedLabForAvailability) {
      fetchDbSlots();
    }
  }, [selectedLabForAvailability, selectedDate, token]);

  useEffect(() => {
    setSelectedTimeSlot('');
  }, [selectedDate, selectedLabForAvailability]);

  const selectedCategoryObj = dbCategories.find(c => c.name?.toLowerCase() === (labCategories.find(lc => lc.id === selectedCategory)?.name?.toLowerCase()));

  const seenNurses = new Set();
  const filteredLabs = dbLabs
    .filter(lab => {
      // Must have an assigned nurse
      if (!lab.assignedNurse) return false;

      const nurseId = (lab.assignedNurse?._id || lab.assignedNurse).toString();
      
      // If we've already displayed a lab card for this nurse, filter it out to prevent duplicates
      if (seenNurses.has(nurseId)) {
        return false;
      }

      if (!selectedCategoryObj) return false;
      
      let isMatch = false;

      // Match by category ID
      const catId = lab.category?._id || lab.category;
      if (catId?.toString() === selectedCategoryObj._id?.toString()) {
        isMatch = true;
      }
      
      // Fallback 1: Match by category name
      const catName = lab.category?.name;
      if (!isMatch && catName && catName.toLowerCase() === selectedCategoryObj.name.toLowerCase()) {
        isMatch = true;
      }
      
      // Fallback 2: Match by assignedNurse department
      const nurseDept = lab.assignedNurse?.department;
      if (!isMatch && nurseDept && nurseDept.toLowerCase() === selectedCategoryObj.name.toLowerCase()) {
        isMatch = true;
      }
      
      // Fallback 3: Match by lab name containing the category name
      const labName = lab.name || '';
      if (!isMatch && labName.toLowerCase().includes(selectedCategoryObj.name.toLowerCase())) {
        isMatch = true;
      }
      
      if (isMatch) {
        seenNurses.add(nurseId);
        return true;
      }
      
      return false;
    })
    .filter(lab =>
      (lab.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lab.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(lab => ({
      id: lab._id,
      category: selectedCategory,
      name: lab.name,
      description: lab.description || lab.category?.name || 'Lab Test',
      floor: lab.floor || 'Main Floor',
      duration: '1-2 Hours',
      price: 'LKR 1500',
      status: lab.status || 'Available',
      nurse: lab.assignedNurse?.name || 'Assigned Nurse',
      nursePhoto: lab.assignedNurse?.photo 
        ? `${API_BASE_URL}${lab.assignedNurse.photo}` 
        : 'https://img.freepik.com/free-photo/female-nurse-white-coat-standing-with-clipboard-isolated_1303-31411.jpg',
      rating: 4.8,
      queue: 0,
      wait: '15 mins',
      currentToken: 0,
      yourToken: 0,
      openTime: lab.openTime || '08:00 AM',
      closeTime: lab.closeTime || '06:00 PM',
      image: lab.assignedNurse?.photo 
        ? `${API_BASE_URL}${lab.assignedNurse.photo}` 
        : 'https://img.freepik.com/free-photo/lab-technician-holding-blood-tube_23-2148166567.jpg'
    }));

  useEffect(() => {
    const fetchAllAvailableSlots = async () => {
      if (filteredLabs.length === 0) return;
      const counts: {[key: string]: number} = {};
      const tokensMap: {[key: string]: number} = {};
      await Promise.all(filteredLabs.map(async (lab) => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/labs/${lab.id}/availability?date=${selectedDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            const slotsList = data.data?.slots || [];
            const count = slotsList.filter((s: any) => s.status === 'Available' || s.status === 'Busy').length;
            counts[lab.id] = count;
            tokensMap[lab.id] = data.data?.currentToken || 1;
          } else {
            counts[lab.id] = 0;
            tokensMap[lab.id] = 1;
          }
        } catch (err) {
          console.error(err);
          counts[lab.id] = 0;
          tokensMap[lab.id] = 1;
        }
      }));
      setAvailableSlotsCount(prev => ({ ...prev, ...counts }));
      setCurrentTokens(prev => ({ ...prev, ...tokensMap }));
    };

    if (token && filteredLabs.length > 0) {
      fetchAllAvailableSlots();
    }
  }, [selectedDate, token, dbLabs, dbCategories, selectedCategory, searchQuery]);

  const displaySlots = dbSlots.length > 0
    ? dbSlots.map(s => {
        const timeRange = s.endTime ? `${s.startTime} - ${s.endTime}` : s.startTime;
        const bookedCount = s.booked || 0;
        const maxPatients = s.maxPatients || 10;
        const isFull = s.status === 'Full' || bookedCount >= maxPatients || s.isExpired;
        const nextQueueNumber = bookedCount + 1;
        return {
          time: timeRange,
          status: s.status || 'Available',
          rawSlot: s,
          isExpired: s.isExpired,
          bookedCount,
          maxPatients,
          isFull,
          nextQueueNumber
        };
      })
    : [];

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

  const selectedSlotObj = displaySlots.find((s: any) => s.time === selectedTimeSlot);
  const isBookingEnabled = !!selectedTimeSlot && selectedSlotObj?.status !== 'Closed';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={COLORS.screenHeaderGradient}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerGreeting}>{getGreeting()}</Text>
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
                  <Image source={typeof lab.image === 'number' ? lab.image : { uri: lab.image }} style={styles.labImage} />
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
                </View>

                {/* Token/Queue System Preview */}
                <View style={styles.queueBox}>
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={styles.sectionLabel}>Select Date</Text>
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
                    onPress={() => setShowCalendarModal(true)}
                  >
                    <Calendar size={14} color={COLORS.primary} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>Full Calendar</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalDateList}>
                  {dates.map((d) => (
                    <TouchableOpacity 
                      key={d.id} 
                      style={[styles.dateCard, selectedDate === d.fullDate && styles.dateCardActive, SHADOWS.small]}
                      onPress={() => setSelectedDate(d.fullDate)}
                    >
                      <Text style={[styles.dateDay, selectedDate === d.fullDate && styles.dateDayActive]}>{d.day}</Text>
                      <Text style={[styles.dateNumber, selectedDate === d.fullDate && styles.dateNumberActive]}>{d.date}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Time Slots in Modal */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Available Slots for {moment(selectedDate).format('DD MMMM YYYY')}</Text>
                {slotsLoading ? (
                  <View style={{ paddingVertical: 30, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 8 }}>Loading available slots...</Text>
                  </View>
                ) : displaySlots.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Clock size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No slots available</Text>
                    <Text style={styles.emptySub}>This laboratory has no schedules for this date.</Text>
                  </View>
                ) : (
                  <View style={styles.slotsVerticalList}>
                    {displaySlots.map((slot: any, i: number) => {
                      const isFull = slot.isFull;
                      const nextQueue = isFull ? null : slot.nextQueueNumber;
                      return (
                        <View key={i} style={styles.slotCard}>
                          <View style={styles.slotInfo}>
                            <View style={styles.slotTopRow}>
                              <Text style={styles.slotTime}>{slot.time}</Text>
                              {nextQueue !== null ? (
                                <View style={styles.queueBadge}>
                                  <Text style={styles.queueBadgeText}>Queue #{nextQueue}</Text>
                                </View>
                              ) : (
                                <View style={[styles.queueBadge, styles.queueBadgeFull]}>
                                  <Text style={[styles.queueBadgeText, styles.queueBadgeTextFull]}>Full</Text>
                                </View>
                              )}
                            </View>
                            <View style={styles.capacityBadge}>
                              <Users size={14} color={isFull ? '#EF4444' : '#10B981'} />
                              <Text style={[styles.capacityText, isFull && { color: '#EF4444' }]}>
                                {slot.bookedCount} / {slot.maxPatients} Booked
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={[styles.bookBtn, isFull && styles.bookBtnDisabled]}
                            disabled={isFull}
                            onPress={() => {
                              setSelectedTimeSlot(slot.time);
                              const rawSlotObj = slot.rawSlot;
                              setIsModalVisible(false);
                              navigation.navigate('LabBookingFlow', { 
                                lab: selectedLabForAvailability,
                                initialDate: selectedDate,
                                initialTime: slot.time,
                                scheduleSlotId: rawSlotObj ? rawSlotObj.slotId || rawSlotObj._id : undefined
                              });
                            }}
                          >
                            <Text style={styles.bookBtnText}>{isFull ? 'Full' : 'Book'}</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Nurse in Modal */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Nurse In Charge</Text>
                <View style={[styles.nurseCardModal, SHADOWS.small]}>
                  <Image 
                    source={{ uri: selectedLabForAvailability?.nursePhoto || 'https://img.freepik.com/free-photo/female-nurse-white-coat-standing-with-clipboard-isolated_1303-31411.jpg' }} 
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
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Full Calendar Modal for Patient */}
      <Modal visible={showCalendarModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarModalContent, greyShadow]}>
            <View style={styles.calendarModalHeader}>
              <Text style={styles.calendarModalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                <X size={20} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarControls}>
              <TouchableOpacity onPress={() => {
                const prev = moment(currentMonthYear, 'MMMM YYYY').subtract(1, 'month').format('MMMM YYYY');
                setCurrentMonthYear(prev);
              }}>
                <ChevronLeft size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.currentMonthText}>{currentMonthYear}</Text>
              <TouchableOpacity onPress={() => {
                const next = moment(currentMonthYear, 'MMMM YYYY').add(1, 'month').format('MMMM YYYY');
                setCurrentMonthYear(next);
              }}>
                <View style={{ transform: [{ rotate: '180deg' }] }}>
                  <ChevronLeft size={20} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <Text key={idx} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: moment(currentMonthYear, 'MMMM YYYY').startOf('month').day() }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}
              {Array.from({ length: moment(currentMonthYear, 'MMMM YYYY').daysInMonth() }).map((_, i) => {
                const day = i + 1;
                const dateMoment = moment(currentMonthYear, 'MMMM YYYY').date(day);
                const isPast = dateMoment.isBefore(moment(), 'day');
                const dateStr = dateMoment.format('YYYY-MM-DD');
                const isSelected = selectedDate === dateStr;

                return (
                  <TouchableOpacity 
                    key={day} 
                    style={[
                      styles.dayCell, 
                      isSelected && styles.dayCellActive,
                      isPast && { opacity: 0.3 }
                    ]}
                    onPress={() => {
                      setSelectedDate(dateStr);
                    }}
                    disabled={isPast}
                  >
                    <Text style={[
                      styles.dayCellText, 
                      isSelected && styles.whiteText,
                      isPast && { color: '#94A3B8' }
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={styles.calendarCloseBtnFull}
              onPress={() => setShowCalendarModal(false)}
            >
              <Text style={styles.calendarCloseBtnText}>Confirm Selection</Text>
            </TouchableOpacity>
          </View>
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
    width: '48%',
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
  timeSlotExpired: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    opacity: 0.4,
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
  timeTextExpired: { color: '#EF4444' },
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
  },
  calendarModalContent: {
    backgroundColor: '#FFF',
    width: width * 0.9,
    borderRadius: 24,
    padding: 20,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  calendarControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  currentMonthText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDayText: {
    width: (width * 0.9 - 40) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  dayCell: {
    width: (width * 0.9 - 40) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  dayCellActive: {
    backgroundColor: COLORS.primary,
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  whiteText: {
    color: '#FFF',
  },
  calendarCloseBtnFull: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  calendarCloseBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  slotsVerticalList: {
    paddingHorizontal: 2,
    marginTop: 10,
    marginBottom: 20
  },
  slotCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#8B3DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  slotInfo: { gap: 6, flex: 1 },
  slotTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  slotTime: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  queueBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  queueBadgeFull: { backgroundColor: '#FEE2E2' },
  queueBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  queueBadgeTextFull: { color: '#EF4444' },
  capacityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  capacityText: { fontSize: 13, fontWeight: '600', color: '#10B981' },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12
  },
  bookBtnDisabled: { backgroundColor: '#D1D5DB' },
  bookBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  emptyBox: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 40, 
    backgroundColor: '#FFF', 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#4B5563', marginTop: 16 },
  emptySub: { fontSize: 13, color: '#6B7280', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }
});

export default LabAvailabilityScreen;
