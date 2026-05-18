import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, TextInput } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { Search, Bell, Video, User, FileText, Calendar, Activity, Phone, Clock, FileEdit, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const MOCK_APPOINTMENTS = [
  { id: '1', name: 'Sarah Johnson', age: 28, time: '09:00 AM', type: 'Physical', status: 'Emergency', img: 'https://i.pravatar.cc/150?img=5' },
  { id: '2', name: 'Michael Smith', age: 45, time: '09:30 AM', type: 'Video', status: 'Waiting', img: 'https://i.pravatar.cc/150?img=11' },
  { id: '3', name: 'Emma Brown', age: 34, time: '10:00 AM', type: 'Physical', status: 'Upcoming', img: 'https://i.pravatar.cc/150?img=9' },
  { id: '4', name: 'James Wilson', age: 52, time: '08:30 AM', type: 'Physical', status: 'Completed', img: 'https://i.pravatar.cc/150?img=8' },
];

const greyShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 3,
};

const DoctorDashboard = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Emergency': return '#EF4444';
      case 'Waiting': return '#F59E0B';
      case 'Completed': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Emergency': return '#FEF2F2';
      case 'Waiting': return '#FFFBEB';
      case 'Completed': return '#ECFDF5';
      default: return '#EFF6FF';
    }
  };

  const renderAppointmentCard = (patient: any) => (
    <View key={patient.id} style={[styles.patientCard, greyShadow]}>
      <View style={styles.patientHeader}>
        <Image source={{ uri: patient.img }} style={styles.patientAvatar} />
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientSub}>Age: {patient.age} • {patient.type} Consult</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(patient.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(patient.status) }]}>{patient.status}</Text>
        </View>
      </View>

      <View style={styles.timeRow}>
        <Clock size={16} color="#6B7280" />
        <Text style={styles.timeText}>Scheduled for {patient.time}</Text>
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.actionBtnSecondary}>
          <FileText size={16} color="#4B5563" />
          <Text style={styles.actionBtnTextSecondary}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnSecondary}>
          <FileEdit size={16} color="#4B5563" />
          <Text style={styles.actionBtnTextSecondary}>Prescribe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtnPrimary, patient.status === 'Emergency' && { backgroundColor: '#EF4444' }]}>
          {patient.type === 'Video' ? <Video size={16} color="#FFF" /> : <User size={16} color="#FFF" />}
          <Text style={styles.actionBtnTextPrimary}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        
        {/* Top Header Section */}
        <LinearGradient colors={['#8B3DFF', '#6A11CB', '#5F0FFF']} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.headerProfile}>
              <Image source={{ uri: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png' }} style={styles.docAvatar} />
              <View>
                <Text style={styles.docName}>Dr. Saman Perera</Text>
                <Text style={styles.docSpecialty}>Senior Cardiologist</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.dateText}>May 20, 2026</Text>
              <TouchableOpacity style={styles.iconBtn}>
                <Bell size={20} color="#FFF" />
                <View style={styles.badge} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search patient name or ID..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Quick Stats Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsScrollContent}>
            <View style={[styles.statBox, greyShadow]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Calendar size={22} color="#3B82F6" />
              </View>
              <Text style={styles.statNum}>12</Text>
              <Text style={styles.statLabel}>Appointments</Text>
            </View>
            <View style={[styles.statBox, greyShadow]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#FFFBEB' }]}>
                <Clock size={22} color="#F59E0B" />
              </View>
              <Text style={styles.statNum}>4</Text>
              <Text style={styles.statLabel}>Waiting</Text>
            </View>
            <View style={[styles.statBox, greyShadow]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#FEF2F2' }]}>
                <AlertCircle size={22} color="#EF4444" />
              </View>
              <Text style={styles.statNum}>1</Text>
              <Text style={styles.statLabel}>Emergency</Text>
            </View>
            <View style={[styles.statBox, greyShadow]}>
              <View style={[styles.statIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <CheckCircle2 size={22} color="#10B981" />
              </View>
              <Text style={styles.statNum}>5</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </ScrollView>

          {/* Main Appointments Area */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Queue</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See All</Text></TouchableOpacity>
          </View>

          {MOCK_APPOINTMENTS.map(renderAppointmentCard)}
          
          <View style={{ height: 60 }} />
        </ScrollView>
        <DoctorBottomNavBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },
  wrapper: { flex: 1 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
  },
  docName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  docSpecialty: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1F2937',
  },
  content: {
    paddingTop: 20,
    paddingBottom: 130,
  },
  statsScroll: {
    marginBottom: 24,
  },
  statsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statBox: {
    width: 130,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
  },
  patientCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
  },
  patientInfo: {
    flex: 1,
    marginLeft: 14,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  patientSub: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  actionBtnTextSecondary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    gap: 6,
  },
  actionBtnTextPrimary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default DoctorDashboard;
