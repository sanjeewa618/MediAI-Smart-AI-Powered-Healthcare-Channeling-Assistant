import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, Platform, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Clock, Trash2, Edit3, X, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DATES = ['19', '20', '21', '22', '23', '24', '25'];

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
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState({ startTime: '', endTime: '', consultType: 'Physical', maxPatients: '10', notes: '', repeat: 'none', physical: true, video: false });
  const [conflict, setConflict] = useState('');

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

  const daySlots = slots.filter(s => s.day === selectedDay);

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
    const existing = slots.filter(s => s.day === selectedDay && s.id !== excludeId);
    return existing.some(s => s.startTime === start || s.endTime === end || s.startTime === end);
  };

  const saveSlot = async () => {
    if (!form.startTime || !form.endTime) { setConflict('Please fill start and end time'); return; }
    if (checkConflict(form.startTime, form.endTime, selectedSlot?.id)) {
      setConflict('⚠ This slot already has an appointment or overlaps with another slot.');
      return;
    }
    const cType = form.video && !form.physical ? 'Video' : form.physical && form.video ? 'Both' : 'Physical';
    
    const payload = {
      day: selectedDay,
      startTime: form.startTime,
      endTime: form.endTime,
      type: 'available',
      consultType: cType,
      maxPatients: parseInt(form.maxPatients) || 1,
      notes: form.notes
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
          <View>
            <Text style={styles.headerTitle}>Schedule Manager</Text>
            <Text style={styles.headerSub}>Manage your time slots</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Plus size={18} color={COLORS.primary} />
            <Text style={styles.addBtnText}>Add Slot</Text>
          </TouchableOpacity>
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

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayScrollContent}>
        {DAYS.map((day, i) => {
          const isActive = selectedDay === day;
          const hasSlots = slots.some(s => s.day === day);
          return (
            <TouchableOpacity key={day} onPress={() => setSelectedDay(day)} style={[styles.dayBtn, isActive && styles.dayBtnActive]}>
              <Text style={[styles.dayName, isActive && styles.dayNameActive]}>{day}</Text>
              <Text style={[styles.dayDate, isActive && styles.dayDateActive]}>{DATES[i]}</Text>
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
                    {slot.consultType ? (
                      <Text style={styles.slotMeta}>{slot.consultType} · Max {slot.maxPatients} patients</Text>
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
              <TextInput style={styles.input} placeholder="e.g. 09:00 AM" placeholderTextColor="#9CA3AF" value={form.startTime} onChangeText={v => setForm(f => ({ ...f, startTime: v }))} />

              <Text style={styles.fieldLabel}>End Time</Text>
              <TextInput style={styles.input} placeholder="e.g. 09:30 AM" placeholderTextColor="#9CA3AF" value={form.endTime} onChangeText={v => setForm(f => ({ ...f, endTime: v }))} />

              <Text style={styles.fieldLabel}>Consultation Type</Text>
              <View style={styles.checkRow}>
                <TouchableOpacity style={[styles.checkBox, form.physical && styles.checkBoxActive]} onPress={() => setForm(f => ({ ...f, physical: !f.physical }))}>
                  <Text style={[styles.checkText, form.physical && styles.checkTextActive]}>Physical</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.checkBox, form.video && styles.checkBoxActive]} onPress={() => setForm(f => ({ ...f, video: !f.video }))}>
                  <Text style={[styles.checkText, form.video && styles.checkTextActive]}>Video</Text>
                </TouchableOpacity>
              </View>

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
  legend: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  dayScroll: { maxHeight: 90 },
  dayScrollContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  dayBtn: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', minWidth: 56 },
  dayBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
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
