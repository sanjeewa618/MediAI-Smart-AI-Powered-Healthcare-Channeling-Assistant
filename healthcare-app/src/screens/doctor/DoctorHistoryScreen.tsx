import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, TextInput, Modal, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, User, Video, FileText, Calendar, ChevronRight, FileSearch, Search, Activity, X } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const DoctorHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Profile Modal State
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [richPatientData, setRichPatientData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null); // Keep track of which appt was tapped

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const completed = data.data.filter((a: any) => a.status === 'completed');
        // Sort by date descending
        completed.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistory(completed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const openPatientProfile = async (appt: any) => {
    setSelectedAppt(appt);
    setProfileModalVisible(true);
    setLoadingProfile(true);
    setRichPatientData(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/patient/${appt.patient._id}`, {
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

  const filteredHistory = history.filter((h: any) => {
    const patientName = h.patient?.name?.toLowerCase() || '';
    return patientName.includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#8B3DFF', '#6A11CB']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight size={22} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Patient History</Text>
            <Text style={styles.headerSub}>{history.length} past consultations</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient by name..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : filteredHistory.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
            <FileSearch size={48} color="#D1D5DB" />
            <Text style={{ marginTop: 12, color: '#9CA3AF', fontSize: 16 }}>No history found</Text>
          </View>
        ) : (
          filteredHistory.map((appt, index) => {
            const patientName = appt.patient?.name || 'Unknown Patient';
            const diagnosis = appt.notes || appt.symptoms || 'Consultation Completed';
            
            return (
              <TouchableOpacity 
                key={appt._id} 
                style={[styles.card, SHADOWS.small]} 
                onPress={() => openPatientProfile(appt)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <View style={styles.info}>
                    <Text style={styles.name}>{patientName}</Text>
                    {appt.patient?.phone && (
                      <Text style={styles.sub}>{appt.patient.phone}</Text>
                    )}
                  </View>
                  <View style={[styles.typeTag, { backgroundColor: '#F3F4F6' }]}>
                    <User size={12} color="#374151" />
                    <Text style={[styles.typeText]}>Physical</Text>
                  </View>
                </View>
                <View style={styles.diagBox}>
                  <FileText size={14} color={COLORS.primary} />
                  <Text style={styles.diagText} numberOfLines={2}>{diagnosis}</Text>
                </View>
                <View style={styles.dateRow}>
                  <View style={styles.dateTimeWrap}>
                    <Calendar size={13} color="#9CA3AF" />
                    <Text style={styles.dateText}>{new Date(appt.date).toLocaleDateString()}</Text>
                    <Clock size={13} color="#9CA3AF" style={{ marginLeft: 10 }} />
                    <Text style={styles.dateText}>{appt.timeSlot}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
          <View style={styles.profileModalHeader}>
            <TouchableOpacity onPress={() => setProfileModalVisible(false)} style={styles.closeBtn}>
              <ChevronRight size={24} color="#374151" style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Patient Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {loadingProfile ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : richPatientData ? (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              
              {/* Added specifically for the History screen: the appointment metadata the doctor tapped on */}
              {selectedAppt && (
                <View style={styles.apptContextCard}>
                  <Text style={styles.apptContextTitle}>Consultation Details</Text>
                  <View style={styles.apptContextRow}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.apptContextText}>Date: {new Date(selectedAppt.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.apptContextRow}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.apptContextText}>Allocated Time: {selectedAppt.timeSlot}</Text>
                  </View>
                  {(selectedAppt.notes || selectedAppt.symptoms) && (
                    <View style={[styles.apptContextRow, { alignItems: 'flex-start' }]}>
                      <FileText size={16} color="#6B7280" style={{ marginTop: 2 }} />
                      <Text style={[styles.apptContextText, { flex: 1 }]}>Notes: {selectedAppt.notes || selectedAppt.symptoms}</Text>
                    </View>
                  )}
                </View>
              )}

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
          ) : null}
        </SafeAreaView>
      </Modal>

      <DoctorBottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  headerTextWrap: { flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16, height: 50 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#1F2937', fontWeight: '500' },
  
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  sub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  diagBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryLight, padding: 10, borderRadius: 10, marginBottom: 10 },
  diagText: { fontSize: 13, color: COLORS.primaryDark, fontWeight: '600', flex: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateTimeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  
  // Profile Modal Styles
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  profileModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  closeBtn: { padding: 8 },
  
  apptContextCard: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FCA5A5' },
  apptContextTitle: { fontSize: 15, fontWeight: '700', color: '#991B1B', marginBottom: 10 },
  apptContextRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  apptContextText: { fontSize: 14, color: '#991B1B', fontWeight: '500' },

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
});

export default DoctorHistoryScreen;
