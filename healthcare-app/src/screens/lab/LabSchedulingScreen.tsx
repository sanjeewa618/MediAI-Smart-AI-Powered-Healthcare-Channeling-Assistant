import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Image, Platform, Switch,
  Dimensions, Modal, TextInput, FlatList
} from 'react-native';
import { 
  ChevronLeft, Bell, Calendar as CalendarIcon, 
  Clock, User, Plus, MoreVertical, Edit2, 
  Trash2, Pause, Copy, Users, CheckCircle, 
  Activity, Zap, Shield, Search, Info,
  AlertTriangle, Filter, Settings, FlaskConical,
  Microscope, Droplets, Heart, Baby, Dna, Sparkles, X, MapPin
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';

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
  const navigation = useNavigation<any>();
  const [selectedLab, setSelectedLab] = useState('1');
  const [selectedDate, setSelectedDate] = useState(24);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const renderLabTypeItem = ({ item }: { item: typeof LAB_TYPES[0] }) => {
    const isSelected = selectedLab === item.id;
    return (
      <TouchableOpacity 
        style={[
          styles.labTypeCard, 
          isSelected ? styles.labTypeSelected : styles.labTypeUnselected,
          greyShadow
        ]}
        onPress={() => setSelectedLab(item.id)}
      >
        <View style={[styles.labIconCircle, { backgroundColor: item.color }]}>
          <item.icon size={20} color={item.iconColor} />
        </View>
        <Text style={[styles.labTypeName, isSelected && styles.whiteText]}>{item.name}</Text>
        <View style={styles.labStatsMini}>
          <Text style={[styles.labStatText, isSelected && styles.whiteText]}>{item.bookings} Booked</Text>
          <Text style={[styles.labStatText, isSelected && styles.whiteText]}>{item.slots} Available</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const DAYS = [
    { day: 'Mon', date: 21, status: 'available' },
    { day: 'Tue', date: 22, status: 'limited' },
    { day: 'Wed', date: 23, status: 'full' },
    { day: 'Thu', date: 24, status: 'available' },
    { day: 'Fri', date: 25, status: 'available' },
    { day: 'Sat', date: 26, status: 'limited' },
    { day: 'Sun', date: 27, status: 'available' },
  ];

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
            { label: 'Total Slots', value: '48', icon: CalendarIcon },
            { label: 'Available', value: '12', icon: CheckCircle },
            { label: 'Fully Booked', value: '05', icon: AlertTriangle },
            { label: 'Nurses', value: '08', icon: Users },
          ].map((stat, idx) => (
            <View key={idx} style={[styles.statCard, greyShadow]}>
              <View style={styles.statIconBox}>
                <stat.icon size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Lab Type Selector */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Lab Categories</Text>
            <Text style={styles.sectionSub}>Manage schedules by lab type</Text>
          </View>
          <TouchableOpacity><Text style={styles.viewAllText}>Manage All</Text></TouchableOpacity>
        </View>
        <FlatList
          data={LAB_TYPES}
          renderItem={renderLabTypeItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.labTypeList}
          keyExtractor={(item) => item.id}
        />

        {/* Calendar / Date Picker Area */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthText}>October 2023</Text>
            <TouchableOpacity style={styles.filterBtn}>
              <Filter size={16} color={COLORS.textSecondary} />
              <Text style={styles.filterText}>Filter Date</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePicker}>
            {DAYS.map((d, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[
                  styles.dateCard, 
                  selectedDate === d.date && styles.dateCardActive,
                  greyShadow
                ]}
                onPress={() => setSelectedDate(d.date)}
              >
                <Text style={[styles.dayText, selectedDate === d.date && styles.whiteText]}>{d.day}</Text>
                <Text style={[styles.dateText, selectedDate === d.date && styles.whiteText]}>{d.date}</Text>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: d.status === 'available' ? COLORS.success : d.status === 'limited' ? COLORS.warning : COLORS.error }
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
        
        {SCHEDULE_SLOTS.map((slot) => (
          <View key={slot.id} style={[styles.slotCard, greyShadow]}>
            <View style={styles.slotHeader}>
              <View style={styles.slotInfoMain}>
                <View style={styles.timeIconBox}>
                  <Clock size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.slotTime}>{slot.time}</Text>
                  <Text style={styles.slotSubText}>{slot.type} • {slot.room}</Text>
                </View>
              </View>
              <View style={[styles.statusPill, { backgroundColor: slot.status === 'Full' ? COLORS.error + '15' : COLORS.success + '15' }]}>
                <Text style={[styles.statusPillText, { color: slot.status === 'Full' ? COLORS.error : COLORS.success }]}>{slot.status}</Text>
              </View>
            </View>
            
            <View style={styles.capacityBarContainer}>
              <View style={styles.capacityHeader}>
                <Text style={styles.capacityLabel}>Current Capacity Load</Text>
                <Text style={styles.capacityValue}>{slot.booked}/{slot.maxPatients} Patients</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(slot.booked / slot.maxPatients) * 100}%`, backgroundColor: (slot.booked / slot.maxPatients) > 0.8 ? COLORS.error : COLORS.primary }]} />
              </View>
            </View>

            <View style={styles.slotFooter}>
              <View style={styles.nurseInfo}>
                <View style={styles.nurseAvatarMini}>
                  <User size={12} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.nurseName}>{slot.nurse}</Text>
              </View>
              <View style={styles.slotActions}>
                <TouchableOpacity style={styles.slotActionBtn}><Edit2 size={16} color={COLORS.primary} /></TouchableOpacity>
                <TouchableOpacity style={styles.slotActionBtn}><Copy size={16} color="#6366F1" /></TouchableOpacity>
                <TouchableOpacity style={styles.slotActionBtn}><Pause size={16} color={COLORS.warning} /></TouchableOpacity>
                <TouchableOpacity style={styles.slotActionBtn}><Trash2 size={16} color={COLORS.error} /></TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Staff Management */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Lab Staff Assignment</Text>
            <Text style={styles.sectionSub}>Available medical staff for duties</Text>
          </View>
          <TouchableOpacity><Text style={styles.viewAllText}>View Roster</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nurseScroll}>
          {NURSES.map((nurse) => (
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
          {TIMELINE.map((item, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text style={styles.timelineTime}>{item.time}</Text>
                <View style={styles.timelineDot} />
                {idx !== TIMELINE.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={[styles.timelineContent, greyShadow]}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineLabel}>{item.label}</Text>
                  <Info size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.timelineSubText}>Assigned Staff: {item.nurse}</Text>
              </View>
            </View>
          ))}
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
              <Text style={styles.modalTitle}>New Schedule Slot</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lab Category</Text>
                <View style={styles.inputWrapper}>
                  <FlaskConical size={20} color={COLORS.primary} style={styles.inputIcon} />
                  <TextInput placeholder="Select Lab Type (e.g. PCR, Blood)" style={styles.textInput} placeholderTextColor="#94A3B8" />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.inputLabel}>Start Time</Text>
                  <View style={styles.inputWrapper}>
                    <Clock size={18} color={COLORS.textSecondary} />
                    <TextInput placeholder="08:00 AM" style={styles.textInput} placeholderTextColor="#94A3B8" />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <View style={styles.inputWrapper}>
                    <Clock size={18} color={COLORS.textSecondary} />
                    <TextInput placeholder="10:00 AM" style={styles.textInput} placeholderTextColor="#94A3B8" />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Max Capacity (Patients)</Text>
                <View style={styles.inputWrapper}>
                  <Users size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput placeholder="Enter limit (e.g. 25)" keyboardType="numeric" style={styles.textInput} placeholderTextColor="#94A3B8" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Assign Medical Staff</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput placeholder="Search Nurse/Technician" style={styles.textInput} placeholderTextColor="#94A3B8" />
                </View>
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchTitle}>Emergency Priority Slot</Text>
                  <Text style={styles.switchSub}>Reserve for critical conditions</Text>
                </View>
                <Switch trackColor={{ false: '#E2E8F0', true: COLORS.primary }} thumbColor="#FFF" />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.saveBtnText}>Generate Schedule</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerGradient: { 
    paddingTop: Platform.OS === 'ios' ? 50 : 20, 
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
  statsRow: { flexDirection: 'row', padding: 20, gap: 12, flexWrap: 'wrap' },
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
  labTypeSelected: { backgroundColor: COLORS.primary },
  labTypeUnselected: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: COLORS.primary + '15' },
  labIconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  labTypeName: { fontSize: 15, fontWeight: '800', color: COLORS.textHeader, marginBottom: 8 },
  labStatsMini: { alignItems: 'center', gap: 3 },
  labStatText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  whiteText: { color: '#FFF' },
  calendarSection: { paddingHorizontal: 20, marginTop: 10 },
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
  progressBarBg: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
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
    bottom: 100, 
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
});

export default LabSchedulingScreen;