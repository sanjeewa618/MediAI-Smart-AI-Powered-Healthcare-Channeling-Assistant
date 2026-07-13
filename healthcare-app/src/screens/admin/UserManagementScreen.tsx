import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Search, 
  UserX, 
  Trash2, 
  Edit, 
  Check, 
  UserCheck, 
  ShieldAlert,
  X
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.158.225.227:4000';

type UserItem = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'nurse' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended' | 'disabled' | 'verified';
  specialization?: string;
  department?: string;
  photo?: string;
};

const UserManagementScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'patients' | 'doctors' | 'nurses'>('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<UserItem[]>([]);
  const [doctors, setDoctors] = useState<UserItem[]>([]);
  const [nurses, setNurses] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editExtra, setEditExtra] = useState(''); // specialty or department

  const fetchUsers = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load users');
      }

      const users: UserItem[] = data.data || [];
      setPatients(users.filter(user => user.role === 'patient'));
      setDoctors(users.filter(user => user.role === 'doctor'));
      setNurses(users.filter(user => user.role === 'nurse'));
    } catch (error) {
      console.error('Fetch users error:', error);
      Alert.alert('Error', 'Failed to load users from the server.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [token])
  );

  const updateUserStatus = async (userId: string, status: UserItem['status'], successMessage: string) => {
    if (!token) {
      Alert.alert('Error', 'You must be signed in as an admin.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update user status');
      }

      Alert.alert('Success', successMessage);
      fetchUsers();
    } catch (error) {
      console.error('Update user status error:', error);
      Alert.alert('Error', 'Unable to update the user status.');
    }
  };

  const updateUserDetails = async (
    userId: string,
    payload: { name: string; email: string; specialization?: string; department?: string }
  ) => {
    if (!token) {
      Alert.alert('Error', 'You must be signed in as an admin.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update user details');
      }

      Alert.alert('Saved', 'User profile details updated successfully.');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Update user details error:', error);
      Alert.alert('Error', 'Unable to save the user profile changes.');
    }
  };

  const deletePatient = async (userId: string) => {
    if (!token) {
      Alert.alert('Error', 'You must be signed in as an admin.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete user');
      }

      Alert.alert('Deleted', 'Patient record has been deleted');
      fetchUsers();
    } catch (error) {
      console.error('Delete patient error:', error);
      Alert.alert('Error', 'Unable to delete the patient record.');
    }
  };

  // Filters
  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doctors, searchQuery]);

  const filteredNurses = useMemo(() => {
    return nurses.filter(n => 
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nurses, searchQuery]);

  // Actions for Patients
  const handleSuspendPatient = (id: string) => {
    const patient = patients.find(item => item._id === id);
    const nextStatus = patient?.status === 'suspended' ? 'active' : 'suspended';
    updateUserStatus(id, nextStatus, `Patient is now ${nextStatus === 'active' ? 'active' : 'suspended'}.`);
  };

  const handleDeletePatient = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently delete this patient record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePatient(id) }
      ]
    );
  };

  // Actions for Doctors
  const handleSuspendDoctor = (id: string) => {
    const doctor = doctors.find(item => item._id === id);
    const nextStatus = doctor?.status === 'suspended' ? 'verified' : 'suspended';
    updateUserStatus(id, nextStatus, `Doctor status updated to ${nextStatus}.`);
  };

  const handleVerifyDoctorDirect = (id: string) => {
    updateUserStatus(id, 'verified', 'Doctor credentials verified successfully');
  };

  // Actions for Nurses
  const handleDisableNurse = (id: string) => {
    const nurse = nurses.find(item => item._id === id);
    const nextStatus = nurse?.status === 'disabled' ? 'active' : 'disabled';
    updateUserStatus(id, nextStatus, `Nurse account is now ${nextStatus}.`);
  };

  // Open Edit Modal
  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditExtra(user.specialization || user.department || '');
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    if (!editingUser) {
      Alert.alert('Error', 'No user selected for editing.');
      return;
    }

    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Name and Email are required.');
      return;
    }

    updateUserDetails(editingUser._id, {
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      ...(activeTab === 'doctors' ? { specialization: editExtra.trim() } : {}),
      ...(activeTab === 'nurses' ? { department: editExtra.trim() } : {}),
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'verified':
        return { bg: '#ECFDF5', color: '#10B981' };
      case 'suspended':
      case 'disabled':
        return { bg: '#FEF2F2', color: '#EF4444' };
      case 'pending':
        return { bg: '#FFFBEB', color: '#F59E0B' };
      default:
        return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  const formatStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'verified':
        return 'Verified';
      case 'suspended':
        return 'Suspended';
      case 'disabled':
        return 'Disabled';
      case 'pending':
        return 'Pending Verification';
      case 'approved':
        return 'Active';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const handleTabChange = (tab: 'patients' | 'doctors' | 'nurses') => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const renderUserId = (item: UserItem) => item._id.slice(-6).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
      {/* Top Header */}
      <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AdminDashboard')}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Management</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'patients' && styles.activeTab]}
            onPress={() => handleTabChange('patients')}
          >
            <Text style={[styles.tabText, activeTab === 'patients' && styles.activeTabText]}>Patients</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'doctors' && styles.activeTab]}
            onPress={() => handleTabChange('doctors')}
          >
            <Text style={[styles.tabText, activeTab === 'doctors' && styles.activeTabText]}>Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'nurses' && styles.activeTab]}
            onPress={() => handleTabChange('nurses')}
          >
            <Text style={[styles.tabText, activeTab === 'nurses' && styles.activeTabText]}>Nurses</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9CA3AF" />
          <TextInput 
            style={styles.searchInput}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Lists */}
      <View style={styles.listContainer}>
        {loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading users...</Text>
          </View>
        )}

        {activeTab === 'patients' && (
          <FlatList 
            data={filteredPatients}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const statusInfo = getStatusStyle(item.status);
              return (
                <View style={[styles.userCard, SHADOWS.light]}>
                  <View style={styles.userInfoRow}>
                    <Image 
                      source={
                        item.photo 
                          ? { uri: item.photo.startsWith('http') ? item.photo : `${API_BASE_URL}${item.photo}` } 
                          : { uri: `https://i.pravatar.cc/150?u=${item._id}` }
                      } 
                      style={styles.avatar} 
                    />
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userId}>{renderUserId(item)} • {item.phone}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>{formatStatusLabel(item.status)}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { borderColor: item.status === 'suspended' ? '#10B981' : '#F59E0B' }]}
                      onPress={() => handleSuspendPatient(item._id)}
                    >
                      <ShieldAlert size={14} color={item.status === 'suspended' ? '#10B981' : '#F59E0B'} />
                      <Text style={[styles.actionBtnText, { color: item.status === 'suspended' ? '#10B981' : '#F59E0B' }]}>
                        {item.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { borderColor: '#EF4444' }]}
                      onPress={() => handleDeletePatient(item._id)}
                    >
                      <Trash2 size={14} color="#EF4444" />
                      <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No patients found.</Text>
              </View>
            )}
          />
        )}

        {activeTab === 'doctors' && (
          <FlatList 
            data={filteredDoctors}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const statusInfo = getStatusStyle(item.status);
              return (
                <View style={[styles.userCard, SHADOWS.light]}>
                  <View style={styles.userInfoRow}>
                    <Image 
                      source={
                        item.photo 
                          ? { uri: item.photo.startsWith('http') ? item.photo : `${API_BASE_URL}${item.photo}` } 
                          : { uri: `https://i.pravatar.cc/150?u=${item._id}` }
                      } 
                      style={styles.avatar} 
                    />
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userId}>{renderUserId(item)} • {item.specialization || 'No specialty'}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>{formatStatusLabel(item.status)}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { borderColor: COLORS.primary }]}
                      onPress={() => openEditModal(item)}
                    >
                      <Edit size={14} color={COLORS.primary} />
                      <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Edit Info</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { borderColor: item.status === 'suspended' ? '#10B981' : '#F59E0B' }]}
                      onPress={() => handleSuspendDoctor(item._id)}
                    >
                      <ShieldAlert size={14} color={item.status === 'suspended' ? '#10B981' : '#F59E0B'} />
                      <Text style={[styles.actionBtnText, { color: item.status === 'suspended' ? '#10B981' : '#F59E0B' }]}>
                        {item.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </Text>
                    </TouchableOpacity>
                    {item.status === 'pending' && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]}
                        onPress={() => handleVerifyDoctorDirect(item._id)}
                      >
                        <UserCheck size={14} color="#10B981" />
                        <Text style={[styles.actionBtnText, { color: '#10B981' }]}>Verify</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No doctors found.</Text>
              </View>
            )}
          />
        )}

        {activeTab === 'nurses' && (
          <FlatList 
            data={filteredNurses}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const statusInfo = getStatusStyle(item.status);
              return (
                <View style={[styles.userCard, SHADOWS.light]}>
                  <View style={styles.userInfoRow}>
                    <Image 
                      source={
                        item.photo 
                          ? { uri: item.photo.startsWith('http') ? item.photo : `${API_BASE_URL}${item.photo}` } 
                          : { uri: `https://i.pravatar.cc/150?u=${item._id}` }
                      } 
                      style={styles.avatar} 
                    />
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userId}>{renderUserId(item)} • Dept: {item.department || 'Unknown'}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>{formatStatusLabel(item.status)}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { borderColor: COLORS.primary }]}
                      onPress={() => openEditModal(item)}
                    >
                      <Edit size={14} color={COLORS.primary} />
                      <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Edit Info</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { borderColor: item.status === 'disabled' ? '#10B981' : '#EF4444' }]}
                      onPress={() => handleDisableNurse(item._id)}
                    >
                      <UserX size={14} color={item.status === 'disabled' ? '#10B981' : '#EF4444'} />
                      <Text style={[styles.actionBtnText, { color: item.status === 'disabled' ? '#10B981' : '#EF4444' }]}>
                        {item.status === 'disabled' ? 'Enable' : 'Disable'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No nurses found.</Text>
              </View>
            )}
          />
        )}
      </View>
      <AdminBottomNavBar />
      </View>

      {/* Edit User Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={22} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput 
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter full name"
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput 
                style={styles.textInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter email address"
                keyboardType="email-address"
              />

              {activeTab === 'doctors' && (
                <>
                  <Text style={styles.inputLabel}>Medical Specialization</Text>
                  <TextInput 
                    style={styles.textInput}
                    value={editExtra}
                    onChangeText={setEditExtra}
                    placeholder="E.g., Cardiologist, Neurologist"
                  />
                </>
              )}

              {activeTab === 'nurses' && (
                <>
                  <Text style={styles.inputLabel}>Department / Ward</Text>
                  <TextInput 
                    style={styles.textInput}
                    value={editExtra}
                    onChangeText={setEditExtra}
                    placeholder="E.g., ICU, Pediatrics"
                  />
                </>
              )}

              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  wrapper: {
    flex: 1
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 30 : 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 16
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  backButton: {
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  activeTab: {
    backgroundColor: COLORS.white,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.light
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textHeader,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
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
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
  },
  userDetails: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  userId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textMain,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardActionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 14,
    paddingTop: 12,
    gap: 8,
    justifyContent: 'flex-end',
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
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textHeader,
  },
  modalForm: {
    flexDirection: 'column',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textHeader,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default UserManagementScreen;
