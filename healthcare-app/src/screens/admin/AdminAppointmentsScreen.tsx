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
  ScrollView,
  Modal
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
  CheckCircle,
  FileText,
  User as UserIcon,
  Download,
  AlertTriangle
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import moment from 'moment';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.158.225.227:4000';

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
  
  // Dashboard states
  const [selectedType, setSelectedType] = useState<'doctor' | 'lab'>('doctor');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labBookings, setLabBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  const [globalStats, setGlobalStats] = useState({
    cancelled: 0,
    pending: 0,
    completed: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Doctor appointments
      const apptUrl = `${API_BASE_URL}/api/appointments?status=${activeFilter}&search=${encodeURIComponent(debouncedSearchQuery)}`;
      const apptResponse = await fetch(apptUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const apptData = await apptResponse.json();
      if (apptResponse.ok && apptData.success && apptData.data) {
        setAppointments(apptData.data);
        if (apptData.stats) {
          if (selectedType === 'doctor') setGlobalStats(apptData.stats);
        }
      } else {
        setAppointments([]);
      }

      // 2. Fetch Lab test bookings (booked by patients)
      const labUrl = `${API_BASE_URL}/api/labs/bookings?limit=100&status=${activeFilter}&search=${encodeURIComponent(debouncedSearchQuery)}`;
      const labResponse = await fetch(labUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const labData = await labResponse.json();
      if (labResponse.ok && labData.success) {
        setLabBookings(labData.data || []);
        if (labData.stats) {
          if (selectedType === 'lab') setGlobalStats(labData.stats);
        }
      } else {
        setLabBookings([]);
      }
    } catch (error) {
      console.error('Fetch all data error:', error);
      setAppointments(MOCK_APPOINTMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token, activeFilter, debouncedSearchQuery, selectedType]);

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
        fetchAllData();
      } else {
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
        Alert.alert('Status Updated', `Appointment status updated locally to ${newStatus}.`);
      }
    } catch (error) {
      console.error('Update status error:', error);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
      Alert.alert('Status Updated', `Appointment status updated locally to ${newStatus}.`);
    }
  };

  // PDF Receipt Generation for Lab Bookings
  const handleDownloadLabReceipt = async (booking: any) => {
    try {
      const formattedDate = moment(booking.appointmentDate).format('DD MMMM YYYY');
      const timeStr = booking.scheduleSlot?.startTime || 'N/A';
      const statusText = booking.paymentMethod === 'Cash' ? 'Paid at Hospital' : 'Paid';
      const statusBgColor = booking.paymentMethod === 'Cash' ? '#FEF3C7' : '#D1FAE5';
      const statusTextColor = booking.paymentMethod === 'Cash' ? '#B45309' : '#065F46';

      const htmlContent = `
        <html>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1F2937;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; margin-bottom: 5px;">MediAI Smart Channeling</h1>
              <p style="color: #6B7280; margin-top: 0; font-size: 14px;">Lab Appointment E-Receipt</p>
              
              <!-- Payment Status Badge -->
              <div style="margin-top: 10px; margin-bottom: 10px;">
                <span style="display: inline-block; padding: 6px 16px; background-color: ${statusBgColor}; color: ${statusTextColor}; font-weight: bold; border-radius: 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${statusText}
                </span>
              </div>

              <div style="display: inline-block; padding: 6px 12px; background-color: #ECFDF5; color: #047857; font-weight: bold; border-radius: 20px; font-size: 14px; margin-top: 5px;">
                Booking ID: #${booking.bookingRef}
              </div>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #E5E7EB; margin-bottom: 30px;" />
            
            <h3 style="color: #3b82f6; border-bottom: 2px solid #EFF6FF; padding-bottom: 8px;">Patient Information</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280; width: 35%;"><strong>Patient Name</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${booking.patient?.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>NIC / Passport</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${booking.patient?.nic}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Mobile Number</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${booking.patient?.mobile}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Gender</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${booking.patient?.gender}</td>
              </tr>
              ${booking.collectionMethod === 'Home' ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Collection Address</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${booking.homeAddress || ''}</td>
              </tr>
              ` : ''}
            </table>
            
            <h3 style="color: #3b82f6; border-bottom: 2px solid #EFF6FF; padding-bottom: 8px;">Lab & Appointment Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280; width: 35%;"><strong>Lab Test</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937; font-weight: bold;">${booking.lab?.description || 'Lab Test'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Lab Center</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${booking.lab?.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Date & Time</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${formattedDate} at ${timeStr}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Collection Method</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${booking.collectionMethod === 'Home' ? 'Home Collection' : 'Hospital Visit'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Assigned Nurse</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">Nurse ${booking.scheduleSlot?.nurse || 'Assigned Nurse'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Queue Token</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #3b82f6; font-weight: bold; font-size: 16px;">${booking.queueToken || 1}</td>
              </tr>
            </table>

            <div style="background-color: #F9FAFB; padding: 20px; border-radius: 12px; border: 1px solid #E5E7EB; text-align: right; margin-top: 20px;">
              <span style="color: #6B7280; font-size: 14px; margin-right: 15px;">Amount:</span>
              <strong style="color: #3b82f6; font-size: 20px;">${booking.lab?.price || 'LKR 1500'}</strong>
            </div>
            
            <div style="text-align: center; margin-top: 50px; color: #9CA3AF; font-size: 12px;">
              <p>Thank you for using MediAI. Please produce this receipt/e-token at the lab center.</p>
              <p style="margin-top: 5px;">MediAI Smart Healthcare Channeling Assistant &copy; 2026</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Saved', 'Receipt saved to your documents.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate receipt PDF.');
    }
  };

  // PDF Receipt Generation for Doctor Bookings
  const handleDownloadDoctorReceipt = async (appt: any) => {
    try {
      const formattedDate = moment(appt.date).format('DD MMMM YYYY');
      const timeStr = appt.timeSlot || appt.time || 'N/A';
      
      const htmlContent = `
        <html>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #1F2937;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin-bottom: 5px;">MediAI Smart Channeling</h1>
              <p style="color: #6B7280; margin-top: 0; font-size: 14px;">Doctor Appointment E-Receipt</p>
              
              <!-- Payment Status Badge -->
              <div style="margin-top: 10px; margin-bottom: 10px;">
                <span style="display: inline-block; padding: 6px 16px; background-color: #D1FAE5; color: #065F46; font-weight: bold; border-radius: 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                  PAID
                </span>
              </div>

              <div style="display: inline-block; padding: 6px 12px; background-color: #EEF2FF; color: #4F46E5; font-weight: bold; border-radius: 20px; font-size: 14px; margin-top: 5px;">
                Booking ID: #${appt._id ? appt._id.slice(-6).toUpperCase() : '9824X'}
              </div>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #E5E7EB; margin-bottom: 30px;" />
            
            <h3 style="color: #6366f1; border-bottom: 2px solid #EEF2FF; padding-bottom: 8px;">Patient Information</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280; width: 35%;"><strong>Patient Name</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${appt.patient?.name || 'John Doe'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>NIC / Passport</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${appt.patient?.nic || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Mobile Number</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${appt.patient?.phone || 'No phone number'}</td>
              </tr>
            </table>
            
            <h3 style="color: #6366f1; border-bottom: 2px solid #EEF2FF; padding-bottom: 8px;">Doctor & Appointment Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280; width: 35%;"><strong>Doctor Name</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937; font-weight: bold;">${appt.doctor?.name || 'Dr. Not Assigned'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Specialty</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${appt.doctor?.specialization || 'General Practitioner'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Date & Time</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #1F2937;">${formattedDate} at ${timeStr}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6B7280;"><strong>Queue Number</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #6366f1; font-weight: bold; font-size: 16px;">Token #${appt.queueNumber || 1}</td>
              </tr>
            </table>

            <div style="background-color: #F9FAFB; padding: 20px; border-radius: 12px; border: 1px solid #E5E7EB; text-align: right; margin-top: 20px;">
              <span style="color: #6B7280; font-size: 14px; margin-right: 15px;">Total Consultation Fee Paid:</span>
              <strong style="color: #6366f1; font-size: 20px;">LKR 2000.00</strong>
            </div>
            
            <div style="text-align: center; margin-top: 50px; color: #9CA3AF; font-size: 12px;">
              <p>Thank you for using MediAI. Please produce this receipt/e-token at the channeling center.</p>
              <p style="margin-top: 5px;">MediAI Smart Healthcare Channeling Assistant &copy; 2026</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Saved', 'Receipt saved to your documents.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate receipt PDF.');
    }
  };

  // Stats derived dynamically based on globalStats
  const stats = useMemo(() => {
    return {
      cancelled: globalStats.cancelled || 0,
      pending: globalStats.pending || 0,
      completed: globalStats.completed || 0
    };
  }, [globalStats]);

  // Filters + Search Query are now handled by the backend
  const filteredData = useMemo(() => {
    return selectedType === 'doctor' ? appointments : labBookings;
  }, [appointments, labBookings, selectedType]);

  const getStatusColor = (status: string) => {
    if (!status) return { bg: '#F3F4F6', text: '#6B7280' };
    const s = status.toLowerCase();
    switch (s) {
      case 'pending': return { bg: '#FEF3C7', text: '#D97706' };
      case 'confirmed':
      case 'scheduled': return { bg: '#EFF6FF', text: '#3B82F6' };
      case 'checked-in':
      case 'sample-collected':
      case 'testing': return { bg: '#F5F3FF', text: '#7C3AED' };
      case 'completed': return { bg: '#ECFDF5', text: '#10B981' };
      case 'cancelled': return { bg: '#FEF2F2', text: '#EF4444' };
      case 'started': return { bg: '#E0E7FF', text: '#4F46E5' };
      case 'ready': return { bg: '#DCFCE7', text: '#16A34A' };
      case 'nextin': return { bg: '#FEF9C3', text: '#CA8A04' };
      case 'in': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'skipped': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAppt(null);
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
            <Text style={styles.headerTitle}>Hospital Bookings</Text>
            <Text style={styles.headerSubtitle}>Overall hospital booking logs</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Selector Tabs: Doctor vs Nurse */}
      <View style={styles.typeSelectorContainer}>
        <TouchableOpacity 
          style={[styles.typeTab, selectedType === 'doctor' && styles.typeTabActive]}
          onPress={() => {
            setSelectedType('doctor');
            setActiveFilter('all');
          }}
        >
          <Text style={[styles.typeTabText, selectedType === 'doctor' && styles.typeTabTextActive]}>
            Doctor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeTab, selectedType === 'lab' && styles.typeTabActive]}
          onPress={() => {
            setSelectedType('lab');
            setActiveFilter('all');
          }}
        >
          <Text style={[styles.typeTabText, selectedType === 'lab' && styles.typeTabTextActive]}>
            Nurse
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overview Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, SHADOWS.light, { borderLeftColor: '#EF4444' }]}>
          <Text style={styles.statLabel}>Cancelled</Text>
          <View style={styles.statRow}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={[styles.statVal, { color: '#EF4444' }]}>{stats.cancelled}</Text>
          </View>
        </View>

        <View style={[styles.statCard, SHADOWS.light, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.statLabel}>Pending</Text>
          <View style={styles.statRow}>
            <Clock size={20} color="#F59E0B" />
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>{stats.pending}</Text>
          </View>
        </View>

        <View style={[styles.statCard, SHADOWS.light, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.statLabel}>Completed</Text>
          <View style={styles.statRow}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={[styles.statVal, { color: '#10B981' }]}>{stats.completed}</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput 
            style={styles.searchInput}
            placeholder={
              selectedType === 'doctor' 
                ? 'Search patient, doctor...' 
                : 'Search patient, nurse, ref ID...'
            }
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
          data={
            selectedType === 'doctor' 
              ? (['all', 'pending', 'today', 'activeIN', 'completed', 'cancelled'] as const)
              : (['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const)
          }
          keyExtractor={(item) => item}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.tabItem, 
                activeFilter.toLowerCase() === item.toLowerCase() ? styles.tabItemActive : null
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text 
                style={[
                  styles.tabText, 
                  activeFilter.toLowerCase() === item.toLowerCase() ? styles.tabTextActive : null
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
          data={filteredData}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Calendar size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No matching bookings found.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const colors = getStatusColor(item.status);
            
            if (selectedType === 'doctor') {
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
                        <Text style={styles.infoVal}>
                          {moment(item.date).isValid() ? moment(item.date).format('YYYY-MM-DD') : item.date}
                        </Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Time</Text>
                        <Text style={styles.infoVal}>{item.timeSlot || item.time || 'N/A'}</Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Token</Text>
                        <Text style={[styles.infoVal, { color: COLORS.primary }]}>Token  #  {item.queueNumber || 1}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Doctor Card Status Actions */}
                  <View style={styles.cardActions}>
                    {item.status === 'pending' && (
                      <>
                        <TouchableOpacity 
                          style={[styles.actionBtn, { backgroundColor: '#FEE2E2', marginRight: 8 }]}
                          onPress={() => handleUpdateStatus(item._id, 'cancelled')}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#DC2626' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionBtn, { backgroundColor: '#D1FAE5', marginRight: 8 }]}
                          onPress={() => handleUpdateStatus(item._id, 'confirmed')}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#065F46' }}>Accept</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: COLORS.primaryLight }]}
                      onPress={() => {
                        setSelectedAppt(item);
                        setReceiptModalVisible(true);
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary }}>View Receipt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#EFF6FF', marginLeft: 8 }]}
                      onPress={() => handleDownloadDoctorReceipt(item)}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#2563EB' }}>Download PDF</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            } else {
              // Lab booking render item under Nurse tab
              return (
                <View style={[styles.appointmentCard, SHADOWS.small]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.patientInfo}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarLetter}>
                          {item.patient?.fullName ? item.patient.fullName.charAt(0).toUpperCase() : 'P'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.patientName}>{item.patient?.fullName || 'Unknown Patient'}</Text>
                        <Text style={styles.patientContact}>NIC: {item.patient?.nic || 'N/A'}</Text>
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
                    <Text style={styles.doctorLabel}>Lab & Nurse Details:</Text>
                    <Text style={styles.doctorName}>{item.lab?.name || 'Lab Center'}</Text>
                    <Text style={styles.doctorSpec}>Nurse: {item.scheduleSlot?.nurse || 'Assigned Nurse'}</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      Test: {item.lab?.description || 'Lab Test'}
                    </Text>

                    <View style={styles.timeInfoRow}>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoVal}>{moment(item.appointmentDate).format('YYYY-MM-DD')}</Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Time</Text>
                        <Text style={styles.infoVal}>{item.scheduleSlot?.startTime || 'N/A'}</Text>
                      </View>
                      <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Token</Text>
                        <Text style={[styles.infoVal, { color: COLORS.primary }]}>Token {item.queueToken || 1}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: COLORS.primaryLight }]}
                      onPress={() => {
                        setSelectedAppt(item);
                        setReceiptModalVisible(true);
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary }}>View Receipt</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]}
                      onPress={() => handleDownloadLabReceipt(item)}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#2563EB' }}>Download PDF</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }
          }}
        />
      )}

      {/* Doctor Summary / Detail Modal */}
      <Modal 
        visible={modalVisible} 
        animationType="fade" 
        transparent 
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Appointment Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <X size={20} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            {selectedAppt != null && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalProfileRow}>
                  <View style={styles.modalPhotoPlaceholder}>
                    <UserIcon size={32} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.modalName}>{selectedAppt.patient?.name}</Text>
                    <Text style={styles.modalSub}>{selectedAppt.patient?.email} • {selectedAppt.patient?.phone}</Text>
                  </View>
                </View>
                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>Channeling Details</Text>
                  <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Doctor:</Text> {selectedAppt.doctor?.name}</Text>
                  <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Specialization:</Text> {selectedAppt.doctor?.specialization}</Text>
                  <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Hospital:</Text> {selectedAppt.doctor?.hospital}</Text>
                  <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Scheduled Date:</Text> {selectedAppt.date}</Text>
                  <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Time Slot:</Text> {selectedAppt.time}</Text>
                  <Text style={styles.infoText}><Text style={{ fontWeight: '600' }}>Status:</Text> {selectedAppt.status}</Text>
                </View>

                {selectedAppt.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, paddingHorizontal: 16, marginBottom: 10 }}>
                    <TouchableOpacity 
                      style={{ backgroundColor: '#EF4444', flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                      onPress={() => {
                        handleUpdateStatus(selectedAppt._id, 'cancelled');
                        setModalVisible(false);
                      }}
                    >
                      <Text style={{ color: '#FFF', fontWeight: '700' }}>Cancel Appointment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={{ backgroundColor: '#10B981', flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                      onPress={() => {
                        handleUpdateStatus(selectedAppt._id, 'confirmed');
                        setModalVisible(false);
                      }}
                    >
                      <Text style={{ color: '#FFF', fontWeight: '700' }}>Accept Appointment</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Receipt Modal (Nurse Tab Lab Appointment Summary) */}
      <Modal 
        visible={receiptModalVisible} 
        animationType="slide" 
        transparent 
        onRequestClose={() => setReceiptModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lab Booking Receipt</Text>
              <TouchableOpacity onPress={() => setReceiptModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>
            {selectedAppt != null && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedAppt.doctor ? (
                  /* Doctor Receipt Card Visual Layout */
                  <View style={styles.receiptCardLayout}>
                    {/* Status Banner */}
                    <View style={[styles.receiptStatusBanner, { backgroundColor: '#D1FAE5' }]}>
                      <Text style={[styles.receiptStatusText, { color: '#065F46' }]}>
                        PAID
                      </Text>
                    </View>

                    <Text style={styles.receiptTitleCenter}>MediAI Smart Channeling</Text>
                    <Text style={styles.receiptSubCenter}>Doctor Appointment E-Receipt</Text>
                    <Text style={styles.receiptRefCenter}>Ref No: #{selectedAppt._id ? selectedAppt._id.slice(-6).toUpperCase() : '9824X'}</Text>

                    <View style={styles.receiptDividerLine} />

                    <View style={styles.receiptDetailsSection}>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Patient Name</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.patient?.name || 'John Doe'}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>NIC / Passport</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.patient?.nic || 'N/A'}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Phone Number</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.patient?.phone || 'No phone number'}</Text>
                      </View>

                      <View style={styles.receiptDividerLine} />

                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Doctor Name</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.doctor?.name || 'Dr. Not Assigned'}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Specialty</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.doctor?.specialization || 'General Practitioner'}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Date & Time</Text>
                        <Text style={styles.receiptDetailValue}>
                          {moment(selectedAppt.date).format('YYYY-MM-DD')} at {selectedAppt.timeSlot || selectedAppt.time || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Queue Number</Text>
                        <Text style={[styles.receiptDetailValue, { color: COLORS.primary, fontWeight: '800' }]}>Token {selectedAppt.queueNumber || 1}</Text>
                      </View>

                      <View style={styles.receiptDividerLine} />

                      <View style={styles.receiptPriceRow}>
                        <Text style={styles.receiptPriceLabel}>Total Price</Text>
                        <Text style={styles.receiptPriceValue}>LKR 2000.00</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  /* Lab Receipt Card Visual Layout */
                  <View style={styles.receiptCardLayout}>
                    {/* Status Banner */}
                    <View style={[styles.receiptStatusBanner, { backgroundColor: selectedAppt.paymentMethod === 'Cash' ? '#FEF3C7' : '#D1FAE5' }]}>
                      <Text style={[styles.receiptStatusText, { color: selectedAppt.paymentMethod === 'Cash' ? '#B45309' : '#065F46' }]}>
                        {selectedAppt.paymentMethod === 'Cash' ? 'PAID AT HOSPITAL' : 'PAID'}
                      </Text>
                    </View>

                    <Text style={styles.receiptTitleCenter}>MediAI Smart Channeling</Text>
                    <Text style={styles.receiptSubCenter}>Lab Appointment E-Receipt</Text>
                    <Text style={styles.receiptRefCenter}>Ref No: {selectedAppt.bookingRef}</Text>

                    <View style={styles.receiptDividerLine} />

                    <View style={styles.receiptDetailsSection}>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Patient Name</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.patient?.fullName}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>NIC / Passport</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.patient?.nic}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Phone Number</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.patient?.mobile}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Gender</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.patient?.gender}</Text>
                      </View>

                      <View style={styles.receiptDividerLine} />

                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Lab Center</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.lab?.name}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Lab Test</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.lab?.description || 'Lab Test'}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Date & Time</Text>
                        <Text style={styles.receiptDetailValue}>
                          {moment(selectedAppt.appointmentDate).format('YYYY-MM-DD')} at {selectedAppt.scheduleSlot?.startTime || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Assigned Nurse</Text>
                        <Text style={styles.receiptDetailValue}>Nurse {selectedAppt.scheduleSlot?.nurse || 'Assigned Nurse'}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Queue Token</Text>
                        <Text style={[styles.receiptDetailValue, { color: COLORS.primary, fontWeight: '800' }]}>Token {selectedAppt.queueToken || 1}</Text>
                      </View>
                      <View style={styles.receiptDetailRow}>
                        <Text style={styles.receiptDetailLabel}>Collection Method</Text>
                        <Text style={styles.receiptDetailValue}>{selectedAppt.collectionMethod}</Text>
                      </View>
                      {selectedAppt.collectionMethod === 'Home' && (
                        <View style={styles.receiptDetailRow}>
                          <Text style={styles.receiptDetailLabel}>Home Address</Text>
                          <Text style={styles.receiptDetailValue}>{selectedAppt.homeAddress}</Text>
                        </View>
                      )}

                      <View style={styles.receiptDividerLine} />

                      <View style={styles.receiptPriceRow}>
                        <Text style={styles.receiptPriceLabel}>Total Price</Text>
                        <Text style={styles.receiptPriceValue}>{selectedAppt.lab?.price || 'LKR 1500'}</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={[styles.modalBtnColumn, { marginTop: 20 }]}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => {
                      if (selectedAppt.doctor) {
                        handleDownloadDoctorReceipt(selectedAppt);
                      } else {
                        handleDownloadLabReceipt(selectedAppt);
                      }
                      setReceiptModalVisible(false);
                    }}
                  >
                    <Download size={18} color="#FFF" />
                    <Text style={styles.actionBtnText}>Download PDF Receipt</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 40,
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
  typeSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -24,
    borderRadius: 14,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 20,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeTabActive: {
    backgroundColor: COLORS.primary,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  typeTabTextActive: {
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
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
    alignItems: 'center',
    paddingVertical: 40
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 85
  },
  appointmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
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
    width: 34,
    height: 34,
    borderRadius: 17,
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
    marginVertical: 8
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
    borderRadius: 8,
    padding: 8,
    marginTop: 8
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
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeader
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20
  },
  modalPhotoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  infoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 20
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textHeader,
    lineHeight: 18
  },
  modalBtnColumn: {
    gap: 10
  },
  // Receipt Card Layout Styles
  receiptCardLayout: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  receiptStatusBanner: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  receiptStatusText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  receiptTitleCenter: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 4
  },
  receiptSubCenter: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 2
  },
  receiptRefCenter: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10
  },
  receiptDividerLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
    borderStyle: 'dashed'
  },
  receiptDetailsSection: {
    gap: 10
  },
  receiptDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  receiptDetailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1
  },
  receiptDetailValue: {
    fontSize: 13,
    color: COLORS.textHeader,
    fontWeight: '700',
    textAlign: 'right',
    flex: 2
  },
  receiptPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  receiptPriceLabel: {
    fontSize: 14,
    color: COLORS.textHeader,
    fontWeight: '800'
  },
  receiptPriceValue: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '900'
  }
});

export default AdminAppointmentsScreen;
