import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  FlaskConical,
  Settings,
  Clock,
  TrendingUp,
  Plus,
  RefreshCw,
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type LabRecord = {
  _id: string;
  name: string;
  floor?: string;
  openTime?: string;
  closeTime?: string;
  description?: string;
  status: 'Available' | 'Busy' | 'Overloaded' | 'Closed' | 'Maintenance';
  assignedNurse?: {
    _id?: string;
    name?: string;
    shift?: string;
  } | null;
  slotsCount?: number;
};

type ScheduleSlot = {
  _id: string;
  date?: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  booked?: number;
  nurse?: {
    _id?: string;
    name?: string;
  } | string | null;
  room?: string;
  type?: string;
  isActive?: boolean;
};

const EMPTY_SLOT_FORM = {
  date: new Date().toISOString().split('T')[0],
  startTime: '',
  endTime: '',
  maxPatients: '1',
  nurse: '',
  room: '',
  type: '',
};

const AdminLaboratoriesScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [labs, setLabs] = useState<LabRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingLabId, setUpdatingLabId] = useState<string | null>(null);
  const [selectedLab, setSelectedLab] = useState<LabRecord | null>(null);
  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(EMPTY_SLOT_FORM.date);
  const [slotEditorVisible, setSlotEditorVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [slotForm, setSlotForm] = useState(EMPTY_SLOT_FORM);

  const authHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/labs?limit=100`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load laboratories');
      }

      const list = (data.data || []) as LabRecord[];
      setLabs(list);
      setSelectedLab(current => current || list[0] || null);
    } catch (error) {
      console.error('Fetch labs error:', error);
      Alert.alert('Error', 'Failed to load laboratory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLabs();
  }, []);

  const fetchSlots = async (labId: string, date: string) => {
    setSlotsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/labs/${labId}/schedule?date=${encodeURIComponent(date)}`, {
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load schedule slots');
      }

      setSlots((data.data || []) as ScheduleSlot[]);
    } catch (error) {
      console.error('Fetch slots error:', error);
      Alert.alert('Error', 'Unable to load schedule slots for this lab.');
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const refreshLabs = () => {
    void fetchLabs();
  };

  const openSlotManager = (lab: LabRecord) => {
    setSelectedLab(lab);
    setSelectedDate(EMPTY_SLOT_FORM.date);
    setSlotModalVisible(true);
    void fetchSlots(lab._id, EMPTY_SLOT_FORM.date);
  };

  const updateLabStatus = async (lab: LabRecord) => {
    if (!token) {
      Alert.alert('Error', 'You must be signed in as an admin.');
      return;
    }

    const nextStatus = lab.status === 'Maintenance' ? 'Available' : 'Maintenance';
    setUpdatingLabId(lab._id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/labs/${lab._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update laboratory status');
      }

      setLabs(prev => prev.map(item => item._id === lab._id ? { ...item, status: nextStatus as LabRecord['status'] } : item));
      setSelectedLab(prev => prev && prev._id === lab._id ? { ...prev, status: nextStatus as LabRecord['status'] } : prev);
      Alert.alert('Status Updated', `${lab.name} is now ${nextStatus}.`);
    } catch (error) {
      console.error('Update lab status error:', error);
      Alert.alert('Error', 'Unable to update laboratory status.');
    } finally {
      setUpdatingLabId(null);
    }
  };

  const openAddSlot = () => {
    if (!selectedLab) return;
    setEditingSlot(null);
    setSlotForm({
      ...EMPTY_SLOT_FORM,
      date: selectedDate,
      room: selectedLab.floor || '',
      type: selectedLab.name,
      nurse: selectedLab.assignedNurse?._id || '',
    });
    setSlotEditorVisible(true);
  };

  const openEditSlot = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      date: selectedDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      maxPatients: String(slot.maxPatients),
      nurse: typeof slot.nurse === 'string' ? slot.nurse : slot.nurse?._id || '',
      room: slot.room || '',
      type: slot.type || selectedLab?.name || '',
    });
    setSlotEditorVisible(true);
  };

  const saveSlot = async () => {
    if (!token || !selectedLab) return;

    const payload = {
      date: slotForm.date,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      maxPatients: Number(slotForm.maxPatients),
      nurse: slotForm.nurse,
      room: slotForm.room,
      type: slotForm.type,
      isActive: true,
    };

    try {
      const response = await fetch(
        editingSlot
          ? `${API_BASE_URL}/api/labs/schedule/${editingSlot._id}`
          : `${API_BASE_URL}/api/labs/${selectedLab._id}/schedule`,
        {
          method: editingSlot ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to save slot');
      }

      setSlotEditorVisible(false);
      setEditingSlot(null);
      await fetchSlots(selectedLab._id, selectedDate);
      Alert.alert('Success', editingSlot ? 'Schedule slot updated.' : 'Schedule slot created.');
    } catch (error) {
      console.error('Save slot error:', error);
      Alert.alert('Error', 'Unable to save the schedule slot.');
    }
  };

  const toggleSlotActive = async (slot: ScheduleSlot) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/labs/schedule/${slot._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !(slot.isActive ?? true) }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update slot');
      }
      await fetchSlots(selectedLab?._id || '', selectedDate);
      Alert.alert('Success', 'Schedule slot updated.');
    } catch (error) {
      console.error('Toggle slot error:', error);
      Alert.alert('Error', 'Unable to update the slot status.');
    }
  };

  const deleteSlot = async (slot: ScheduleSlot) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/labs/schedule/${slot._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to deactivate slot');
      }
      await fetchSlots(selectedLab?._id || '', selectedDate);
      Alert.alert('Success', 'Schedule slot deactivated.');
    } catch (error) {
      console.error('Delete slot error:', error);
      Alert.alert('Error', 'Unable to deactivate the slot.');
    }
  };

  const summary = useMemo(() => ({
    total: labs.length,
    active: labs.filter(lab => lab.status === 'Available').length,
    maintenance: labs.filter(lab => lab.status === 'Maintenance').length,
    busy: labs.filter(lab => lab.status === 'Busy' || lab.status === 'Overloaded').length,
  }), [labs]);

  const getStatusStyles = (status: LabRecord['status']) => {
    switch (status) {
      case 'Available':
        return { bg: '#ECFDF5', color: '#10B981' };
      case 'Busy':
        return { bg: '#FFFBEB', color: '#F59E0B' };
      case 'Overloaded':
        return { bg: '#FEF2F2', color: '#EF4444' };
      case 'Maintenance':
      case 'Closed':
        return { bg: '#FFF7ED', color: '#EA580C' };
      default:
        return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AdminDashboard')}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hospital Laboratories</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshLabs}>
              <RefreshCw size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
          <View style={[styles.summaryCard, SHADOWS.light]}>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>Labs Capacity Load</Text>
              <Text style={styles.summaryDesc}>
                {summary.total} labs registered, {summary.active} available, {summary.maintenance} under maintenance.
              </Text>
            </View>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.summaryBadge}>
              <TrendingUp size={20} color="#FFF" />
            </LinearGradient>
          </View>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading laboratories...</Text>
            </View>
          ) : null}

          <Text style={styles.sectionHeading}>Laboratory Rooms</Text>
          {(() => {
            const seen = new Set();
            return labs
              .sort((a, b) => (b.slotsCount || 0) - (a.slotsCount || 0))
              .filter(item => {
                let key = (item.name || '').toLowerCase();
                if (key.includes('blood')) key = 'blood';
                else if (key.includes('diabetes')) key = 'diabetes';
                else key = key.trim();

                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });
          })().map(item => {
              const statusStyles = getStatusStyles(item.status);
              const isUpdating = updatingLabId === item._id;
              return (
                <View key={item._id} style={[styles.labCard, SHADOWS.light]}>
                  <View style={styles.labInfoRow}>
                    <View style={[styles.iconWrap, { backgroundColor: item.status === 'Available' ? '#ECFDF5' : '#FFF7ED' }]}>
                      <FlaskConical size={24} color={item.status === 'Available' ? '#10B981' : '#EA580C'} />
                    </View>
                    <View style={styles.labDetails}>
                      <Text style={styles.labName}>{item.name}</Text>
                      <Text style={styles.labLocation}>{item.floor || 'Floor not set'}</Text>
                      {item.openTime || item.closeTime ? (
                        <Text style={styles.labLoad}>
                          {item.openTime || '--:--'} - {item.closeTime || '--:--'}
                        </Text>
                      ) : null}
                      <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 5, fontWeight: '600' }}>
                        Nurse: <Text style={{ color: COLORS.primary }}>{item.assignedNurse?.name || 'Not Assigned'}</Text>
                      </Text>
                      <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' }}>
                        Active Slots: <Text style={{ color: '#10B981' }}>{item.slotsCount || 0}</Text>
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyles.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyles.color }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: COLORS.primary }]}
                      onPress={() => openSlotManager(item)}
                    >
                      <Clock size={14} color={COLORS.primary} />
                      <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Manage Slots</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: item.status === 'Maintenance' ? '#10B981' : '#EF4444' }]}
                      onPress={() => void updateLabStatus(item)}
                      disabled={isUpdating}
                    >
                      <Settings size={14} color={item.status === 'Maintenance' ? '#10B981' : '#EF4444'} />
                      <Text style={[styles.actionBtnText, { color: item.status === 'Maintenance' ? '#10B981' : '#EF4444' }]}>
                        {isUpdating ? 'Updating...' : item.status === 'Maintenance' ? 'Set Active' : 'Set Maintenance'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

          <View style={{ height: 40 }} />
        </ScrollView>
        <AdminBottomNavBar />
      </View>

      <Modal visible={slotModalVisible} transparent animationType="slide" onRequestClose={() => setSlotModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Manage Slots</Text>
                <Text style={styles.modalSubTitle}>{selectedLab?.name || 'Select a laboratory'}</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSlotModalVisible(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.slotDateRow}>
              <TextInput
                style={styles.modalInput}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.textSecondary}
              />
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => selectedLab && void fetchSlots(selectedLab._id, selectedDate)}
              >
                <Text style={styles.modalPrimaryBtnText}>Load</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.modalPrimaryBtn, { marginTop: 12 }]} onPress={openAddSlot}>
              <Plus size={16} color="#FFF" />
              <Text style={[styles.modalPrimaryBtnText, { marginLeft: 8 }]}>Add Slot</Text>
            </TouchableOpacity>

            <ScrollView style={styles.slotList} showsVerticalScrollIndicator={false}>
              {slotsLoading ? (
                <View style={styles.loadingCard}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Loading slots...</Text>
                </View>
              ) : null}

              {slots.map(slot => (
                <View key={slot._id} style={styles.slotItem}>
                  <View style={styles.slotItemTop}>
                    <Text style={styles.slotItemTitle}>{slot.startTime} - {slot.endTime}</Text>
                    <Text style={styles.slotItemStatus}>{slot.isActive === false ? 'Inactive' : 'Active'}</Text>
                  </View>
                  <Text style={styles.slotItemSub}>{slot.type || 'General'} • {slot.room || 'Room not set'}</Text>
                  <Text style={styles.slotItemSub}>Capacity: {slot.booked || 0}/{slot.maxPatients}</Text>
                  <View style={styles.slotActionRow}>
                    <TouchableOpacity style={styles.slotActionBtn} onPress={() => openEditSlot(slot)}>
                      <Text style={styles.slotActionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.slotActionBtn} onPress={() => void toggleSlotActive(slot)}>
                      <Text style={styles.slotActionText}>{slot.isActive === false ? 'Activate' : 'Deactivate'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.slotActionBtn, { borderColor: '#EF4444' }]} onPress={() => void deleteSlot(slot)}>
                      <Text style={[styles.slotActionText, { color: '#EF4444' }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {!slotsLoading && slots.length === 0 ? (
                <View style={styles.emptySlotState}>
                  <Text style={styles.emptySlotText}>No schedule slots found for this date.</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={slotEditorVisible} transparent animationType="fade" onRequestClose={() => setSlotEditorVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingSlot ? 'Edit Slot' : 'Add Slot'}</Text>
            <Text style={styles.modalSubTitle}>Persist a schedule slot for the selected lab.</Text>

            {(['date', 'startTime', 'endTime', 'maxPatients', 'nurse', 'room', 'type'] as const).map(field => (
              <TextInput
                key={field}
                style={styles.modalInput}
                value={slotForm[field]}
                onChangeText={value => setSlotForm(prev => ({ ...prev, [field]: value }))}
                placeholder={field}
                placeholderTextColor={COLORS.textSecondary}
              />
            ))}

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setSlotEditorVisible(false)}>
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => void saveSlot()}>
                <Text style={styles.modalPrimaryBtnText}>{editingSlot ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  wrapper: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 30 : 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEEBFF',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  summaryInfo: {
    flex: 1,
    paddingRight: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  summaryDesc: {
    fontSize: 12,
    color: COLORS.textMain,
    marginTop: 4,
    lineHeight: 16,
  },
  summaryBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 12,
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  labCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEBFF',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  labInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labDetails: {
    flex: 1,
    marginLeft: 14,
  },
  labName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  labLocation: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  labLoad: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: '700',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    maxHeight: '88%',
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textHeader,
  },
  modalSubTitle: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  modalCloseText: {
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  slotDateRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  modalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textHeader,
    backgroundColor: '#FAFAFA',
    marginTop: 10,
  },
  modalPrimaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalPrimaryBtnText: {
    color: '#FFF',
    fontWeight: '800',
  },
  modalSecondaryBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    color: COLORS.textHeader,
    fontWeight: '800',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  slotList: {
    marginTop: 14,
  },
  slotItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  slotItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  slotItemTitle: {
    flex: 1,
    fontWeight: '900',
    color: COLORS.textHeader,
  },
  slotItemStatus: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  slotItemSub: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  slotActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  slotActionBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
  },
  slotActionText: {
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  emptySlotState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptySlotText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default AdminLaboratoriesScreen;
