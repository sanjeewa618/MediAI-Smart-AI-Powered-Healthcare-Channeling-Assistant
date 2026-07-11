import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Image, Platform, Switch,
  Dimensions, Modal, TextInput, FlatList, Alert
} from 'react-native';
import { 
  ChevronLeft, Bell, Calendar as CalendarIcon, 
  Clock, User, Plus, MoreVertical, Edit2, 
  Trash2, Pause, Copy, Users, CheckCircle, 
  Activity, Zap, Shield, Search, Info,
  AlertTriangle, Filter, Settings, FlaskConical,
  Microscope, Droplets, Heart, Baby, Dna, Sparkles, X, MapPin
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const { width } = Dimensions.get('window');

const greyShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 4,
};

const LAB_TYPES = [
  { id: '1', name: 'Blood Test', icon: Droplets, bookings: 42, slots: 15, color: '#FEE2E2', iconColor: '#EF4444' },
  { id: '2', name: 'ECG', icon: Activity, bookings: 12, slots: 8, color: '#E0F2FE', iconColor: '#0EA5E9' },
  { id: '3', name: 'MRI', icon: Zap, bookings: 5, slots: 3, color: '#F3F4FF', iconColor: '#6366F1' },
  { id: '4', name: 'Scan', icon: Microscope, bookings: 28, slots: 10, color: '#F0FDF4', iconColor: '#22C55E' },
  { id: '5', name: 'X-Ray', icon: Shield, bookings: 15, slots: 20, color: '#FEF9C3', iconColor: '#CA8A04' },
  { id: '6', name: 'PCR', icon: FlaskConical, bookings: 10, slots: 5, color: '#FDF2F8', iconColor: '#DB2777' },
  { id: '7', name: 'Urine Test', icon: Droplets, bookings: 18, slots: 12, color: '#F0FDF4', iconColor: '#10B981' },
];

const SCHEDULE_SLOTS = [
  { 
    id: 's1', time: '08:00 AM - 10:00 AM', maxPatients: 20, booked: 18, 
    nurse: 'Nurse Sarah', status: 'Active', room: 'Room 01', type: 'Blood Test' 
  },
  { 
    id: 's2', time: '10:00 AM - 12:00 PM', maxPatients: 15, booked: 5, 
    nurse: 'Nurse Nimali', status: 'Active', room: 'Room 02', type: 'Blood Test' 
  },
  { 
    id: 's3', time: '01:00 PM - 03:00 PM', maxPatients: 15, booked: 15, 
    nurse: 'Nurse Sarah', status: 'Full', room: 'Room 01', type: 'Blood Test' 
  },
];

const NURSES = [
  { id: 'n1', name: 'Nurse Sarah', dept: 'Hematology', shift: '08:00 AM - 04:00 PM', status: 'Available', photo: 'https://img.icons8.com/bubbles/100/000000/user-female.png' },
  { id: 'n2', name: 'Nurse Nimali', dept: 'General', shift: '10:00 AM - 06:00 PM', status: 'On Duty', photo: 'https://img.icons8.com/bubbles/100/000000/user-female.png' },
];

const TIMELINE = [
  { time: '08:00 AM', label: 'Blood Test Collection', nurse: 'Sarah' },
  { time: '09:00 AM', label: 'ECG Screening Session', nurse: 'Kamal' },
  { time: '10:30 AM', label: 'MRI Critical Scan', nurse: 'Nimali' },
];

const LabSchedulingScreen: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState('');
  const [myLabId, setMyLabId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [currentMonthYear, setCurrentMonthYear] = useState(moment().format('MMMM YYYY'));
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [editingSlot, setEditingSlot] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState({
    type: '',
    startTime: '',
    endTime: '',
    capacity: '',
    nurse: ''
  });

  const fetchProfileAndLab = async () => {
    try {
      const profRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profData = await profRes.json();
      if (profRes.ok && profData.success) {
        const user = profData.data;
        setUserName(user.name);
        setDepartment(user.department || 'Blood Test');

        const labsRes = await fetch(`${API_BASE_URL}/api/labs?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const labsData = await labsRes.json();
        if (labsRes.ok && labsData.success) {
          const list = labsData.data || [];
          let foundLab = list.find((l: any) => l.assignedNurse?._id === user._id);
          if (!foundLab) {
            foundLab = list.find((l: any) => l.name?.toLowerCase() === user.department?.toLowerCase());
          }
          if (foundLab) {
            setMyLabId(foundLab._id);
            fetchSchedule(foundLab._id, selectedDate);
          } else {
            setMyLabId(user._id);
            fetchSchedule(user._id, selectedDate);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile and lab:', err);
    }
  };

  const fetchSchedule = async (labId: string, date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/labs/${labId}/schedule?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSlots(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch schedule slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfileAndLab();
    }
  }, [token]);

  useEffect(() => {
    if (myLabId) {
      fetchSchedule(myLabId, selectedDate);
      setCurrentMonthYear(moment(selectedDate).format('MMMM YYYY'));
    }
  }, [selectedDate, myLabId]);

  useFocusEffect(
    useCallback(() => {
      if (myLabId) {
        fetchSchedule(myLabId, selectedDate);
      }
    }, [myLabId, selectedDate])
  );

  const handleEdit = (slot: any) => {
    setEditingSlot(slot);
    setFormData({
      type: slot.type || department,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.maxPatients.toString(),
      nurse: slot.nurse || userName
    });
    setShowAddModal(true);
  };

  const handleDelete = async (slotId: string) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to delete this schedule slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/api/labs/schedule/${slotId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const data = await res.json();
              if (res.ok) {
                Alert.alert('Success', 'Slot deleted successfully');
                if (myLabId) fetchSchedule(myLabId, selectedDate);
              } else {
                Alert.alert('Error', data.message || 'Failed to delete slot');
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Could not delete slot');
            }
          }
        }
      ]
    );
  };

  const saveSlot = async () => {
    if (!formData.startTime || !formData.endTime || !formData.capacity) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      if (editingSlot) {
        const res = await fetch(`${API_BASE_URL}/api/labs/schedule/${editingSlot._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            startTime: formData.startTime,
            endTime: formData.endTime,
            maxPatients: parseInt(formData.capacity, 10),
            nurse: formData.nurse || userName
          })
        });

        const data = await res.json();
        if (res.ok) {
          Alert.alert('Success', 'Slot updated successfully');
          if (myLabId) fetchSchedule(myLabId, selectedDate);
          closeModal();
        } else {
          Alert.alert('Error', data.message || 'Failed to update slot');
        }
      } else {
        if (!myLabId) return;
        const res = await fetch(`${API_BASE_URL}/api/labs/${myLabId}/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            date: selectedDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            maxPatients: parseInt(formData.capacity, 10),
            nurse: userName,
            room: 'Room 01',
            type: department
          })
        });

        const data = await res.json();
        if (res.ok) {
          Alert.alert('Success', 'Slot added successfully');
          if (myLabId) fetchSchedule(myLabId, selectedDate);
          closeModal();
        } else {
          Alert.alert('Error', data.message || 'Failed to add slot');
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not save slot details');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingSlot(null);
    setFormData({ type: '', startTime: '', endTime: '', capacity: '', nurse: '' });
  };

  const DAYS = Array.from({ length: 7 }, (_, i) => {
    const d = moment().add(i, 'days');
    return {
      day: d.format('ddd'),
      dateStr: d.format('YYYY-MM-DD'),
      dateNum: d.date(),
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitleText}>Lab Scheduling</Text>
              <Text style={styles.headerSubText}>Manage Slots & Staffing</Text>
            </View>
          </View>
          <View style={styles.headerRightHeader}>
            <View style={styles.statusToggleHeader}>
              <Text style={styles.statusTextHeader}>{isOnline ? 'Online' : 'Offline'}</Text>
              <Switch 
                value={isOnline} 
                onValueChange={setIsOnline}
                trackColor={{ false: 'rgba(255,255,255,0.3)', true: COLORS.success }} 
                thumbColor="#FFF" 
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
            <TouchableOpacity style={styles.bellBtnHeader}>
              <Bell size={20} color="#FFF" />
              <View style={styles.notificationDotHeader} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchContainerHeader}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput 
            style={styles.searchInputHeader}
            placeholder="Search categories, staff or time slots..."
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          { [
            { label: 'Total Slots', value: slots.length.toString().padStart(2, '0'), icon: CalendarIcon, color: COLORS.primary },
            { label: 'Available', value: slots.filter(s => s.booked < s.maxPatients).length.toString().padStart(2, '0'), icon: CheckCircle, color: COLORS.success },
            { label: 'Fully Booked', value: slots.filter(s => s.booked >= s.maxPatients).length.toString().padStart(2, '0'), icon: AlertTriangle, color: COLORS.error },
            { label: 'Assigned', value: '01', icon: Users, color: '#6366F1' },
          ].map((stat, idx) => (
            <View key={idx} style={[styles.statCard, greyShadow]}>
              <View style={[styles.statIconBox, { backgroundColor: stat.color + '1A' }]}>
                <stat.icon size={16} color={stat.color} />
              </View>
              <View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Calendar / Date Picker Area */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setShowCalendarModal(true)}>
              <Text style={styles.monthText}>{currentMonthYear} <CalendarIcon size={16} color={COLORS.primary} /></Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setShowCalendarModal(true)}>
              <Filter size={16} color={COLORS.textSecondary} />
              <Text style={styles.filterText}>Select Date</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePicker}>
            {DAYS.map((d, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[
                  styles.dateCard, 
                  selectedDate === d.dateStr && styles.dateCardActive,
                  greyShadow
                ]}
                onPress={() => setSelectedDate(d.dateStr)}
              >
                <Text style={[styles.dayText, selectedDate === d.dateStr && styles.whiteText]}>{d.day}</Text>
                <Text style={[styles.dateText, selectedDate === d.dateStr && styles.whiteText]}>{d.dateNum}</Text>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: COLORS.success }
                ]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Schedule Slots Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Time Slot Management</Text>
            <Text style={styles.sectionSub}>Manage patient capacity and staff</Text>
          </View>
        </View>
        
        {slots.length === 0 ? (
          <View style={{ padding: 30, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, marginHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ color: COLORS.textSecondary, fontWeight: '600' }}>No schedule slots for this day</Text>
          </View>
        ) : (
          slots.map((slot) => {
            const isFull = slot.booked >= slot.maxPatients;
            const statusText = isFull ? 'Full' : 'Active';
            return (
              <View key={slot._id} style={[styles.slotCard, greyShadow]}>
                <View style={styles.slotHeader}>
                  <View style={styles.slotInfoMain}>
                    <View style={styles.timeIconBox}>
                      <Clock size={18} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.slotTime}>{slot.startTime} - {slot.endTime}</Text>
                      <Text style={styles.slotSubText}>{slot.type} • {slot.room}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: isFull ? COLORS.error + '15' : COLORS.success + '15' }]}>
                    <Text style={[styles.statusPillText, { color: isFull ? COLORS.error : COLORS.success }]}>{statusText}</Text>
                  </View>
                </View>
                
                <View style={styles.capacityBarContainer}>
                  <View style={styles.capacityHeader}>
                    <Text style={styles.capacityLabel}>Current Capacity Load</Text>
                    <Text style={styles.capacityValue}>{slot.booked || 0}/{slot.maxPatients} Patients</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(100, ((slot.booked || 0) / slot.maxPatients) * 100)}%`, backgroundColor: ((slot.booked || 0) / slot.maxPatients) > 0.8 ? COLORS.error : COLORS.primary }]} />
                  </View>
                </View>

                <View style={styles.slotFooter}>
                  <View style={styles.nurseInfo}>
                    <View style={styles.nurseAvatarMini}>
                      <User size={12} color={COLORS.textSecondary} />
                    </View>
                    <Text style={styles.nurseName}>{slot.nurse || userName}</Text>
                  </View>
                  <View style={styles.slotActions}>
                    <TouchableOpacity 
                       style={styles.slotActionBtn}
                       onPress={() => handleEdit(slot)}
                    >
                       <Edit2 size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                       style={styles.slotActionBtn}
                       onPress={() => handleDelete(slot._id)}
                    >
                       <Trash2 size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Staff Management */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Lab Staff Assignment</Text>
            <Text style={styles.sectionSub}>Available medical staff for duties</Text>
          </View>
          <TouchableOpacity><Text style={styles.viewAllText}>View Roster</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nurseScroll}>
          {[
            { id: 'n1', name: userName || 'Nurse', dept: department, shift: '08:00 AM - 04:00 PM', status: 'Available', photo: 'https://img.icons8.com/bubbles/100/000000/user-female.png' },
            { id: 'n2', name: 'Nurse Nimali', dept: department, shift: '10:00 AM - 06:00 PM', status: 'On Duty', photo: 'https://img.icons8.com/bubbles/100/000000/user-female.png' },
          ].map((nurse) => (
            <View key={nurse.id} style={[styles.nurseCard, greyShadow]}>
              <View style={styles.nursePhotoContainer}>
                <Image source={{ uri: nurse.photo }} style={styles.nursePhoto} />
                <View style={[styles.onlineIndicator, { backgroundColor: nurse.status === 'Available' ? COLORS.success : COLORS.warning }]} />
              </View>
              <Text style={styles.nurseCardName}>{nurse.name}</Text>
              <Text style={styles.nurseDept}>{nurse.dept}</Text>
              <View style={styles.nurseShiftBox}>
                <Clock size={10} color={COLORS.textSecondary} />
                <Text style={styles.nurseShift}>{nurse.shift}</Text>
              </View>
              <TouchableOpacity style={styles.assignBtn}>
                <Text style={styles.assignBtnText}>Assign Duty</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Timeline View */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Daily Schedule Timeline</Text>
            <Text style={styles.sectionSub}>Today's activity sequence</Text>
          </View>
        </View>
        <View style={styles.timelineContainer}>
          {slots.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>No timeline activities scheduled</Text>
            </View>
          ) : (
            slots
              .map(s => ({
                time: s.startTime,
                label: `${department} Session`,
                nurse: s.nurse || userName
              }))
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((item, idx, arr) => (
                <View key={idx} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <Text style={styles.timelineTime}>{item.time}</Text>
                    <View style={styles.timelineDot} />
                    {idx !== arr.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={[styles.timelineContent, greyShadow]}>
                    <View style={styles.timelineHeader}>
                      <Text style={styles.timelineLabel}>{item.label}</Text>
                      <Info size={14} color={COLORS.primary} />
                    </View>
                    <Text style={styles.timelineSubText}>Assigned Staff: {item.nurse}</Text>
                  </View>
                </View>
              ))
          )}
        </View>
      </ScrollView>

      <NurseBottomNavBar />

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={[styles.fab, greyShadow]}
        onPress={() => setShowAddModal(true)}
      >
        <LinearGradient
          colors={COLORS.screenHeaderGradient as any}
          style={styles.fabGradient}
        >
          <Plus size={24} color="#FFF" />
          <Text style={styles.fabText}>Add New Schedule Slot</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Slot Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingSlot ? 'Edit Schedule Slot' : 'New Schedule Slot'}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
                <X size={20} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <View style={styles.inputWrapper}>
                    <Clock size={18} color={COLORS.textSecondary} />
                    <TextInput 
                      placeholder="08:00 AM" 
                      style={styles.textInput} 
                      placeholderTextColor="#94A3B8"
                      value={formData.startTime}
                      onChangeText={(val) => setFormData({...formData, startTime: val})}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <View style={styles.inputWrapper}>
                    <Clock size={18} color={COLORS.textSecondary} />
                    <TextInput 
                      placeholder="10:00 AM" 
                      style={styles.textInput} 
                      placeholderTextColor="#94A3B8"
                      value={formData.endTime}
                      onChangeText={(val) => setFormData({...formData, endTime: val})}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Max Capacity (Patients)</Text>
                <View style={styles.inputWrapper}>
                  <Users size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput 
                    placeholder="Enter limit (e.g. 25)" 
                    keyboardType="numeric" 
                    style={styles.textInput} 
                    placeholderTextColor="#94A3B8"
                    value={formData.capacity}
                    onChangeText={(val) => setFormData({...formData, capacity: val})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Assign Medical Staff</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput 
                    placeholder="Search Nurse/Technician" 
                    style={styles.textInput} 
                    placeholderTextColor="#94A3B8"
                    value={formData.nurse}
                    onChangeText={(val) => setFormData({...formData, nurse: val})}
                  />
                </View>
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Emergency Priority Slot</Text>
                  <Text style={styles.switchSub}>Reserve for critical conditions</Text>
                </View>
                <Switch trackColor={{ false: '#E2E8F0', true: COLORS.primary }} thumbColor="#FFF" />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={saveSlot}>
                <Text style={styles.saveBtnText}>{editingSlot ? 'Update Schedule' : 'Generate Schedule'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full Calendar Modal */}
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
                const dateStr = moment(currentMonthYear, 'MMMM YYYY').date(day).format('YYYY-MM-DD');
                const isSelected = selectedDate === dateStr;
                return (
                  <TouchableOpacity 
                    key={day} 
                    style={[styles.dayCell, isSelected && styles.dayCellActive]}
                    onPress={() => {
                      setSelectedDate(dateStr);
                      setShowCalendarModal(false);
                    }}
                  >
                    <Text style={[styles.dayCellText, isSelected && styles.whiteText]}>{day}</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerGradient: { 
    paddingTop: Platform.OS === 'ios' ? 60 : 50, 
    paddingBottom: 24, 
    paddingHorizontal: 20, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  backBtnHeader: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  headerTitleText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSubText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerRightHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  statusToggleHeader: { alignItems: 'center' },
  statusTextHeader: { fontSize: 10, color: '#FFF', fontWeight: '600', marginBottom: 2 },
  bellBtnHeader: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  notificationDotHeader: { 
    position: 'absolute', 
    top: 10, 
    right: 12, 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: COLORS.error, 
    borderWidth: 1, 
    borderColor: COLORS.primary 
  },
  searchContainerHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 50, 
    marginTop: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  searchInputHeader: { flex: 1, marginLeft: 12, fontSize: 14, color: COLORS.textHeader },
  scrollContent: { paddingBottom: 120 },
  statsRow: { flexDirection: 'row', padding: 20, gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    width: (width - 52) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.textHeader },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginTop: 1 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    paddingHorizontal: 20, 
    marginTop: 25,
    marginBottom: 15 
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textHeader },
  sectionSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, fontWeight: '500' },
  viewAllText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  labTypeList: { paddingLeft: 20, paddingBottom: 15 },
  labTypeCard: {
    width: 145,
    padding: 18,
    borderRadius: 28,
    marginRight: 16,
    alignItems: 'center',
  },
  labTypeSelected: { backgroundColor: '#FFF', borderWidth: 2, borderColor: COLORS.primary },
  labTypeUnselected: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: COLORS.primary + '15' },
  labIconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  labTypeName: { fontSize: 15, fontWeight: '800', color: COLORS.textHeader, marginBottom: 8 },
  labStatsMini: { alignItems: 'center', gap: 3 },
  labStatText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  whiteText: { color: '#FFF' },
  calendarSection: { paddingHorizontal: 20, marginTop: 10, marginBottom: 20 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  monthText: { fontSize: 17, fontWeight: '800', color: COLORS.textHeader },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  filterText: { fontSize: 12, fontWeight: '700', color: COLORS.textHeader },
  datePicker: { flexDirection: 'row' },
  dateCard: { width: 56, height: 85, backgroundColor: '#FFF', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12, gap: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  dateCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase' },
  dateText: { fontSize: 20, fontWeight: '800', color: COLORS.textHeader },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  slotCard: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 20, 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#F1F5F9'
  },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  slotInfoMain: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  timeIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  slotTime: { fontSize: 16, fontWeight: '800', color: COLORS.textHeader },
  slotSubText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  capacityBarContainer: { marginBottom: 18, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16 },
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  capacityLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  capacityValue: { fontSize: 12, fontWeight: '800', color: COLORS.textHeader },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  slotFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  nurseInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nurseAvatarMini: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  nurseName: { fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  slotActions: { flexDirection: 'row', gap: 10 },
  slotActionBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  nurseScroll: { paddingLeft: 20, paddingBottom: 15 },
  nurseCard: { 
    backgroundColor: '#FFF', 
    width: 155, 
    padding: 16, 
    borderRadius: 24, 
    alignItems: 'center', 
    marginRight: 16, 
    borderWidth: 1, 
    borderColor: '#F1F5F9'
  },
  nursePhotoContainer: { marginBottom: 12 },
  nursePhoto: { width: 64, height: 64, borderRadius: 22 },
  onlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFF' },
  nurseCardName: { fontSize: 14, fontWeight: '800', color: COLORS.textHeader },
  nurseDept: { fontSize: 11, color: COLORS.primary, marginTop: 4, fontWeight: '700' },
  nurseShiftBox: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  nurseShift: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  assignBtn: { marginTop: 15, backgroundColor: COLORS.primaryLight, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 12 },
  assignBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  timelineContainer: { paddingHorizontal: 20, marginTop: 10 },
  timelineItem: { flexDirection: 'row', gap: 24, marginBottom: 25 },
  timelineLeft: { alignItems: 'center', width: 65 },
  timelineTime: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.primary, marginTop: 10, borderWidth: 3, borderColor: COLORS.primaryLight },
  timelineLine: { width: 2, flex: 1, backgroundColor: COLORS.primaryLight, position: 'absolute', top: 35 },
  timelineContent: { flex: 1, backgroundColor: '#FFF', padding: 18, borderRadius: 22, borderLeftWidth: 5, borderLeftColor: COLORS.primary, borderWidth: 1, borderColor: '#F1F5F9' },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  timelineLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textHeader },
  timelineSubText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  fab: { 
    position: 'absolute', 
    bottom: 120,
    left: 20, 
    right: 20, 
    height: 60, 
    borderRadius: 20, 
    overflow: 'hidden' 
  },
  fabGradient: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12 
  },
  fabText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, minHeight: '85%', padding: 25 },
  dragHandle: { width: 45, height: 5, borderRadius: 3, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textHeader },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  modalForm: { gap: 24, paddingBottom: 40 },
  inputGroup: {},
  inputLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textHeader, marginBottom: 10 },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC', 
    borderRadius: 18, 
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0'
  },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 15, color: COLORS.textHeader, fontWeight: '600' },
  rowInputs: { flexDirection: 'row' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 5 },
  switchTextContainer: { flex: 1, marginRight: 20 },
  switchTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textHeader },
  switchSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, fontWeight: '500' },
  saveBtn: { 
    backgroundColor: COLORS.primary, 
    height: 60, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 15,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  calendarModalContent: {
    backgroundColor: '#FFF',
    width: width * 0.9,
    borderRadius: 30,
    padding: 24,
    alignSelf: 'center',
    marginTop: '20%',
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 15,
    marginBottom: 20,
  },
  currentMonthText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDayText: {
    width: (width * 0.9 - 48) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: (width * 0.9 - 48) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  dayCellActive: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textHeader,
  },
  calendarCloseBtnFull: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  calendarCloseBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LabSchedulingScreen;