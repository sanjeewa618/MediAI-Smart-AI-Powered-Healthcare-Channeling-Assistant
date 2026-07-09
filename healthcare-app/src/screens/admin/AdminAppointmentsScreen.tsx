import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  ArrowLeft, 
  Calendar, 
  Search, 
  Check, 
  X, 
  Clock, 
  CheckCircle
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const MOCK_APPOINTMENTS = [
  {
    _id: 'appt_1',
    patient: { name: 'Dilshan Silva', email: 'dilshan@gmail.com', phone: '0771234567' },
    doctor: { name: 'Dr. Saman Perera', specialization: 'Cardiology', hospital: 'City Hospital' },
    date: '2026-05-20',
    time: '10:30 AM',
    status: 'confirmed'
  },
  {
    _id: 'appt_2',
    patient: { name: 'Nisansala Perera', email: 'nisansala@gmail.com', phone: '0719876543' },
    doctor: { name: 'Dr. Priyantha Cooray', specialization: 'Paediatrics', hospital: 'City Hospital' },
    date: '2026-05-21',
    time: '02:15 PM',
    status: 'pending'
  },
  {
    _id: 'appt_3',
    patient: { name: 'Ruwan Fernando', email: 'ruwan@gmail.com', phone: '0761112223' },
    doctor: { name: 'Dr. K. Liyanage', specialization: 'Neurology', hospital: 'City Hospital' },
    date: '2026-05-22',
    time: '08:00 AM',
    status: 'completed'
  },
  {
    _id: 'appt_4',
    patient: { name: 'Shalini de Silva', email: 'shalini@gmail.com', phone: '0724445556' },
    doctor: { name: 'Dr. Saman Perera', specialization: 'Cardiology', hospital: 'City Hospital' },
    date: '2026-05-18',
    time: '11:00 AM',
    status: 'cancelled'
  }
];

const AdminAppointmentsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success && data.data && data.data.length > 0) {
        setAppointments(data.data);
      } else {
        // Fallback to mock data if empty database
        setAppointments(MOCK_APPOINTMENTS);
      }
    } catch (error) {
      console.error('Fetch appointments error:', error);
      // Fail gracefully to mock data
      setAppointments(MOCK_APPOINTMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', `Appointment marked as ${newStatus}.`);
        fetchAppointments();
      } else {
        // If API fails (e.g. mock items in frontend offline mode) update locally
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
        Alert.alert('Status Updated', `Appointment status updated locally to ${newStatus}.`);
      }
    } catch (error) {
      console.error('Update status error:', error);
      // Fallback local update
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
      Alert.alert('Status Updated', `Appointment status updated locally to ${newStatus}.`);
    }
  };

  // Stats derived dynamically
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed' || a.status === 'scheduled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
    };
  }, [appointments]);

  // Filters + Search Query matching doctor/patient names
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const matchFilter = activeFilter === 'all' || appt.status === activeFilter;
      const docName = appt.doctor?.name || '';
      const patName = appt.patient?.name || '';
      const matchSearch = docName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          patName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [appointments, activeFilter, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#FEF3C7', text: '#D97706' };
      case 'confirmed':
      case 'scheduled': return { bg: '#EFF6FF', text: '#3B82F6' };
      case 'completed': return { bg: '#ECFDF5', text: '#10B981' };
      case 'cancelled': return { bg: '#FEF2F2', text: '#EF4444' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={COLORS.screenHeaderGradient as any} 
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Hospital Appointments</Text>
            <Text style={styles.headerSubtitle}>Overall hospital booking logs</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Overview Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, SHADOWS.light, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.statLabel}>Total Appts</Text>
          <View style={styles.statRow}>
            <Calendar size={20} color="#6B7280" />
            <Text style={styles.statVal}>{stats.total}</Text>
          </View>
        </View>

        <View style={[styles.statCard, SHADOWS.light, { borderLeftColor: '#3B82F6' }]}>
          <Text style={styles.statLabel}>Pending</Text>
          <View style={styles.statRow}>
            <Clock size={20} color="#F59E0B" />
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>{stats.pending}</Text>
          </View>
        </View>

        <View style={[styles.statCard, SHADOWS.light, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.statLabel}>Confirmed</Text>
          <View style={styles.statRow}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={[styles.statVal, { color: '#10B981' }]}>{stats.confirmed}</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search patient, doctor..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.tabItem, 
                activeFilter === item ? styles.tabItemActive : null
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text 
                style={[
                  styles.tabText, 
                  activeFilter === item ? styles.tabTextActive : null
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List Container */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList 
          data={filteredAppointments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Calendar size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No matching appointments found.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const colors = getStatusColor(item.status);
            return (
              <View style={[styles.appointmentCard, SHADOWS.small]}>
                <View style={styles.cardHeader}>
                  <View style={styles.patientInfo}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarLetter}>
                        {item.patient?.name ? item.patient.name.charAt(0).toUpperCase() : 'P'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.patientName}>{item.patient?.name || 'Unknown Patient'}</Text>
                      <Text style={styles.patientContact}>{item.patient?.phone || 'No phone number'}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {item.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                  <Text style={styles.doctorLabel}>Doctor Details:</Text>
                  <Text style={styles.doctorName}>{item.doctor?.name || 'Dr. Not Assigned'}</Text>
                  <Text style={styles.doctorSpec}>{item.doctor?.specialization || 'General Practitioner'}</Text>

                  <View style={styles.timeInfoRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Date</Text>
                      <Text style={styles.infoVal}>{item.date}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Time</Text>
                      <Text style={styles.infoVal}>{item.time}</Text>
                    </View>
                  </View>
                </View>

                {/* Status operations buttons for admin */}
                {item.status === 'pending' && (
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.btnConfirm]}
                      onPress={() => handleUpdateStatus(item._id, 'confirmed')}
                    >
                      <Check size={16} color="#FFF" />
                      <Text style={styles.actionBtnText}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.btnCancel]}
                      onPress={() => handleUpdateStatus(item._id, 'cancelled')}
                    >
                      <X size={16} color="#FFF" />
                      <Text style={styles.actionBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {(item.status === 'confirmed' || item.status === 'scheduled') && (
                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.btnComplete]}
                      onPress={() => handleUpdateStatus(item._id, 'completed')}
                    >
                      <CheckCircle size={16} color="#FFF" />
                      <Text style={styles.actionBtnText}>Complete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      <AdminBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 30 : 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 55,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    minHeight: 44,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerTextWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -24,
    zIndex: 10
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6
  },
  statVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937'
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 18
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937'
  },
  tabsWrapper: {
    marginTop: 12,
    paddingHorizontal: 20
  },
  tabsList: {
    paddingBottom: 4
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563'
  },
  tabTextActive: {
    color: '#FFF'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 85
  },
  appointmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary
  },
  patientName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937'
  },
  patientContact: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800'
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12
  },
  cardBody: {
    paddingHorizontal: 2
  },
  doctorLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2
  },
  doctorSpec: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 1
  },
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginTop: 12
  },
  infoCol: {
    flex: 1
  },
  infoLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 2
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4
  },
  btnConfirm: {
    backgroundColor: '#10B981'
  },
  btnCancel: {
    backgroundColor: '#EF4444'
  },
  btnComplete: {
    backgroundColor: COLORS.primary
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600'
  }
});

export default AdminAppointmentsScreen;
