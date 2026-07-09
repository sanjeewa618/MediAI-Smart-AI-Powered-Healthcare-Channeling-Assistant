import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  ArrowLeft, 
  Check, 
  X,
  Stethoscope,
  BriefcaseMedical,
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const AdminRequestsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'doctor' | 'nurse'>('doctor');

  const filteredRequests = requests.filter(req => req.role === activeTab);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
      Alert.alert('Error', 'Failed to fetch pending requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/requests/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        Alert.alert('Success', 'Request approved successfully.');
        fetchRequests();
      } else {
        Alert.alert('Error', 'Failed to approve request.');
      }
    } catch (error) {
      console.error('Approve request error:', error);
      Alert.alert('Error', 'Network error.');
    }
  };

  const handleReject = async (id: string) => {
    Alert.alert(
      'Confirm Reject',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/admin/requests/${id}/reject`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if (response.ok) {
                Alert.alert('Success', 'Request rejected.');
                fetchRequests();
              } else {
                Alert.alert('Error', 'Failed to reject request.');
              }
            } catch (error) {
              console.error('Reject request error:', error);
              Alert.alert('Error', 'Network error.');
            }
          }
        }
      ]
    );
  };

  const renderRequestCard = ({ item }: { item: any }) => {
    const isDoctor = item.role === 'doctor';
    const Icon = isDoctor ? Stethoscope : BriefcaseMedical;
    
    return (
      <View style={[styles.card, SHADOWS.light]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: isDoctor ? '#ECFDF5' : '#EFF6FF' }]}>
            <Icon size={24} color={isDoctor ? '#10B981' : '#3B82F6'} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.role.charAt(0).toUpperCase() + item.role.slice(1)} Request</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Pending</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Email: </Text>{item.email}</Text>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Phone: </Text>{item.phone}</Text>
          {item.staffId && (
            <Text style={styles.detailText}><Text style={styles.detailLabel}>Staff ID: </Text>{item.staffId}</Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleReject(item._id)}>
            <X size={16} color="#EF4444" />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApprove(item._id)}>
            <Check size={16} color="#FFF" />
            <Text style={[styles.actionText, { color: '#FFF' }]}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AdminDashboard')}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff Requests</Text>
            <View style={{ width: 44 }} />
          </View>
          
          {/* Tab Selection */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'doctor' && styles.activeTab]}
              onPress={() => setActiveTab('doctor')}
            >
              <Text style={[styles.tabText, activeTab === 'doctor' && styles.activeTabText]}>Doctors</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'nurse' && styles.activeTab]}
              onPress={() => setActiveTab('nurse')}
            >
              <Text style={[styles.tabText, activeTab === 'nurse' && styles.activeTabText]}>Nurses</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={filteredRequests}
              keyExtractor={(item) => item._id}
              renderItem={renderRequestCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No pending requests found.</Text>
                </View>
              )}
            />
          )}
        </View>
        <AdminBottomNavBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  wrapper: { flex: 1 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 30 : 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEBFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  role: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  detailsContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textMain,
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  rejectBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  approveBtn: {
    backgroundColor: COLORS.primary,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  }
});

export default AdminRequestsScreen;
