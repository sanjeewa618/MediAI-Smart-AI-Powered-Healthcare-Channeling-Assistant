import React, { useEffect, useMemo, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.158.225.227:4000';

type VerificationRequest = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'doctor' | 'nurse';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended' | 'disabled' | 'verified';
  specialization?: string;
  department?: string;
  staffId?: string;
  verificationNotes?: string;
  createdAt?: string;
};

const DoctorVerificationScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Request Additional Documents Modal
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [activeReqId, setActiveReqId] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users?role=doctor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load verification requests');
      }

      setRequests((data.data || []) as VerificationRequest[]);
    } catch (error) {
      console.error('Fetch verification requests error:', error);
      Alert.alert('Error', 'Failed to fetch doctor verification requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const mapUiFilterToStatus = (selectedFilter: 'Pending' | 'Approved' | 'Rejected') => {
    switch (selectedFilter) {
      case 'Approved':
        return ['approved', 'verified'];
      case 'Rejected':
        return ['rejected'];
      default:
        return ['pending'];
    }
  };

  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected', successMessage: string) => {
    if (!token) {
      Alert.alert('Error', 'You must be signed in as an admin.');
      return;
    }

    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject';
      const response = await fetch(`${API_BASE_URL}/api/admin/requests/${id}/${endpoint}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || `Failed to ${status} request`);
      }

      Alert.alert('Success', successMessage);
      fetchRequests();
      setExpandedId(null);
    } catch (error) {
      console.error('Update request status error:', error);
      Alert.alert('Error', `Unable to ${status} this request.`);
    }
  };

  const handleApprove = (id: string) => {
    updateRequestStatus(id, 'approved', 'Doctor credentials approved and status updated.');
  };

  const handleReject = (id: string) => {
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this doctor registration request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => updateRequestStatus(id, 'rejected', 'Doctor registration rejected.') }
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
    const sendRequest = async () => {
      if (!token || !activeReqId) {
        Alert.alert('Error', 'Unable to request documents right now.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/requests/${activeReqId}/request-docs`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: requestText.trim() }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to request additional documents');
        }

        Alert.alert('Request Sent', 'Document request saved and sent to the doctor.');
        setDocModalVisible(false);
        setExpandedId(null);
        fetchRequests();
      } catch (error) {
        console.error('Request docs error:', error);
        Alert.alert('Error', 'Unable to send the document request.');
      }
    };

    void sendRequest();
  };

  const filteredRequests = useMemo(() => {
    const allowedStatuses = mapUiFilterToStatus(filter);
    return requests.filter(req => allowedStatuses.includes(req.status));
  }, [filter, requests]);

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
      case 'verified':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return 'Recently submitted';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
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
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Loading verification requests...</Text>
              </View>
            ) : null}
            renderItem={({ item }) => {
              const isExpanded = expandedId === item._id;
              return (
                <View style={[styles.requestCard, SHADOWS.light]}>
                  <TouchableOpacity 
                    activeOpacity={0.8} 
                    style={styles.cardHeader}
                    onPress={() => toggleExpand(item._id)}
                  >
                    <Image source={{ uri: `https://i.pravatar.cc/150?u=${item._id}` }} style={styles.avatar} />
                    <View style={styles.headerText}>
                      <Text style={styles.doctorName}>{item.name}</Text>
                      <Text style={styles.specialtyText}>{item.specialization || 'Doctor'}</Text>
                      <Text style={styles.dateText}>Submitted on: {formatDate(item.createdAt)}</Text>
                    </View>
                    {isExpanded ? <ChevronUp size={22} color={COLORS.textSecondary} /> : <ChevronDown size={22} color={COLORS.textSecondary} />}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.divider} />
                      
                      {/* SLMC detail */}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>SLMC Reg Number:</Text>
                        <Text style={styles.detailValue}>{item.staffId || 'Not provided'}</Text>
                      </View>

                      {/* License detail */}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Doctor ID:</Text>
                        <Text style={styles.detailValue}>{item._id}</Text>
                      </View>

                      {/* Certificates List */}
                      <Text style={styles.subHeading}>Submitted Documents & Certificates</Text>
                      <View style={styles.certItem}>
                        <FileText size={16} color={COLORS.primary} />
                        <Text style={styles.certText}>{item.verificationNotes || 'No extra request notes added.'}</Text>
                      </View>

                      {/* Certificate preview card mockup */}
                      <View style={styles.certificatePreview}>
                        <LinearGradient colors={['#FDFBFB', '#EBEDEE']} style={styles.certFrame}>
                          <FileCheck size={36} color={COLORS.primary} />
                          <Text style={styles.certPreviewTitle}>Verification Document Review</Text>
                          <Text style={styles.certPreviewSub}>{formatStatus(item.status)}</Text>
                        </LinearGradient>
                      </View>

                      {/* Action buttons (only for Pending requests) */}
                      {item.status === 'pending' && (
                        <View style={styles.actionRow}>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.reqDocsBtn]} 
                            onPress={() => openDocRequestModal(item._id)}
                          >
                            <AlertTriangle size={14} color="#F59E0B" />
                            <Text style={[styles.actionText, { color: '#D97706' }]}>Request Docs</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={[styles.actionButton, styles.rejectBtn]} 
                            onPress={() => handleReject(item._id)}
                          >
                            <X size={14} color="#EF4444" />
                            <Text style={[styles.actionText, { color: '#EF4444' }]}>Reject</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={[styles.actionButton, styles.approveBtn]} 
                            onPress={() => handleApprove(item._id)}
                          >
                            <Check size={14} color="#FFF" />
                            <Text style={[styles.actionText, { color: '#FFF' }]}>Approve</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {item.status !== 'pending' && item.verificationNotes ? (
                        <View style={[styles.certItem, { marginTop: 12 }]}>
                          <AlertTriangle size={16} color="#D97706" />
                          <Text style={styles.certText}>Follow-up note: {item.verificationNotes}</Text>
                        </View>
                      ) : null}
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
