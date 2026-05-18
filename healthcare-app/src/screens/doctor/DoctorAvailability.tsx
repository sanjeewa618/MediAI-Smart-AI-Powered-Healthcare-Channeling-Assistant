import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView, Platform, Dimensions, TextInput } from 'react-native';
import { ChevronLeft, Clock, Calendar, AlertCircle, CheckCircle2, Search, ArrowRight, User } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';

const { width } = Dimensions.get('window');

type NavProp = StackNavigationProp<RootStackParamList, 'DoctorAvailability'>;
type RoutePropType = RouteProp<RootStackParamList, 'DoctorAvailability'>;

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: any;
  availableDates: string[];
  leaveStatus: 'available' | 'on-leave' | 'emergency';
  timeSlots: TimeSlot[];
}

const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Emma Watson',
    specialty: 'Cardiology',
    image: require('../../../assets/dr-emma.png'),
    availableDates: ['May 15', 'May 16', 'May 18'],
    leaveStatus: 'available',
    timeSlots: [
      { time: '09:00 AM', isAvailable: true },
      { time: '09:30 AM', isAvailable: false },
      { time: '10:00 AM', isAvailable: true },
      { time: '10:30 AM', isAvailable: true },
    ]
  },
  {
    id: '2',
    name: 'Dr. John Doe',
    specialty: 'Dermatology',
    image: require('../../../assets/dr-emma.png'),
    availableDates: ['May 17', 'May 19'],
    leaveStatus: 'on-leave',
    timeSlots: [
      { time: '01:00 PM', isAvailable: false },
      { time: '01:30 PM', isAvailable: false },
    ]
  },
  {
    id: '3',
    name: 'Dr. Alice Smith',
    specialty: 'Paediatrics',
    image: require('../../../assets/dr-emma.png'),
    availableDates: ['May 15', 'May 17', 'May 20'],
    leaveStatus: 'available',
    timeSlots: [
      { time: '10:00 AM', isAvailable: true },
      { time: '11:00 AM', isAvailable: true },
      { time: '12:00 PM', isAvailable: false },
      { time: '02:00 PM', isAvailable: true },
    ]
  },
  {
    id: '4',
    name: 'Dr. Kevin Brown',
    specialty: 'Urology',
    image: require('../../../assets/dr-emma.png'),
    availableDates: ['May 16', 'May 18'],
    leaveStatus: 'available',
    timeSlots: [
      { time: '11:00 AM', isAvailable: true },
      { time: '11:30 AM', isAvailable: false },
      { time: '01:00 PM', isAvailable: true },
    ]
  },
  {
    id: '5',
    name: 'Dr. Sarah Connor',
    specialty: 'Oncology',
    image: require('../../../assets/dr-emma.png'),
    availableDates: ['May 20', 'May 22'],
    leaveStatus: 'emergency',
    timeSlots: [
      { time: '09:00 AM', isAvailable: false },
      { time: '10:00 AM', isAvailable: false },
    ]
  }
];

const categories = ['All', 'Cardiology', 'Paediatrics', 'Urology', 'Oncology', 'Dermatology'];

const DoctorAvailability = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const initialSpecialty = route.params?.specialty || 'All';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialSpecialty);

  const filteredDoctors = mockDoctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.specialty === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'on-leave': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'On Duty';
      case 'on-leave': return 'On Leave';
      default: return 'Emergency Only';
    }
  };

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <View style={[styles.card, SHADOWS.medium]}>
      <View style={styles.cardHeader}>
        <View style={styles.docMainInfo}>
          <Image source={item.image} style={styles.avatar} />
          <View style={styles.textGroup}>
            <Text style={styles.docName}>{item.name}</Text>
            <Text style={styles.docSpecialty}>{item.specialty}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.leaveStatus) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.leaveStatus) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.leaveStatus) }]}>
            {getStatusText(item.leaveStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.schedulePreview}>
        <View style={styles.infoRow}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.infoLabel}>Available Dates:</Text>
          <Text style={styles.infoValue}>{item.availableDates.join(', ')}</Text>
        </View>
        
        <View style={styles.slotsContainer}>
          <Text style={styles.slotsTitle}>Today's Time Slots</Text>
          <View style={styles.slotsGrid}>
            {item.timeSlots.map((slot, index) => (
              <View 
                key={index} 
                style={[
                  styles.slotChip, 
                  !slot.isAvailable && styles.slotChipDisabled
                ]}
              >
                <Text style={[
                  styles.slotText,
                  !slot.isAvailable && styles.slotTextDisabled
                ]}>
                  {slot.time}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.bookBtn, 
          item.leaveStatus !== 'available' && styles.bookBtnDisabled
        ]}
        disabled={item.leaveStatus !== 'available'}
        onPress={() => navigation.navigate('BookAppointment', {
          doctorId: item.id,
          doctorName: item.name,
          specialty: item.specialty,
          date: item.availableDates[0] ?? 'TBD',
          time: item.timeSlots[0]?.time ?? 'TBD'
        })}
      >
        <LinearGradient
          colors={item.leaveStatus === 'available' ? ['#724CF9', '#5E3BEE'] : ['#D1D5DB', '#9CA3AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBtn}
        >
          <Text style={styles.bookBtnText}>Book Appointment Instantly</Text>
          <ArrowRight size={18} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.container}>
        <LinearGradient colors={['#8B3DFF', '#5F0FFF']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={28} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Real-Time Availability</Text>
              <Text style={styles.headerSub}>Find available doctors & slots</Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search availability by doctor or specialty..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </LinearGradient>

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((category, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.categoryChip, 
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctorCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.benefitSection}>
              <View style={styles.benefitCard}>
                <CheckCircle2 size={24} color={COLORS.primary} />
                <View style={styles.benefitTextWrap}>
                  <Text style={styles.benefitTitle}>No Overlaps</Text>
                  <Text style={styles.benefitDesc}>Conflicts are automatically blocked</Text>
                </View>
              </View>
            </View>
          )}
        />
      </View>
      <DoctorBottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  backBtn: {
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 16,
  },
  searchInput: { flex: 1, marginLeft: 10, color: '#111827', fontSize: 14 },
  categoriesContainer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 10
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563'
  },
  categoryTextActive: {
    color: '#FFFFFF'
  },
  listContent: { padding: 20, paddingBottom: 40 },
  benefitSection: { marginBottom: 20 },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  benefitTextWrap: { marginLeft: 12 },
  benefitTitle: { fontSize: 14, fontWeight: '700', color: '#1E1B4B' },
  benefitDesc: { fontSize: 11, color: '#4338CA' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  docMainInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 60, height: 60, borderRadius: 18, backgroundColor: '#F3F4F6' },
  textGroup: { marginLeft: 14 },
  docName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  docSpecialty: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  schedulePreview: { marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginLeft: 8 },
  infoValue: { fontSize: 12, fontWeight: '700', color: '#111827', marginLeft: 6 },
  slotsContainer: { marginTop: 4 },
  slotsTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  slotChipDisabled: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA'
  },
  slotText: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
  slotTextDisabled: { color: '#EF4444' },
  bookBtn: { borderRadius: 20, overflow: 'hidden', marginTop: 12, shadowColor: '#724CF9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  bookBtnDisabled: { opacity: 0.5 },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 12
  },
  bookBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 }
});

export default DoctorAvailability;

