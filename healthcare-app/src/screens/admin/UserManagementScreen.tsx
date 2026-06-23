import React, { useState, useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { 
  ArrowLeft, 
  Search, 
  UserX, 
  Trash2, 
  Edit, 
  Check, 
  UserCheck, 
  ShieldAlert,
  SlidersHorizontal,
  X
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

// Initial Mock data
const INITIAL_PATIENTS = [
  { id: 'P001', name: 'Dilshan Silva', email: 'dilshan@gmail.com', phone: '0771234567', status: 'Active', img: 'https://i.pravatar.cc/150?img=12' },
  { id: 'P002', name: 'Nisansala Perera', email: 'nisansala@gmail.com', phone: '0719876543', status: 'Active', img: 'https://i.pravatar.cc/150?img=47' },
  { id: 'P003', name: 'Ruwan Fernando', email: 'ruwan@gmail.com', phone: '0761112223', status: 'Suspended', img: 'https://i.pravatar.cc/150?img=8' },
  { id: 'P004', name: 'Shalini de Silva', email: 'shalini@gmail.com', phone: '0724445556', status: 'Active', img: 'https://i.pravatar.cc/150?img=5' },
];

const INITIAL_DOCTORS = [
  { id: 'D001', name: 'Dr. Saman Perera', email: 'saman.p@hospital.lk', specialty: 'Cardiologist', status: 'Verified', img: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png' },
  { id: 'D002', name: 'Dr. Priyantha Cooray', email: 'priyantha@hospital.lk', specialty: 'Pediatrician', status: 'Pending Verification', img: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png' },
  { id: 'D003', name: 'Dr. K. Liyanage', email: 'k.liyanage@hospital.lk', specialty: 'Neurologist', status: 'Suspended', img: 'https://img.icons8.com/bubbles/100/000000/female-doctor.png' },
];

const INITIAL_NURSES = [
  { id: 'N001', name: 'Nurse Anula Ratnayake', email: 'anula.r@hospital.lk', department: 'ICU', status: 'Active', img: 'https://i.pravatar.cc/150?img=31' },
  { id: 'N002', name: 'Nurse K. Perera', email: 'k.perera@hospital.lk', department: 'OPD', status: 'Disabled', img: 'https://i.pravatar.cc/150?img=25' },
];

const UserManagementScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'patients' | 'doctors' | 'nurses'>('patients');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [nurses, setNurses] = useState(INITIAL_NURSES);

  // Edit Modal States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editExtra, setEditExtra] = useState(''); // specialty or department

  // Filters
  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doctors, searchQuery]);

  const filteredNurses = useMemo(() => {
    return nurses.filter(n => 
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nurses, searchQuery]);

  // Actions for Patients
  const handleSuspendPatient = (id: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = p.status === 'Suspended' ? 'Active' : 'Suspended';
        Alert.alert('Status Updated', `Patient is now ${newStatus}`);
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleDeletePatient = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to permanently delete this patient record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          setPatients(prev => prev.filter(p => p.id !== id));
          Alert.alert('Deleted', 'Patient record has been deleted');
        }}
      ]
    );
  };

  // Actions for Doctors
  const handleSuspendDoctor = (id: string) => {
    setDoctors(prev => prev.map(d => {
      if (d.id === id) {
        const newStatus = d.status === 'Suspended' ? 'Verified' : 'Suspended';
        Alert.alert('Status Updated', `Doctor status updated to ${newStatus}`);
        return { ...d, status: newStatus };
      }
      return d;
    }));
  };

  const handleVerifyDoctorDirect = (id: string) => {
    setDoctors(prev => prev.map(d => {
      if (d.id === id) {
        Alert.alert('Doctor Verified', 'Doctor credentials verified successfully');
        return { ...d, status: 'Verified' };
      }
      return d;
    }));
  };

  // Actions for Nurses
  const handleDisableNurse = (id: string) => {
    setNurses(prev => prev.map(n => {
      if (n.id === id) {
        const newStatus = n.status === 'Disabled' ? 'Active' : 'Disabled';
        Alert.alert('Status Updated', `Nurse account is now ${newStatus}`);
        return { ...n, status: newStatus };
      }
      return n;
    }));
  };

  // Open Edit Modal
  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditExtra(user.specialty || user.department || '');
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    if (!editName || !editEmail) {
      Alert.alert('Error', 'Name and Email are required.');
      return;
    }

    if (activeTab === 'doctors') {
      setDoctors(prev => prev.map(d => d.id === editingUser.id ? { ...d, name: editName, email: editEmail, specialty: editExtra } : d));
    } else if (activeTab === 'nurses') {
      setNurses(prev => prev.map(n => n.id === editingUser.id ? { ...n, name: editName, email: editEmail, department: editExtra } : n));
    }

    setEditModalVisible(false);
    Alert.alert('Saved', 'User profile details updated successfully.');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Verified':
        return { bg: '#ECFDF5', color: '#10B981' };
      case 'Suspended':
      case 'Disabled':
        return { bg: '#FEF2F2', color: '#EF4444' };
      case 'Pending Verification':
        return { bg: '#FFFBEB', color: '#F59E0B' };
      default:
        return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

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
            onPress={() => { setActiveTab('patients'); setSearchQuery(''); }}
          >
            <Text style={[styles.tabText, activeTab === 'patients' && styles.activeTabText]}>Patients</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'doctors' && styles.activeTab]}
            onPress={() => { setActiveTab('doctors'); setSearchQuery(''); }}
          >
            <Text style={[styles.tabText, activeTab === 'doctors' && styles.activeTabText]}>Doctors</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'nurses' && styles.activeTab]}
            onPress={() => { setActiveTab('nurses'); setSearchQuery(''); }}
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
        {activeTab === 'patients' && (
          <FlatList 
            data={filteredPatients}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const statusInfo = getStatusStyle(item.status);
              return (
                <View style={[styles.userCard, SHADOWS.light]}>
                  <View style={styles.userInfoRow}>
                    <Image source={{ uri: item.img }} style={styles.avatar} />
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userId}>{item.id} • {item.phone}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>{item.status}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { borderColor: item.status === 'Suspended' ? '#10B981' : '#F59E0B' }]}
                      onPress={() => handleSuspendPatient(item.id)}
                    >
                      <ShieldAlert size={14} color={item.status === 'Suspended' ? '#10B981' : '#F59E0B'} />
                      <Text style={[styles.actionBtnText, { color: item.status === 'Suspended' ? '#10B981' : '#F59E0B' }]}>
                        {item.status === 'Suspended' ? 'Activate' : 'Suspend'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { borderColor: '#EF4444' }]}
                      onPress={() => handleDeletePatient(item.id)}
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
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const statusInfo = getStatusStyle(item.status);
              return (
                <View style={[styles.userCard, SHADOWS.light]}>
                  <View style={styles.userInfoRow}>
                    <Image source={{ uri: item.img }} style={styles.avatar} />
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userId}>{item.id} • {item.specialty}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>{item.status}</Text>
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
                      style={[styles.actionBtn, { borderColor: item.status === 'Suspended' ? '#10B981' : '#F59E0B' }]}
                      onPress={() => handleSuspendDoctor(item.id)}
                    >
                      <ShieldAlert size={14} color={item.status === 'Suspended' ? '#10B981' : '#F59E0B'} />
                      <Text style={[styles.actionBtnText, { color: item.status === 'Suspended' ? '#10B981' : '#F59E0B' }]}>
                        {item.status === 'Suspended' ? 'Activate' : 'Suspend'}
                      </Text>
                    </TouchableOpacity>
                    {item.status === 'Pending Verification' && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]}
                        onPress={() => handleVerifyDoctorDirect(item.id)}
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
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const statusInfo = getStatusStyle(item.status);
              return (
                <View style={[styles.userCard, SHADOWS.light]}>
                  <View style={styles.userInfoRow}>
                    <Image source={{ uri: item.img }} style={styles.avatar} />
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userId}>{item.id} • Dept: {item.department}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>{item.status}</Text>
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
                      style={[styles.actionBtn, { borderColor: item.status === 'Disabled' ? '#10B981' : '#EF4444' }]}
                      onPress={() => handleDisableNurse(item.id)}
                    >
                      <UserX size={14} color={item.status === 'Disabled' ? '#10B981' : '#EF4444'} />
                      <Text style={[styles.actionBtnText, { color: item.status === 'Disabled' ? '#10B981' : '#EF4444' }]}>
                        {item.status === 'Disabled' ? 'Enable' : 'Disable'}
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
