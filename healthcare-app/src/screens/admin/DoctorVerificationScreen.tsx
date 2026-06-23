import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  ArrowLeft, 
  FileText, 
  Check, 
  X, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  UserCheck
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const INITIAL_REQUESTS = [
  {
    id: 'V001',
    name: 'Dr. Priyantha Cooray',
    specialty: 'Pediatrician',
    slmcNumber: 'SLMC-REG-2015-8942',
    licenseNumber: 'LIC-PED-554109',
    certificates: ['Pediatrics Specialization - Faculty of Medicine Colombo', 'Board Certified MD in Child Health'],
    status: 'Pending',
    dateSubmitted: '2026-06-22',
    img: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png'
  },
  {
    id: 'V002',
    name: 'Dr. Sanduni Perera',
    specialty: 'Dermatologist',
    slmcNumber: 'SLMC-REG-2018-1249',
    licenseNumber: 'LIC-DERM-998241',
    certificates: ['MD in Dermatology - Post Graduate Institute of Medicine', 'Advanced Cosmetology Diploma'],
    status: 'Pending',
    dateSubmitted: '2026-06-23',
    img: 'https://img.icons8.com/bubbles/100/000000/female-doctor.png'
  },
  {
    id: 'V003',
    name: 'Dr. Saman Perera',
    specialty: 'Cardiologist',
    slmcNumber: 'SLMC-REG-2010-3351',
    licenseNumber: 'LIC-CARD-112093',
    certificates: ['Cardiology Fellowship - Royal College of Physicians'],
    status: 'Approved',
    dateSubmitted: '2026-06-15',
    img: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png'
  },
];

const DoctorVerificationScreen = () => {
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Request Additional Documents Modal
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [activeReqId, setActiveReqId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        Alert.alert('Approved', 'Doctor credentials approved and status updated.');
        return { ...req, status: 'Approved' };
      }
      return req;
    }));
    setExpandedId(null);
  };

  const handleReject = (id: string) => {
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this doctor registration request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => {
          setRequests(prev => prev.map(req => {
            if (req.id === id) {
              return { ...req, status: 'Rejected' };
            }
            return req;
          }));
          setExpandedId(null);
          Alert.alert('Rejected', 'Doctor registration rejected.');
        }}
      ]
    );
  };

  const openDocRequestModal = (id: string) => {
    setActiveReqId(id);
    setRequestText('');
    setDocModalVisible(true);
  };

  const submitDocRequest = () => {
    if (!requestText.trim()) {
      Alert.alert('Error', 'Please enter a description of the documents needed.');
      return;
    }
    Alert.alert(
      'Request Sent',
      `An email notification requesting "${requestText}" has been sent to the doctor.`,
      [{ text: 'OK', onPress: () => setDocModalVisible(false) }]
    );
  };

  const filteredRequests = requests.filter(req => req.status === filter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        {/* Top Header */}
        <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AdminDashboard')}>
                <ArrowLeft size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Doctor Verifications</Text>
              <View style={{ width: 44 }} />
            </View>

            {/* Filter selection buttons */}
            <View style={styles.filterContainer}>
              {(['Pending', 'Approved', 'Rejected'] as const).map(item => (
                <TouchableOpacity 
                  key={item}
                  style={[styles.filterBtn, filter === item && styles.activeFilterBtn]}
                  onPress={() => { setFilter(item); setExpandedId(null); }}
                >
                  <Text style={[styles.filterBtnText, filter === item && styles.activeFilterBtnText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>

          {/* Main List */}
          <FlatList 
            data={filteredRequests}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isExpanded = expandedId === item.id;
              return (
                <View style={[styles.requestCard, SHADOWS.light]}>
                  <TouchableOpacity 
                    activeOpacity={0.8} 
                    style={styles.cardHeader}
                    onPress={() => toggleExpand(item.id)}
                  >
                    <Image source={{ uri: item.img }} style={styles.avatar} />
                    <View style={styles.headerText}>
                      <Text style={styles.doctorName}>{item.name}</Text>
                      <Text style={styles.specialtyText}>{item.specialty}</Text>
                      <Text style={styles.dateText}>Submitted on: {item.dateSubmitted}</Text>
                    </View>
                    {isExpanded ? <ChevronUp size={22} color={COLORS.textSecondary} /> : <ChevronDown size={22} color={COLORS.textSecondary} />}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />
                      
                      {/* SLMC detail */}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>SLMC Reg Number:</Text>
                        <Text style={styles.detailValue}>{item.slmcNumber}</Text>
                      </View>

                      {/* License detail */}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Medical License:</Text>
                        <Text style={styles.detailValue}>{item.licenseNumber}</Text>
                      </View>

                      {/* Certificates List */}
                      <Text style={styles.subHeading}>Submitted Documents & Certificates</Text>
                      {item.certificates.map((cert, index) => (
                        <View key={index} style={styles.certItem}>
                          <FileText size={16} color={COLORS.primary} />
                          <Text style={styles.certText}>{cert}</Text>
                        </View>
                      ))}

                      {/* Certificate preview card mockup */}
                      <View style={styles.certificatePreview}>
                        <LinearGradient colors={['#FDFBFB', '#EBEDEE']} style={styles.certFrame}>
                          <FileCheck size={36} color={COLORS.primary} />
                          <Text style={styles.certPreviewTitle}>Official SLMC Certificate Certificate</Text>
                          <Text style={styles.certPreviewSub}>{item.slmcNumber}</Text>
                        </LinearGradient>
                      </View>

                      {/* Action buttons (only for Pending requests) */}
                      {item.status === 'Pending' && (
                        <View style={styles.actionRow}>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.reqDocsBtn]} 
                            onPress={() => openDocRequestModal(item.id)}
                          >
                            <AlertTriangle size={14} color="#F59E0B" />
                            <Text style={[styles.actionText, { color: '#D97706' }]}>Request Docs</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={[styles.actionButton, styles.rejectBtn]} 
                            onPress={() => handleReject(item.id)}
                          >
                            <X size={14} color="#EF4444" />
                            <Text style={[styles.actionText, { color: '#EF4444' }]}>Reject</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={[styles.actionButton, styles.approveBtn]} 
                            onPress={() => handleApprove(item.id)}
                          >
                            <Check size={14} color="#FFF" />
                            <Text style={[styles.actionText, { color: '#FFF' }]}>Approve</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No registration requests found.</Text>
              </View>
            )}
          />

      {/* Request Docs Modal */}
      <Modal
        visible={docModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDocModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Additional Documents</Text>
            <Text style={styles.modalSub}>Describe which credentials or certificates the doctor must submit.</Text>
            
            <TextInput 
              style={styles.modalInput}
              placeholder="E.g., Clear copy of medical license back side, PGIM certificate"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={requestText}
              onChangeText={setRequestText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDocModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitDocRequest}>
                <Text style={styles.submitBtnText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
      <AdminBottomNavBar />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  activeFilterBtn: {
    backgroundColor: COLORS.white,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  activeFilterBtnText: {
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEBFF',
    shadowColor: '#7B2FF7', 
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
  },
  headerText: {
    flex: 1,
    marginLeft: 14,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  specialtyText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.textHeader,
    fontWeight: '700',
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginTop: 12,
    marginBottom: 8,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    gap: 8,
  },
  certText: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  certificatePreview: {
    marginTop: 12,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  certFrame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  certPreviewTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginTop: 6,
  },
  certPreviewSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
    gap: 6,
  },
  reqDocsBtn: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFDF5',
  },
  rejectBtn: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  approveBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textHeader,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    fontSize: 14,
    color: COLORS.textHeader,
    marginTop: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});

export default DoctorVerificationScreen;
