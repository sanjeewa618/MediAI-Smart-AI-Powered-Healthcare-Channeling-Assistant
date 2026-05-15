import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft, Home, Calendar, Heart, FileText, User } from 'lucide-react-native';
import { COLORS } from '../../theme/theme';

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
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#1A1A4B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointments</Text>
          <View style={{ width: 40 }} /> {/* Spacer for centering */}
        </View>

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
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>Book New Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PatientDashboard')}>
            <Home size={24} color="#9CA3AF" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Calendar size={24} color={COLORS.primary} fill={COLORS.primary} />
            <Text style={[styles.navText, { color: COLORS.primary }]}>Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AIHealthAssistant')}>
            <Heart size={24} color="#9CA3AF" />
            <Text style={styles.navText}>AI Health</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <FileText size={24} color="#9CA3AF" />
            <Text style={styles.navText}>Records</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <User size={24} color="#9CA3AF" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A4B',
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
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
