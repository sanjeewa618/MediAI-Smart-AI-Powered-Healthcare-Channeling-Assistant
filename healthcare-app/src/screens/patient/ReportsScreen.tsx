import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Modal, FlatList, Platform } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { FileText, Search, Filter, Bell, ArrowLeft, Download, Share2, Eye, Upload, AlertCircle, CheckCircle2, Clock } from 'lucide-react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const reportCategories = ['All', 'Lab Reports', 'Scan Reports', 'Prescriptions', 'ECG', 'Vaccination'];

const mockReports = [
  {
    id: '1',
    title: 'Complete Blood Count (CBC)',
    hospital: 'Asiri Hospital',
    doctor: 'Dr. Emma Watson',
    date: '12 May 2026',
    status: 'Ready',
    type: 'Lab Reports',
    values: { hemoglobin: '14.5', glucose: '95', cholesterol: '180' },
    appointment: { date: '15 May 2026', doctor: 'Dr. Emma Watson', dept: 'Cardiology' }
  },
  {
    id: '2',
    title: 'Chest X-Ray Report',
    hospital: 'City Hospital',
    doctor: 'Dr. John Doe',
    date: '10 May 2026',
    status: 'Reviewed',
    type: 'Scan Reports',
    appointment: { date: '20 May 2026', doctor: 'Dr. John Doe', dept: 'Pulmonology' }
  },
  {
    id: '3',
    title: 'Blood Pressure Monitoring',
    hospital: 'Home Care',
    doctor: 'Dr. Sarah Miller',
    date: '08 May 2026',
    status: 'Pending',
    type: 'Lab Reports',
    values: { systolic: '120', diastolic: '80' }
  },
  {
    id: '4',
    title: 'ECG Report',
    hospital: 'Asiri Hospital',
    doctor: 'Dr. Emma Watson',
    date: '05 May 2026',
    status: 'Ready',
    type: 'ECG',
    appointment: { date: '25 May 2026', doctor: 'Dr. Emma Watson', dept: 'Cardiology' }
  }
];

const ReportsScreen = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredReports = mockReports.filter(report => 
    (activeCategory === 'All' || report.type === activeCategory) &&
    (report.title.toLowerCase().includes(searchText.toLowerCase()) || 
     report.hospital.toLowerCase().includes(searchText.toLowerCase()))
  );

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'Ready': return '#10B981';
      case 'Reviewed': return '#8B5CF6';
      case 'Pending': return '#F59E0B';
      default: return COLORS.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Ready': return <CheckCircle2 size={16} color="#10B981" />;
      case 'Reviewed': return <CheckCircle2 size={16} color="#8B5CF6" />;
      case 'Pending': return <Clock size={16} color="#F59E0B" />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* Header */}
        <LinearGradient colors={COLORS.screenHeaderGradient} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.titleSection}>
              <View style={styles.titleRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
                  <ArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Medical Reports</Text>
              </View>
              <Text style={styles.headerSub}>Your complete health records</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search reports..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.filterBtn}>
              <Filter size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Patient Summary Card */}
          <View style={[styles.patientCard, SHADOWS.medium]}>
            <View style={styles.patientCardContent}>
              <Image 
                source={require('../../../assets/robot-avatar.png')}
                style={styles.patientAvatar}
              />
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>Sarah Johnson</Text>
                <Text style={styles.patientId}>ID: #MED-2024-0821</Text>
                <View style={styles.patientMeta}>
                  <Text style={styles.patientMetaText}>25 yrs</Text>
                  <Text style={styles.patientMetaDot}>•</Text>
                  <Text style={styles.patientMetaText}>O+</Text>
                  <Text style={styles.patientMetaDot}>•</Text>
                  <Text style={styles.patientMetaText}>Female</Text>
                </View>
              </View>
            </View>
            <View style={styles.allergyBadge}>
              <AlertCircle size={16} color="#EF4444" />
              <Text style={styles.allergyText}>Allergies</Text>
            </View>
          </View>

          {/* Report Categories */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Report Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {reportCategories.map((cat) => (
                <TouchableOpacity 
                  key={cat}
                  style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Medical Values Section */}
          <View style={styles.valuesSection}>
            <Text style={styles.sectionTitle}>Important Medical Values</Text>
            <View style={styles.valuesGrid}>
              <View style={[styles.valueCard, SHADOWS.small]}>
                <Text style={styles.valueLabel}>Blood Sugar</Text>
                <Text style={styles.valueNumber}>95</Text>
                <Text style={styles.valueUnit}>mg/dL</Text>
                <View style={[styles.valueStatus, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.valueStatusText, { color: '#166534' }]}>Normal</Text>
                </View>
              </View>
              <View style={[styles.valueCard, SHADOWS.small]}>
                <Text style={styles.valueLabel}>Cholesterol</Text>
                <Text style={styles.valueNumber}>180</Text>
                <Text style={styles.valueUnit}>mg/dL</Text>
                <View style={[styles.valueStatus, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.valueStatusText, { color: '#92400E' }]}>Borderline</Text>
                </View>
              </View>
              <View style={[styles.valueCard, SHADOWS.small]}>
                <Text style={styles.valueLabel}>Blood Pressure</Text>
                <Text style={styles.valueNumber}>120/80</Text>
                <Text style={styles.valueUnit}>mmHg</Text>
                <View style={[styles.valueStatus, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.valueStatusText, { color: '#166534' }]}>Normal</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reports List */}
          <View style={styles.reportsSection}>
            <Text style={styles.sectionTitle}>Your Reports</Text>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <TouchableOpacity 
                  key={report.id}
                  style={[styles.reportCard, SHADOWS.small]}
                  onPress={() => { setSelectedReport(report); setModalVisible(true); }}
                >
                  <View style={styles.reportCardLeft}>
                    <View style={[styles.reportIcon, { backgroundColor: '#F5F3FF' }]}>
                      <FileText size={24} color={COLORS.primary} />
                    </View>
                  </View>
                  <View style={styles.reportCardCenter}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportHospital}>{report.hospital}</Text>
                    <View style={styles.reportMeta}>
                      <Text style={styles.reportMetaText}>Dr. {report.doctor.split(' ')[1]}</Text>
                      <Text style={styles.reportMetaDot}>•</Text>
                      <Text style={styles.reportMetaText}>{report.date}</Text>
                    </View>
                  </View>
                  <View style={styles.reportCardRight}>
                    <View style={[styles.statusBadge, { borderColor: getStatusColor(report.status) }]}>
                      {getStatusIcon(report.status)}
                      <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                        {report.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <FileText size={48} color={COLORS.primary} />
                <Text style={styles.emptyText}>No reports found</Text>
              </View>
            )}
          </View>

          {/* Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Add New Report</Text>
            <TouchableOpacity style={[styles.uploadCard, SHADOWS.small]}>
              <Upload size={28} color={COLORS.primary} />
              <Text style={styles.uploadText}>Upload Report</Text>
              <Text style={styles.uploadSubtext}>PDF, JPG, PNG</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Report Preview Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <ArrowLeft size={24} color={COLORS.textHeader} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Report Details</Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedReport ? (
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={[styles.modalCard, SHADOWS.medium]}>
                  <View style={[styles.reportIcon, { backgroundColor: '#F5F3FF' }]}>
                    <FileText size={32} color={COLORS.primary} />
                  </View>
                  <Text style={styles.modalReportTitle}>{(selectedReport as any).title}</Text>
                  <Text style={styles.modalHospital}>{(selectedReport as any).hospital}</Text>

                  {/* Doctor Notes */}
                  <View style={styles.doctorNotesSection}>
                    <Text style={styles.doctorNotesTitle}>Doctor's Notes</Text>
                    <Text style={styles.doctorNotesText}>
                      Patient shows normal vital signs. Continue current medication routine. Follow-up appointment scheduled for comprehensive evaluation.
                    </Text>
                  </View>

                  {/* Appointment Connection */}
                  {(selectedReport as any).appointment && (
                    <View style={[styles.appointmentCard, { backgroundColor: '#F3F0FF' }]}>
                      <Text style={styles.appointmentTitle}>Related Appointment</Text>
                      <Text style={styles.appointmentDate}>{(selectedReport as any).appointment.date}</Text>
                      <Text style={styles.appointmentDoctor}>Dr. {(selectedReport as any).appointment.doctor.split(' ')[1]}</Text>
                      <Text style={styles.appointmentDept}>{(selectedReport as any).appointment.dept}</Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3F0FF' }]}>
                      <Eye size={20} color={COLORS.primary} />
                      <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3F0FF' }]}>
                      <Download size={20} color={COLORS.primary} />
                      <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3F0FF' }]}>
                      <Share2 size={20} color={COLORS.primary} />
                      <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Share</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Security Notice */}
                  <View style={styles.securityNotice}>
                    <Text style={styles.securityTitle}>🔒 Secure Storage</Text>
                    <Text style={styles.securityText}>Your medical records are encrypted and securely stored.</Text>
                  </View>
                </View>
              </ScrollView>
            ) : null}
          </SafeAreaView>
        </Modal>

        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  wrapper: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  titleArrow: {
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textHeader,
  },
  filterBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  patientId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  patientMetaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  patientMetaDot: {
    marginHorizontal: 4,
    color: COLORS.border,
  },
  allergyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  allergyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 12,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  valuesSection: {
    marginBottom: 24,
  },
  valuesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  valueCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  valueNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginTop: 4,
  },
  valueUnit: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  valueStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  valueStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  reportsSection: {
    marginBottom: 24,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportCardLeft: {
    marginRight: 12,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCardCenter: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  reportHospital: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reportMetaText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  reportMetaDot: {
    marginHorizontal: 4,
    color: '#D1D5DB',
  },
  reportCardRight: {
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalReportTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginTop: 12,
    textAlign: 'center',
  },
  modalHospital: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  doctorNotesSection: {
    width: '100%',
    backgroundColor: '#F3F0FF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  doctorNotesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  doctorNotesText: {
    fontSize: 13,
    color: COLORS.textHeader,
    lineHeight: 20,
  },
  appointmentCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  appointmentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  appointmentDate: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textHeader,
    marginTop: 6,
  },
  appointmentDoctor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appointmentDept: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  actionButtons: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  securityNotice: {
    width: '100%',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  securityText: {
    fontSize: 11,
    color: '#1E40AF',
    marginTop: 4,
  },
});

export default ReportsScreen;
