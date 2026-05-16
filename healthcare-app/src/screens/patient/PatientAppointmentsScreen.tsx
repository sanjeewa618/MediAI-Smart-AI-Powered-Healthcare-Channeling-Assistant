import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft, ArrowRight, Home, Calendar, Heart, FileText, User, ChevronLeft } from 'lucide-react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { COLORS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

type AppointmentsNavProp = StackNavigationProp<RootStackParamList, 'PatientAppointments'>;

const tabs = ['Upcoming', 'Completed', 'Cancelled'];

const mockAppointments = [
  {
    id: '1',
    name: 'Dr. Emma Watson',
    specialty: 'Cardiologist',
    hospital: 'City Hospital',
    date: '20 May 2024',
    time: '10:30 AM',
    status: 'Upcoming',
    avatar: require('../../../assets/dr-emma.png')
  },
  {
    id: '2',
    name: 'Dr. James Smith',
    specialty: 'Neurologist',
    hospital: 'City Hospital',
    date: '25 May 2024',
    time: '02:00 PM',
    status: 'Upcoming',
    avatar: require('../../../assets/dr-james.png')
  },
  {
    id: '3',
    name: 'Dr. Olivia Brown',
    specialty: 'Dermatologist',
    hospital: 'Derma Care Hospital',
    date: '30 May 2024',
    time: '11:00 AM',
    status: 'Upcoming',
    avatar: require('../../../assets/dr-olivia.png')
  }
];

const PatientAppointmentsScreen = () => {
  const navigation = useNavigation<AppointmentsNavProp>();
  const [activeTab, setActiveTab] = useState('Upcoming');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#724CF9', '#5E3BEE']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={28} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Appointments</Text>
              <Text style={styles.headerSub}>Manage your bookings</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Custom Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Appointments List */}
        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
          {mockAppointments.map((appo) => (
            <View key={appo.id} style={styles.card}>
              <View style={styles.avatarContainer}>
                <Image source={appo.avatar} style={styles.avatar} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.docName}>{appo.name}</Text>
                <Text style={styles.specialty}>{appo.specialty}</Text>
                <Text style={styles.dateTime}>{appo.date} • {appo.time}</Text>
                <Text style={styles.hospital}>{appo.hospital}</Text>
              </View>
              <View style={styles.statusWrap}>
                <Text style={styles.statusText}>{appo.status}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Book Button */}
        <View style={styles.bookButtonContainer}>
          <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate('DoctorAvailability')}>
            <View style={styles.bookButtonContent}>
              <Text style={styles.bookButtonText}>Book New Appointment</Text>
              <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
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
    backgroundColor: '#F9FAFB',
  },
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
    gap: 16,
  },
  backBtn: {
    marginRight: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12
  },
  headerTitle: {
    fontSize: 20,
    marginLeft: 1,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden'
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  cardInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  hospital: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusWrap: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    left: 24,
    right: 24,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 25,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
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
    color: '#9CA3AF' 
  }
});

export default PatientAppointmentsScreen;
