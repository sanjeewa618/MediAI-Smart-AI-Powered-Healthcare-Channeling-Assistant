import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator, Modal, Dimensions, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Play, Clock, Check, ArrowRight, XCircle, User, Activity, FileText, RefreshCw } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';

const { height } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type DoctorSessionRouteProp = RouteProp<RootStackParamList, 'DoctorSession'>;

const DoctorSessionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<DoctorSessionRouteProp>();
  const { slot, appointments = [] } = route.params || {};
  const { token } = useAuth();

  const [patients, setPatients] = useState<any[]>(appointments);
  const [sessionState, setSessionState] = useState<'pending' | 'started' | 'ended'>(slot?.sessionStatus || 'pending');
  const [loadingAppId, setLoadingAppId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/api/doctor/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const timeSlotStr = `${slot.startTime} - ${slot.endTime}`;
        const updatedPatients = (data.data.todayAppointments || []).filter((app: any) => app.timeSlot === timeSlotStr);
        setPatients(updatedPatients);
      }
    } catch (error) {
      console.error('Error refreshing appointments:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Profile Modal State
  const [selectedAppIndex, setSelectedAppIndex] = useState<number | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [richPatientData, setRichPatientData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Initialize session state if already started previously
  useEffect(() => {
    if (sessionState === 'pending') {
      const isAlreadyStarted = patients.some(p => ['started', 'ready', 'in', 'completed', 'skipped'].includes(p.status));
      if (isAlreadyStarted) {
        setSessionState('started');
      }
    }
  }, []);

  const updatePatientStatus = async (appointmentId: string, newStatus: string) => {
    try {
      setLoadingAppId(appointmentId);
      const res = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update patient status.');
      throw err;
    } finally {
      setLoadingAppId(null);
    }
  };

  const handleStartSession = async () => {
    if (sessionState === 'started') {
      Alert.alert('End Session', 'Are you sure you want to end this session?', [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End', 
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_BASE_URL}/api/doctor/session/end`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                  date: new Date().toISOString(),
                  timeSlot: `${slot.startTime} - ${slot.endTime}`
                })
              });
              
              setSessionState('ended');
              Alert.alert('Session Ended', 'New patients can no longer book this session.');
            } catch (error) {
              Alert.alert('Error', 'Failed to end session.');
            }
          }
        }
      ]);
      return;
    }

    try {
      const updatedPatients = [...patients];
      let firstAssigned = false;
      const promises = updatedPatients.map(p => {
        if (p.status === 'pending' || p.status === 'confirmed') {
          if (!firstAssigned) {
            p.status = 'ready';
            firstAssigned = true;
          } else {
            p.status = 'started';
          }
          return updatePatientStatus(p._id, p.status);
        }
        return Promise.resolve();
      });

      // Start DailySession in backend
      promises.push(
        fetch(`${API_BASE_URL}/api/doctor/session/start`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            date: new Date().toISOString(),
            timeSlot: `${slot.startTime} - ${slot.endTime}`
          })
        }).then(res => res.json())
      );

      await Promise.all(promises);
      setPatients(updatedPatients);
      setSessionState('started');
    } catch (error) {
       // Handled in updatePatientStatus
    }
  };

  const handleArrowRight = async (appIndex: number) => {
    const updatedPatients = [...patients];
    
    // Ensure only one patient can be IN at a time
    if (updatedPatients.some(p => p.status === 'in')) {
      Alert.alert('Action Blocked', 'Another patient is currently in session. Please complete, skip, or cancel them first.');
      return;
    }

    const currentPatient = updatedPatients[appIndex];

    try {
      await updatePatientStatus(currentPatient._id, 'in');
      currentPatient.status = 'in';

      // Find the next available patient and set them to ready
      for (let i = appIndex + 1; i < updatedPatients.length; i++) {
        if (updatedPatients[i].status === 'started') {
          await updatePatientStatus(updatedPatients[i]._id, 'ready');
          updatedPatients[i].status = 'ready';
          break; // only set the first available to ready
        }
      }
      setPatients(updatedPatients);
      setProfileModalVisible(false); // Auto close modal if open
    } catch (error) {}
  };

  const autoPromoteToIn = async (updatedPatients: any[]) => {
    if (updatedPatients.some(p => p.status === 'in')) return;

    const nextInIndex = updatedPatients.findIndex(p => p.status === 'nextIn');
    if (nextInIndex !== -1) {
      await updatePatientStatus(updatedPatients[nextInIndex]._id, 'in');
      updatedPatients[nextInIndex].status = 'in';
      return;
    }

    const readyIndex = updatedPatients.findIndex(p => p.status === 'ready');
    if (readyIndex !== -1) {
      await updatePatientStatus(updatedPatients[readyIndex]._id, 'in');
      updatedPatients[readyIndex].status = 'in';
      
      for (let j = readyIndex + 1; j < updatedPatients.length; j++) {
        if (updatedPatients[j].status === 'started') {
          await updatePatientStatus(updatedPatients[j]._id, 'ready');
          updatedPatients[j].status = 'ready';
          break;
        }
      }
      return;
    }

    const startedIndex = updatedPatients.findIndex(p => p.status === 'started');
    if (startedIndex !== -1) {
      await updatePatientStatus(updatedPatients[startedIndex]._id, 'in');
      updatedPatients[startedIndex].status = 'in';
      return;
    }
  };

  const handleSkip = async (appIndex: number) => {
    const updatedPatients = [...patients];
    const currentPatient = updatedPatients[appIndex];
    const wasIn = currentPatient.status === 'in';

    try {
      await updatePatientStatus(currentPatient._id, 'skipped');
      currentPatient.status = 'skipped';

      if (wasIn) {
        await autoPromoteToIn(updatedPatients);
      }

      setPatients(updatedPatients);
      setProfileModalVisible(false);
    } catch (error) {}
  };

  const handleComplete = async (appIndex: number) => {
    const updatedPatients = [...patients];
    const currentPatient = updatedPatients[appIndex];
    const wasIn = currentPatient.status === 'in';

    try {
      await updatePatientStatus(currentPatient._id, 'completed');
      currentPatient.status = 'completed';
      
      if (wasIn) {
        await autoPromoteToIn(updatedPatients);
      }

      setPatients(updatedPatients);
      setProfileModalVisible(false);
    } catch (error) {}
  };

  const handleCancel = async (appIndex: number) => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      { 
        text: 'Yes, Cancel', 
        style: 'destructive',
        onPress: async () => {
          const updatedPatients = [...patients];
          const currentPatient = updatedPatients[appIndex];
          const wasIn = currentPatient.status === 'in';
          try {
            await updatePatientStatus(currentPatient._id, 'cancelled');
            currentPatient.status = 'cancelled';
            
            if (wasIn) {
              await autoPromoteToIn(updatedPatients);
            }

            setPatients(updatedPatients);
            setProfileModalVisible(false);
          } catch (error) {}
        }
      }
    ]);
  };

  const openPatientProfile = async (appIndex: number) => {
    setSelectedAppIndex(appIndex);
    setProfileModalVisible(true);
    setLoadingProfile(true);
    setRichPatientData(null);

    const app = patients[appIndex];
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/patient/${app.patient._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRichPatientData(data.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not load full patient profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    let bgColor = '#F3F4F6';
    let textColor = '#4B5563';
    let text = status.toUpperCase();

    if (status === 'ready') { bgColor = '#DBEAFE'; textColor = '#1D4ED8'; }
    if (status === 'in') { bgColor = '#FEF3C7'; textColor = '#D97706'; }
    if (status === 'nextIn') { bgColor = '#FFEDD5'; textColor = '#C2410C'; text = 'NEXT IN'; }
    if (status === 'started') { bgColor = '#E0E7FF'; textColor = '#4338CA'; }
    if (status === 'skipped') { bgColor = '#FEE2E2'; textColor = '#B91C1C'; }
    if (status === 'completed') { bgColor = '#D1FAE5'; textColor = '#059669'; }

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#8B3DFF', '#6A11CB']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight size={22} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Session Details</Text>
            <Text style={styles.headerSub}>{slot?.startTime} – {slot?.endTime}</Text>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn} disabled={isRefreshing}>
            <RefreshCw size={22} color="#FFF" style={isRefreshing ? { opacity: 0.5 } : {}} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session Control Card */}
        <View style={styles.sessionControlCard}>
          <View style={styles.sessionControlInfo}>
            <Text style={styles.sessionControlTitle}>
              {sessionState === 'started' ? 'Session is Active' : sessionState === 'ended' ? 'Session Ended' : 'Ready to Start?'}
            </Text>
            <Text style={styles.sessionControlSub}>
              {patients.filter(p => !['skipped', 'completed'].includes(p.status)).length} Patient(s) left
            </Text>
          </View>
          
          {sessionState === 'ended' ? (
            <Text style={{ color: '#DC2626', fontWeight: '700', fontSize: 14 }}>Session had been ended.</Text>
          ) : (
            <TouchableOpacity style={[styles.startBtn, sessionState === 'started' && styles.endBtn]} onPress={handleStartSession}>
              {sessionState === 'started' ? (
                <Text style={[styles.startBtnText, { color: '#DC2626' }]}>End Session</Text>
              ) : (
                <LinearGradient colors={['#10B981', '#059669']} style={styles.startBtnGrad}>
                  <Play size={18} color="#FFF" fill="#FFF" />
                  <Text style={styles.startBtnText}>START</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>Patient Queue</Text>
        
        {patients.length === 0 ? (
          <View style={styles.emptyBox}>
            <Clock size={40} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No appointments yet</Text>
            <Text style={styles.emptySub}>Patients booking this slot will appear here.</Text>
          </View>
        ) : (
          patients.map((app: any, index: number) => {
            const isLoading = loadingAppId === app._id;
            const isActive = app.status === 'in';
            const isReady = app.status === 'ready';
            const isNextIn = app.status === 'nextIn';
            const isSkipped = app.status === 'skipped';
            const isCompleted = app.status === 'completed';

            return (
              <TouchableOpacity 
                key={app._id} 
                style={[
                  styles.patientCard, 
                  isActive && styles.patientCardIn,
                  isReady && styles.patientCardReady,
                  isNextIn && styles.patientCardNextIn,
                  (isSkipped || isCompleted) && { opacity: 0.5 },
                  isActive && { flexDirection: 'column', alignItems: 'stretch' }
                ]}
                onPress={() => openPatientProfile(index)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                  <View style={styles.queueCircle}>
                    <Text style={styles.queueText}>{app.queueNumber}</Text>
                  </View>
                  
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{app.patient?.name || 'Unknown Patient'}</Text>
                    {renderStatusBadge(app.status)}
                  </View>

                  {isLoading && (
                    <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 10 }} />
                  )}

                  {!isActive && !isLoading && (
                    <View style={styles.actionButtonsRow}>
                      {isReady && (
                        <TouchableOpacity style={styles.iconBtn} onPress={(e) => { e.stopPropagation(); handleArrowRight(index); }}>
                          <ArrowRight size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                {isActive && !isLoading && (
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, width: '100%' }}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FEE2E2', flex: 1, justifyContent: 'center' }]} onPress={(e) => { e.stopPropagation(); handleSkip(index); }}>
                      <XCircle size={16} color="#DC2626" />
                      <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Skip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#D1FAE5', flex: 1, justifyContent: 'center' }]} onPress={(e) => { e.stopPropagation(); handleComplete(index); }}>
                      <Check size={16} color="#059669" />
                      <Text style={[styles.actionBtnText, { color: '#059669' }]}>Complete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setProfileModalVisible(false)} style={styles.closeBtn}>
              <ChevronRight size={24} color="#374151" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Patient Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {loadingProfile ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : richPatientData ? (
            <>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                {/* Basic Info */}
                <View style={styles.profileCard}>
                  <View style={styles.profileIconCircle}>
                    <User size={32} color={COLORS.primary} />
                  </View>
                  <Text style={styles.profileName}>{richPatientData.patient.name}</Text>
                  <Text style={styles.profileEmail}>{richPatientData.patient.email}</Text>
                  <View style={styles.tagsRow}>
                    {richPatientData.patient.gender && (
                      <View style={styles.infoTag}><Text style={styles.infoTagText}>{richPatientData.patient.gender}</Text></View>
                    )}
                    {richPatientData.patient.bloodGroup && (
                      <View style={styles.infoTag}><Text style={styles.infoTagText}>Blood: {richPatientData.patient.bloodGroup}</Text></View>
                    )}
                  </View>
                </View>

                {/* Vitals & History */}
                <Text style={styles.profileSectionTitle}>Health Information</Text>
                <View style={styles.profileListCard}>
                  <View style={styles.profileListItem}>
                    <Activity size={20} color="#6B7280" />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.profileListLabel}>Allergies</Text>
                      <Text style={styles.profileListValue}>
                        {richPatientData.patient.allergies?.length > 0 ? richPatientData.patient.allergies.join(', ') : 'None Reported'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.profileListItem, { borderBottomWidth: 0 }]}>
                    <Activity size={20} color="#6B7280" />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.profileListLabel}>Chronic Conditions</Text>
                      <Text style={styles.profileListValue}>
                        {richPatientData.patient.chronicConditions?.length > 0 ? richPatientData.patient.chronicConditions.join(', ') : 'None Reported'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Reports */}
                <Text style={styles.profileSectionTitle}>Medical Reports</Text>
                {richPatientData.reports?.length > 0 ? (
                  richPatientData.reports.map((report: any) => (
                    <TouchableOpacity 
                      key={report._id} 
                      style={styles.reportCard}
                      onPress={() => {
                        if (report.attachments && report.attachments.length > 0) {
                          let url = report.attachments[0];
                          if (url.startsWith('/')) {
                            url = `${API_BASE_URL}${url}`;
                          }
                          Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot open this report. Ensure you have a PDF/Image viewer installed.'));
                        } else {
                          Alert.alert('No Attachment', 'There is no file attached to this report.');
                        }
                      }}
                    >
                      <FileText size={24} color={COLORS.primary} />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.reportTitle}>{report.title || 'Medical Report'}</Text>
                        <Text style={styles.reportDate}>{new Date(report.recordDate).toLocaleDateString()}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noReportsText}>No previous reports available.</Text>
                )}
              </ScrollView>

              {/* Sticky Action Footer */}
              {selectedAppIndex !== null && (
                <View style={styles.modalStickyFooter}>
                  {(() => {
                    const app = patients[selectedAppIndex];
                    const isReady = app.status === 'ready';
                    const isActive = app.status === 'in';
                    const isLoading = loadingAppId === app._id;

                    if (isLoading) {
                      return <ActivityIndicator size="small" color={COLORS.primary} />;
                    }

                    return (
                      <View style={{ gap: 10 }}>
                        {['pending', 'confirmed', 'ready', 'started', 'in'].includes(app.status) && (
                          <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#FEE2E2', flex: 1 }]} onPress={() => handleSkip(selectedAppIndex)}>
                              <XCircle size={20} color="#DC2626" />
                              <Text style={[styles.footerBtnText, { color: '#DC2626' }]}>Skip</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#10B981', flex: 1 }]} onPress={() => handleComplete(selectedAppIndex)}>
                              <Check size={20} color="#FFF" />
                              <Text style={[styles.footerBtnText, { color: '#FFF' }]}>Complete</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {!['pending', 'confirmed', 'ready', 'started', 'in'].includes(app.status) && (
                          <View style={[styles.footerBtn, { backgroundColor: '#E5E7EB' }]}>
                            <Text style={[styles.footerBtnText, { color: '#6B7280' }]}>Status: {app.status.toUpperCase()}</Text>
                          </View>
                        )}

                        {['pending', 'confirmed', 'ready', 'started'].includes(app.status) && (
                          <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => handleCancel(selectedAppIndex)}>
                            <XCircle size={20} color="#DC2626" />
                            <Text style={[styles.footerBtnText, { color: '#DC2626' }]}>Cancel Appointment</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })()}
                </View>
              )}
            </>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content: { padding: 20, paddingBottom: 100 },
  sessionControlCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  sessionControlInfo: { flex: 1 },
  sessionControlTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  sessionControlSub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  startBtn: { overflow: 'hidden', borderRadius: 12 },
  startBtnGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  endBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 20, paddingVertical: 12 },
  startBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12, marginLeft: 4 },
  patientCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  patientCardReady: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF'
  },
  patientCardIn: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    borderWidth: 2
  },
  patientCardNextIn: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED'
  },
  queueCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  queueText: { fontSize: 16, fontWeight: '800', color: '#374151' },
  patientInfo: { flex: 1, alignItems: 'flex-start' },
  patientName: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  actionButtonsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: COLORS.primaryLight },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  actionBtnText: { fontWeight: '700', fontSize: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#4B5563', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  // Modal Styles
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  closeBtn: { padding: 8 },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  profileCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20 },
  profileIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  profileName: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  profileEmail: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  infoTag: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  infoTagText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  profileSectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12, marginLeft: 4 },
  profileListCard: { backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16, marginBottom: 20 },
  profileListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  profileListLabel: { fontSize: 13, color: '#9CA3AF' },
  profileListValue: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginTop: 2 },
  reportCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reportTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  reportDate: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  noReportsText: { fontSize: 14, color: '#9CA3AF', fontStyle: 'italic', marginLeft: 4 },
  modalStickyFooter: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  footerBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});

export default DoctorSessionScreen;
