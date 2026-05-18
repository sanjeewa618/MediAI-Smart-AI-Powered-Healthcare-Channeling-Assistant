import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft, ArrowRight, Home, Calendar, Heart, FileText, User, ChevronLeft, Stethoscope, FlaskConical, CheckCircle2, Clock, XCircle, Plus } from 'lucide-react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { COLORS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

type AppointmentsNavProp = StackNavigationProp<RootStackParamList, 'PatientAppointments'>;

const tabs = ['Upcoming', 'Completed', 'Cancelled'];

const mockDoctorAppointments = [
  {
    id: 'D1',
    name: 'Dr. Emma Watson',
    specialty: 'Cardiologist',
    hospital: 'City Hospital',
    date: '20 May 2024',
    time: '10:30 AM',
    status: 'Upcoming',
    avatar: require('../../../assets/dr-emma.png')
  },
  {
    id: 'D2',
    name: 'Dr. James Smith',
    specialty: 'Neurologist',
    hospital: 'City Hospital',
    date: '15 May 2024',
    time: '02:00 PM',
    status: 'Completed',
    avatar: require('../../../assets/dr-james.png')
  },
  {
    id: 'D3',
    name: 'Dr. Olivia Brown',
    specialty: 'Dermatologist',
    hospital: 'Derma Care Hospital',
    date: '10 May 2024',
    time: '11:00 AM',
    status: 'Cancelled',
    avatar: require('../../../assets/dr-olivia.png')
  }
];

const mockLabAppointments = [
  {
    id: 'L1',
    name: 'Complete Blood Count (CBC)',
    lab: 'City Central Lab',
    location: '2nd Floor, Room 204',
    date: '22 May 2024',
    time: '08:00 AM',
    status: 'Upcoming',
    price: 'LKR 2,500'
  },
  {
    id: 'L2',
    name: 'Full Urine Analysis',
    lab: 'Asiri Health Lab',
    location: 'Ground Floor',
    date: '12 May 2024',
    time: '09:30 AM',
    status: 'Completed',
    price: 'LKR 1,800'
  }
];

const PatientAppointmentsScreen = () => {
  const navigation = useNavigation<AppointmentsNavProp>();
  const [activeCategory, setActiveCategory] = useState<'Doctor' | 'Lab'>('Doctor');
  const [activeTab, setActiveTab] = useState('Upcoming');

  const getFilteredAppointments = () => {
    const data = activeCategory === 'Doctor' ? mockDoctorAppointments : mockLabAppointments;
    return data.filter(item => item.status === activeTab);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Upcoming': return <Clock size={16} color={COLORS.primary} />;
      case 'Completed': return <CheckCircle2 size={16} color="#10B981" />;
      case 'Cancelled': return <XCircle size={16} color="#EF4444" />;
      default: return null;
    }
  };

  const renderDoctorItem = (item: any) => (
    <TouchableOpacity key={item.id} style={[styles.appointmentCard, SHADOWS.small]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarWrap}>
          <Image source={item.avatar} style={styles.avatar} />
        </View>
        <View style={styles.cardMainInfo}>
          <Text style={styles.docName}>{item.name}</Text>
          <Text style={styles.specialtyText}>{item.specialty}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: activeTab === 'Upcoming' ? '#F3F0FF' : activeTab === 'Completed' ? '#ECFDF5' : '#FEF2F2' }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusBadgeText, { color: activeTab === 'Upcoming' ? COLORS.primary : activeTab === 'Completed' ? '#10B981' : '#EF4444' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardFooter}>
        <View style={styles.footerDetail}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.footerDetailText}>{item.date} • {item.time}</Text>
        </View>
        <View style={styles.footerDetail}>
          <Home size={14} color="#6B7280" />
          <Text style={styles.footerDetailText}>{item.hospital}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLabItem = (item: any) => (
    <TouchableOpacity key={item.id} style={[styles.appointmentCard, SHADOWS.small]}>
      <View style={styles.cardHeader}>
        <View style={[styles.labIconWrap, { backgroundColor: '#F3F0FF' }]}>
          <FlaskConical size={24} color={COLORS.primary} />
        </View>
        <View style={styles.cardMainInfo}>
          <Text style={styles.docName}>{item.name}</Text>
          <Text style={styles.specialtyText}>{item.lab}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: activeTab === 'Upcoming' ? '#F3F0FF' : activeTab === 'Completed' ? '#ECFDF5' : '#FEF2F2' }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusBadgeText, { color: activeTab === 'Upcoming' ? COLORS.primary : activeTab === 'Completed' ? '#10B981' : '#EF4444' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.cardFooter}>
        <View style={styles.footerDetail}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.footerDetailText}>{item.date} • {item.time}</Text>
        </View>
        <View style={styles.footerDetail}>
          <Home size={14} color="#6B7280" />
          <Text style={styles.footerDetailText}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        {/* Header Section */}
        <LinearGradient colors={COLORS.screenHeaderGradient} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={28} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>My Appointments</Text>
              <Text style={styles.headerSub}>Manage your health schedule</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Category Selection Cards */}
          <View style={styles.categoryCardsRow}>
            <TouchableOpacity 
              style={[styles.categoryCard, activeCategory === 'Doctor' && styles.activeCategoryCard, SHADOWS.medium]}
              onPress={() => setActiveCategory('Doctor')}
            >
              <View style={[styles.categoryIconCircle, activeCategory === 'Doctor' ? { backgroundColor: '#FFF' } : { backgroundColor: '#F3F0FF' }]}>
                <Stethoscope size={26} color={activeCategory === 'Doctor' ? COLORS.primary : '#9CA3AF'} />
              </View>
              <Text style={[styles.categoryCardTitle, activeCategory === 'Doctor' && { color: '#FFF' }]}>Doctor</Text>
              <Text style={[styles.categoryCardSub, activeCategory === 'Doctor' && { color: 'rgba(255,255,255,0.8)' }]}>Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryCard, activeCategory === 'Lab' && styles.activeCategoryCard, SHADOWS.medium]}
              onPress={() => setActiveCategory('Lab')}
            >
              <View style={[styles.categoryIconCircle, activeCategory === 'Lab' ? { backgroundColor: '#FFF' } : { backgroundColor: '#F3F0FF' }]}>
                <FlaskConical size={26} color={activeCategory === 'Lab' ? COLORS.primary : '#9CA3AF'} />
              </View>
              <Text style={[styles.categoryCardTitle, activeCategory === 'Lab' && { color: '#FFF' }]}>Lab Test</Text>
              <Text style={[styles.categoryCardSub, activeCategory === 'Lab' && { color: 'rgba(255,255,255,0.8)' }]}>Appointment</Text>
            </TouchableOpacity>
          </View>

          {/* Status Tabs */}
          <View style={styles.tabsWrapper}>
            <View style={styles.tabsBackground}>
              {tabs.map((tab) => (
                <TouchableOpacity 
                  key={tab} 
                  style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Appointments List */}
          <View style={styles.appointmentsList}>
            {getFilteredAppointments().length > 0 ? (
              getFilteredAppointments().map(item => 
                activeCategory === 'Doctor' ? renderDoctorItem(item) : renderLabItem(item)
              )
            ) : (
              <View style={styles.emptyState}>
                <Image 
                  source={require('../../../assets/robot-avatar.png')} 
                  style={styles.emptyImage} 
                />
                <Text style={styles.emptyText}>No {activeTab.toLowerCase()} appointments found</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Book Button */}
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity 
            style={[styles.mainBookBtn, SHADOWS.medium]}
            onPress={() => {
              navigation.navigate('AvailabilitySelection');
            }}
          >
            <LinearGradient 
              colors={['#8B3DFF', '#5F0FFF']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Plus size={24} color="#FFF" />
              <Text style={styles.btnText}>Book New {activeCategory}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  categoryCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activeCategoryCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  categoryCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  tabsWrapper: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  tabsBackground: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 6,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabItem: {
    backgroundColor: '#FFF',
    ...SHADOWS.small,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeTabLabel: {
    color: COLORS.primary,
  },
  appointmentsList: {
    paddingHorizontal: 24,
  },
  appointmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  labIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  cardMainInfo: {
    flex: 1,
    marginLeft: 14,
  },
  docName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  specialtyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerDetailText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyImage: {
    width: 100,
    height: 100,
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 100,
    left: 24,
    right: 24,
    
  },
  mainBookBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default PatientAppointmentsScreen;
