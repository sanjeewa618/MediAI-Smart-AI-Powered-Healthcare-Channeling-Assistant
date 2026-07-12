import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, Platform, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Clock, Trash2, Edit3, X, CheckCircle, AlertCircle, ChevronRight, ChevronLeft, Calendar } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const generateMonthDays = (targetDate: Date) => {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  // Get number of days in the target month
  const numDays = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= numDays; i++) {
    const d = new Date(year, month, i);
    // Determine if date is strictly in the past (before today's midnight)
    const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(i).padStart(2, '0');

    days.push({
      dayName: dayNames[d.getDay()],
      dateStr: i.toString(),
      fullDateStr: `${year}-${mStr}-${dStr}`,
      isPast
    });
  }
  return days;
};

type SlotType = 'available' | 'booked' | 'break' | 'blocked';

interface Slot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  type: SlotType;
  consultType: string;
  maxPatients: number;
  notes?: string;
  repeat?: string;
}

const INITIAL_SLOTS: Slot[] = [];

const SLOT_COLORS: Record<SlotType, { bg: string; border: string; label: string }> = {
  available: { bg: COLORS.primaryLight, border: COLORS.primary, label: 'Available' },
  booked: { bg: '#EDE9FE', border: '#7C3AED', label: 'Booked' },
  break: { bg: COLORS.border, border: '#9CA3AF', label: 'Break' },
  blocked: { bg: '#FEE2E2', border: COLORS.error, label: 'Blocked' },
};

const DoctorSchedulingScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const monthDays = generateMonthDays(currentMonthDate);
  const currentMonthStr = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const [selectedDay, setSelectedDay] = useState(() => {
    const activeDay = monthDays.find(wd => !wd.isPast);
    return activeDay ? activeDay.fullDateStr : monthDays[0].fullDateStr;
  });

  const [slots, setSlots] = useState<Slot[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState({ startTime: '', endTime: '', consultType: 'Physical', maxPatients: '10', notes: '', repeat: 'none', physical: true, video: false });
  const [conflict, setConflict] = useState('');
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ' ' + ampm;
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDateTime(selectedDate);
      setForm(f => ({ ...f, startTime: formatTime(selectedDate) }));
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDateTime(selectedDate);
      setForm(f => ({ ...f, endTime: formatTime(selectedDate) }));
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSlots(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchSlots();
  }, [token]);

  useEffect(() => {
    const activeIndex = monthDays.findIndex(wd => wd.fullDateStr === selectedDay);
    if (activeIndex > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: activeIndex * 70, animated: true });
      }, 100);
    }
  }, [currentMonthDate]);

  const selectedDayObj = monthDays.find(wd => wd.fullDateStr === selectedDay);
  const currentDayName = selectedDayObj ? selectedDayObj.dayName : 'Mon';
  
  const daySlots = slots.filter(s => 
    s.repeat === 'daily' || 
    (s.repeat === 'weekly' && s.day === currentDayName) || 
    s.day === currentDayName || 
    s.day === selectedDay
  );

  const openAddModal = () => {
    setSelectedSlot(null);
    setForm({ startTime: '', endTime: '', consultType: 'Physical', maxPatients: '10', notes: '', repeat: 'none', physical: true, video: false });
    setConflict('');
    setShowModal(true);
  };

  const openEditModal = (slot: Slot) => {
    setSelectedSlot(slot);
    setForm({ 
      startTime: slot.startTime, 
      endTime: slot.endTime, 
      consultType: slot.consultType, 
      maxPatients: String(slot.maxPatients || 1), 
      notes: slot.notes || '', 
      repeat: 'none', 
      physical: slot.consultType === 'Physical' || slot.consultType === 'Both', 
      video: slot.consultType === 'Video' || slot.consultType === 'Both' 
    });
    setConflict('');
    setShowModal(true);
  };

  const checkConflict = (start: string, end: string, excludeId?: string) => {
    const existing = daySlots.filter(s => s.id !== excludeId);
    return existing.some(s => s.startTime === start || s.endTime === end || s.startTime === end);
  };

  const saveSlot = async () => {
    if (!form.startTime || !form.endTime) { setConflict('Please fill start and end time'); return; }
    if (checkConflict(form.startTime, form.endTime, selectedSlot?.id)) {
      setConflict('⚠ This slot already has an appointment or overlaps with another slot.');
      return;
    }
    
    const payload = {
      day: form.repeat === 'weekly' ? currentDayName : selectedDay,
      startTime: form.startTime,
      endTime: form.endTime,
      type: 'available',
      consultType: form.consultType,
      maxPatients: parseInt(form.maxPatients) || 1,
      notes: form.notes,
      repeat: form.repeat
    };

    try {
      if (selectedSlot) {
        const res = await fetch(`${API_BASE_URL}/api/doctor/schedule/${selectedSlot.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) fetchSlots();
      } else {
        const res = await fetch(`${API_BASE_URL}/api/doctor/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        if (res.ok) fetchSlots();
      }
      setShowModal(false);
    } catch (error) {
      setConflict('Network error. Please try again.');
    }
  };

  const deleteSlot = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/schedule/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchSlots();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBlock = async (slot: Slot) => {
    const newType = slot.type === 'blocked' ? 'available' : 'blocked';
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/schedule/${slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: newType })
      });
      if (res.ok) fetchSlots();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#8B3DFF', '#6A11CB']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight size={22} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Schedule Manager</Text>
            <Text style={styles.headerSub}>Manage your time slots</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Legend */}
      <View style={styles.legend}>
        {(Object.keys(SLOT_COLORS) as SlotType[]).map(type => (
          <View key={type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: SLOT_COLORS[type].border }]} />
            <Text style={styles.legendText}>{SLOT_COLORS[type].label}</Text>
          </View>
        ))}
      </View>

      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1))} style={styles.monthNavBtn}>
          <ChevronLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.monthTitleContainer} onPress={() => {
          setPickerYear(currentMonthDate.getFullYear());
          setShowMonthPicker(true);
        }}>
          <Calendar size={18} color={COLORS.primary} />
          <Text style={styles.monthText}>{currentMonthStr}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1))} style={styles.monthNavBtn}>
          <ChevronRight size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayScrollContent} ref={scrollRef}>
        {monthDays.map((wd, i) => {
          const isActive = selectedDay === wd.fullDateStr;
          const hasSlots = slots.some(s => s.day === wd.dayName || s.day === wd.fullDateStr || s.repeat === 'daily');
          return (
            <TouchableOpacity key={i + '-' + wd.dayName} onPress={() => setSelectedDay(wd.fullDateStr)} style={[styles.dayBtn, wd.isPast && styles.dayBtnPast, isActive && styles.dayBtnActive]}>
              <Text style={[styles.dayName, isActive && styles.dayNameActive]}>{wd.dayName}</Text>
              <Text style={[styles.dayDate, isActive && styles.dayDateActive]}>{wd.dateStr}</Text>
              {hasSlots && <View style={[styles.dayDot, isActive && { backgroundColor: '#FFF' }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Slots List */}
      <ScrollView contentContainerStyle={styles.slotsList} showsVerticalScrollIndicator={false}>
        {daySlots.length === 0 ? (
          <View style={styles.emptyBox}>
            <Clock size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No slots for {selectedDay}</Text>
            <Text style={styles.emptySub}>Tap "+ Add Slot" to create one</Text>
          </View>
        ) : (
          daySlots.map(slot => {
            const colors = SLOT_COLORS[slot.type];
            return (
              <View key={slot.id} style={styles.slotCard}>
                <View style={styles.slotLeft}>
                  <View style={[styles.slotTypeDot, { backgroundColor: colors.border }]} />
                  <View>
                    <Text style={styles.slotTime}>{slot.startTime} – {slot.endTime}</Text>
                    {slot.maxPatients ? (
                      <Text style={styles.slotMeta}>Max {slot.maxPatients} patients</Text>
                    ) : (
                      <Text style={styles.slotMeta}>{slot.notes || colors.label}</Text>
                    )}
                  </View>
                </View>
                {slot.type !== 'booked' && (
                  <View style={styles.slotActions}>
                    <TouchableOpacity onPress={() => toggleBlock(slot)} style={styles.iconBtn}>
                      <AlertCircle size={16} color={slot.type === 'blocked' ? COLORS.error : '#9CA3AF'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEditModal(slot)} style={styles.iconBtn}>
                      <Edit3 size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteSlot(slot.id)} style={styles.iconBtn}>
                      <Trash2 size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                )}
                {slot.type === 'booked' && (
                  <View style={[styles.slotActions]}>
                    <TouchableOpacity onPress={() => openEditModal(slot)} style={[styles.rescheduleBtn]}>
                      <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedSlot ? 'Edit Time Slot' : 'Add Time Slot'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={22} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Start Time</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
                <Text style={{ color: form.startTime ? '#1F2937' : '#9CA3AF', fontSize: 15 }}>
                  {form.startTime || 'Select Start Time (e.g. 09:00 AM)'}
                </Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDateTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onStartTimeChange}
                />
              )}

              <Text style={styles.fieldLabel}>End Time</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowEndPicker(true)}>
                <Text style={{ color: form.endTime ? '#1F2937' : '#9CA3AF', fontSize: 15 }}>
                  {form.endTime || 'Select End Time (e.g. 09:30 AM)'}
                </Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDateTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onEndTimeChange}
                />
              )}

              <Text style={styles.fieldLabel}>Max Patients</Text>
              <TextInput style={styles.input} placeholder="10" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={form.maxPatients} onChangeText={v => setForm(f => ({ ...f, maxPatients: v }))} />

              <Text style={styles.fieldLabel}>Repeat</Text>
              <View style={styles.checkRow}>
                {['none', 'daily', 'weekly'].map(r => (
                  <TouchableOpacity key={r} style={[styles.checkBox, form.repeat === r && styles.checkBoxActive]} onPress={() => setForm(f => ({ ...f, repeat: r }))}>
                    <Text style={[styles.checkText, form.repeat === r && styles.checkTextActive]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput style={[styles.input, { height: 70 }]} placeholder="e.g. Lunch break" placeholderTextColor="#9CA3AF" multiline value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} />

              {conflict ? (
                <View style={styles.conflictBox}>
                  <AlertCircle size={16} color={COLORS.error} />
                  <Text style={styles.conflictText}>{conflict}</Text>
                </View>
              ) : null}

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveSlot}>
                  <LinearGradient colors={['#9333EA', '#5B21B6']} style={styles.saveBtnGrad}>
                    <CheckCircle size={16} color="#FFF" />
                    <Text style={styles.saveBtnText}>Save Slot</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Month/Year Picker Modal */}
      <Modal visible={showMonthPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { minHeight: 400 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month & Year</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Year Selector */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 10 }}>
              <TouchableOpacity onPress={() => setPickerYear(y => y - 1)} style={{ padding: 10, backgroundColor: '#F9FAFB', borderRadius: 12 }}>
                <ChevronLeft size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#1F2937' }}>{pickerYear}</Text>
              <TouchableOpacity onPress={() => setPickerYear(y => y + 1)} style={{ padding: 10, backgroundColor: '#F9FAFB', borderRadius: 12 }}>
                <ChevronRight size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Month Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                const isActive = currentMonthDate.getMonth() === i && currentMonthDate.getFullYear() === pickerYear;
                return (
                  <TouchableOpacity 
                    key={m} 
                    style={[
                      { width: '30%', paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
                      isActive && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                    ]} 
                    onPress={() => {
                      setCurrentMonthDate(new Date(pickerYear, i, 1));
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text style={[
                      { fontSize: 15, fontWeight: '600', color: '#4B5563' },
                      isActive && { color: '#FFF', fontWeight: '700' }
                    ]}>{m}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <LinearGradient colors={['#8B3DFF', '#6A11CB']} style={styles.fabGradient}>
          <Plus size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      <DoctorBottomNavBar />
      <NurseBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, maxWidth: 104 },
  addBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  fab: { position: 'absolute', bottom: 120, right: 20, width: 56, height: 56, borderRadius: 28, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  fabGradient: { flex: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  monthTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthNavBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  monthText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  dayScroll: { maxHeight: 90 },
  dayScrollContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  dayBtn: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', minWidth: 56 },
  dayBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayBtnPast: { opacity: 0.4, backgroundColor: '#F9FAFB' },
  dayName: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  dayNameActive: { color: '#FFF' },
  dayDate: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginTop: 2 },
  dayDateActive: { color: '#FFF' },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 3 },
  slotsList: { padding: 16, gap: 10 },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#4B5563' },
  emptySub: { fontSize: 13, color: '#9CA3AF' },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 84,
    backgroundColor: '#FFF',
    shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  slotLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  slotTypeDot: { width: 10, height: 10, borderRadius: 5 },
  slotTime: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  slotMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  slotActions: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  iconBtn: { padding: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.7)' },
  rescheduleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: COLORS.primary },
  rescheduleBtnText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1F2937' },
  checkRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  checkBox: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  checkBoxActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  checkText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  checkTextActive: { color: COLORS.primary, fontWeight: '700' },
  conflictBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginTop: 12 },
  conflictText: { fontSize: 13, color: COLORS.error, fontWeight: '600', flex: 1 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: '#4B5563' },
  saveBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});

export default DoctorSchedulingScreen;
