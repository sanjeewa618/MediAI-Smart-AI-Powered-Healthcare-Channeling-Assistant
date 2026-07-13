import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.158.225.227:4000';

type NavProp = StackNavigationProp<RootStackParamList, 'DoctorAvailabilityCalendar'>;
type RouteProps = RouteProp<RootStackParamList, 'DoctorAvailabilityCalendar'>;

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  timeSlot: string;
  maxPatients: number;
  bookedCount: number;
  isFull: boolean;
  isEnded?: boolean;
  hasBooked?: boolean;
  type: string;
  consultType: string;
  notes?: string;
  // The queue number that will be assigned to the NEXT patient who
  // books this slot. This is the same for every slot on the same
  // date for a given doctor (queue resets daily), but we store it on
  // the slot for convenience in the UI.
  nextQueueNumber?: number;
}

interface DayData {
  date: string;
  dayName: string;
  nextQueueNumber?: number;
  slots: Slot[];
}

const DoctorAvailabilityCalendarScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { doctorId, doctorName, specialty } = route.params;
  const { token } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    fetchAvailability();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/api/doctor/${doctorId}/availability?month=${currentDate.getMonth()}&year=${currentDate.getFullYear()}`, {
        headers
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCalendarData(data.data);
        
        // Auto select first available day with slots, or today if in current month
        const d = new Date();
        const todayStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        
        let defaultSelect = data.data.find((d: DayData) => d.date === todayStr);
        if (!defaultSelect || defaultSelect.slots.length === 0) {
          defaultSelect = data.data.find((d: DayData) => d.slots.length > 0 && d.date >= todayStr);
        }
        if (defaultSelect) {
          setSelectedDate(defaultSelect.date);
        } else {
          setSelectedDate(data.data[0]?.date || '');
        }

        // Auto scroll
        setTimeout(() => {
          const index = data.data.findIndex((d: DayData) => d.date === (defaultSelect?.date || todayStr));
          if (index > 0) {
            scrollRef.current?.scrollTo({ x: index * 70, animated: true });
          }
        }, 300);
      }
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(next);
  };

  const getLocalDateString = (d: Date = new Date()) => {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  const selectedDayData = calendarData.find(d => d.date === selectedDate);
  const displaySlots = selectedDayData?.slots || [];
  const todayStr = getLocalDateString();

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[COLORS.primary, '#2563EB']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{doctorName}</Text>
            <Text style={styles.headerSub}>{specialty}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNav}>
          <ChevronLeft size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.monthCenter}>
          <CalendarIcon size={18} color={COLORS.primary} />
          <Text style={styles.monthText}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>
        </View>
        <TouchableOpacity onPress={handleNextMonth} style={styles.monthNav}>
          <ChevronRight size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollRef} contentContainerStyle={styles.dayScrollContent}>
            {calendarData.filter(day => day.slots.length > 0).map((day, i) => {
              const isActive = selectedDate === day.date;
              const hasSlots = day.slots.length > 0;
              const isPast = day.date < todayStr;
              const dateNum = day.date.split('-')[2];

              return (
                <TouchableOpacity 
                  key={day.date} 
                  onPress={() => setSelectedDate(day.date)} 
                  style={[
                    styles.dayBtn, 
                    isPast && styles.dayBtnPast, 
                    isActive && styles.dayBtnActive,
                    !hasSlots && !isPast && { opacity: 0.7 }
                  ]}
                >
                  <Text style={[styles.dayName, isActive && styles.dayNameActive]}>{day.dayName}</Text>
                  <Text style={[styles.dayDate, isActive && styles.dayDateActive]}>{dateNum}</Text>
                  {hasSlots && <View style={[styles.dayDot, isActive && { backgroundColor: '#FFF' }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.slotsList} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          {selectedDayData?.nextQueueNumber ? (
            <View style={styles.queuePill}>
              <Text style={styles.queuePillLabel}>Next Queue</Text>
              <Text style={styles.queuePillNumber}>#{selectedDayData.nextQueueNumber}</Text>
            </View>
          ) : null}
        </View>

        {!loading && displaySlots.length === 0 ? (
          <View style={styles.emptyBox}>
            <Clock size={48} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No slots available</Text>
            <Text style={styles.emptySub}>Dr. {doctorName.split(' ')[1] || doctorName} is not available on this date.</Text>
          </View>
        ) : (
          displaySlots.map(slot => {
            // Queue number for this slot: if a date-level value exists
            // (preferred because the queue is per-day-per-doctor), use
            // it. Otherwise fall back to a per-slot hint. If the slot is
            // full, show a dash so the patient knows the slot is closed.
            const assignedQueue =
              slot.isFull
                ? null
                : slot.nextQueueNumber ?? selectedDayData?.nextQueueNumber ?? null;

            return (
              <View key={slot.id} style={styles.slotCard}>
                <View style={styles.slotInfo}>
                  <View style={styles.slotTopRow}>
                    <Text style={styles.slotTime}>{slot.timeSlot}</Text>
                    {assignedQueue !== null ? (
                      <View style={styles.queueBadge}>
                        <Text style={styles.queueBadgeText}>Queue #{assignedQueue}</Text>
                      </View>
                    ) : (
                      <View style={[styles.queueBadge, styles.queueBadgeFull]}>
                        <Text style={[styles.queueBadgeText, styles.queueBadgeTextFull]}>Full</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.capacityBadge}>
                    <Users size={14} color={slot.isFull ? '#EF4444' : '#10B981'} />
                  <Text style={[styles.capacityText, slot.isFull && { color: '#EF4444' }]}>
                    {slot.bookedCount} / {slot.maxPatients} Booked
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.bookBtn, (slot.isFull || slot.isEnded || slot.hasBooked) && styles.bookBtnDisabled]}
                disabled={slot.isFull || slot.isEnded || slot.hasBooked}
                onPress={() => navigation.navigate('BookAppointment', {
                  doctorId,
                  doctorName,
                  specialty,
                  date: selectedDate,
                  time: slot.timeSlot,
                  // Pass the queue number hint to the next screen.
                  // The server is the source of truth and will assign
                  // the final queue number when the appointment is
                  // actually created (to avoid two patients seeing the
                  // same number in a race condition).
                  queueNumber: assignedQueue
                })}
              >
                <Text style={styles.bookBtnText}>
                  {slot.hasBooked ? 'Booked' : slot.isEnded ? 'Ended' : slot.isFull ? 'Full' : 'Book'}
                </Text>
              </TouchableOpacity>
            </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { 
    paddingTop: Platform.OS === 'ios' ? 60 : 50, 
    paddingHorizontal: 20, 
    paddingBottom: 24, 
    borderBottomLeftRadius: 28, 
    borderBottomRightRadius: 28 
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { 
    width: 40, height: 40, borderRadius: 12, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', justifyContent: 'center' 
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },
  
  monthHeader: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 
  },
  monthCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthText: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  monthNav: { padding: 8, backgroundColor: '#FFF', borderRadius: 12, ...SHADOWS.small },
  
  calendarContainer: { height: 100 },
  dayScrollContent: { paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
  dayBtn: { 
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, 
    borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', minWidth: 62 
  },
  dayBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayBtnPast: { opacity: 0.4, backgroundColor: '#F9FAFB' },
  dayName: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  dayNameActive: { color: '#FFF' },
  dayDate: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginTop: 4 },
  dayDateActive: { color: '#FFF' },
  dayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 6 },
  
  slotsList: { padding: 20, paddingBottom: 40 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  queuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  queuePillLabel: { color: '#E0E7FF', fontSize: 12, fontWeight: '600' },
  queuePillNumber: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  slotCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.small
  },
  slotInfo: { gap: 6, flex: 1 },
  slotTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  slotTime: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  queueBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  queueBadgeFull: { backgroundColor: '#FEE2E2' },
  queueBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  queueBadgeTextFull: { color: '#EF4444' },
  capacityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  capacityText: { fontSize: 13, fontWeight: '600', color: '#10B981' },
  
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12
  },
  bookBtnDisabled: { backgroundColor: '#D1D5DB' },
  bookBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: '#FFF', borderRadius: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#4B5563', marginTop: 16 },
  emptySub: { fontSize: 13, color: '#6B7280', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }
});

export default DoctorAvailabilityCalendarScreen;
