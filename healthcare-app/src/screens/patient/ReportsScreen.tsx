import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal, Platform, ActivityIndicator, Alert, Image, Linking } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { FileText, Search, Filter, Bell, ArrowLeft, Download, Share2, Eye, Upload, CheckCircle2, Clock, Plus, Calendar, ChevronDown } from 'lucide-react-native';
import BottomNavBar from '../../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const reportCategories = ['All', 'Lab Reports', 'Scan Reports', 'Prescriptions', 'ECG', 'Vaccination', 'Other'];
  // No more mock reports

const ReportsScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // New States
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Lab Reports');
  const [uploadDate, setUploadDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patient/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReports(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access gallery is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUploadFile({
          uri: asset.uri,
          name: asset.fileName || asset.uri.split('/').pop() || 'report.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleViewReport = (report: any) => {
    if (report.attachments && report.attachments.length > 0) {
      Linking.openURL(`${API_BASE_URL}${report.attachments[0]}`);
    } else {
      Alert.alert('No file', 'This report does not have an attached file.');
    }
  };

  const handleDownloadReport = async (report: any) => {
    if (!report.attachments || report.attachments.length === 0) {
      Alert.alert('No file', 'This report does not have an attached file.');
      return;
    }

    try {
      const fileUrl = `${API_BASE_URL}${report.attachments[0]}`;
      const fileName = fileUrl.split('/').pop() || 'report_file';
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResumable = FileSystem.createDownloadResumable(fileUrl, fileUri);
      const result = await downloadResumable.downloadAsync();
      
      if (result) {
        Alert.alert('Success', `File successfully downloaded!`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to download report.');
    }
  };

  const handleShareReport = async (report: any) => {
    if (!report.attachments || report.attachments.length === 0) {
      Alert.alert('No file', 'This report does not have an attached file to share.');
      return;
    }

    try {
      const fileUrl = `${API_BASE_URL}${report.attachments[0]}`;
      const fileName = fileUrl.split('/').pop() || 'report_file';
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResumable = FileSystem.createDownloadResumable(fileUrl, fileUri);
      const result = await downloadResumable.downloadAsync();
      
      if (result) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(result.uri);
        } else {
          Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to share report.');
    }
  };

  const handleUploadReport = async () => {
    if (!uploadTitle.trim() || !uploadFile) {
      Alert.alert('Error', 'Please provide a title and select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('category', uploadCategory);
      formData.append('recordDate', uploadDate.toISOString());
      
      const fileExt = uploadFile.name.split('.').pop();
      formData.append('reportFile', {
        uri: uploadFile.uri,
        name: uploadFile.name || `report.${fileExt}`,
        type: uploadFile.mimeType || 'application/octet-stream',
      } as any);

      const res = await fetch(`${API_BASE_URL}/api/patient/reports/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Report uploaded successfully');
        setUploadModalVisible(false);
        setUploadTitle('');
        setUploadFile(null);
        setUploadDate(new Date());
        fetchReports(); // Refresh list
      } else {
        Alert.alert('Error', data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const filteredReports = reports.filter((report: any) => 
    (activeCategory === 'All' || report.category === activeCategory) &&
    (report.title.toLowerCase().includes(searchText.toLowerCase()) || 
     (report.doctor && report.doctor.toLowerCase().includes(searchText.toLowerCase())))
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

          {/* Reports List */}
          <View style={styles.reportsSection}>
            <Text style={styles.sectionTitle}>Your Reports</Text>
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <TouchableOpacity 
                  key={report._id || index.toString()}
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
                    <Text style={styles.reportHospital}>{report.hospital || 'Patient Upload'}</Text>
                    <View style={styles.reportMeta}>
                      <Text style={styles.reportMetaText}>
                        {report.doctor ? `Dr. ${report.doctor.split(' ')[1] || report.doctor}` : 'Self Uploaded'}
                      </Text>
                      <Text style={styles.reportMetaDot}>•</Text>
                      <Text style={styles.reportMetaText}>
                        {report.date ? report.date : report.recordDate ? new Date(report.recordDate).toLocaleDateString() : 'No Date'}
                      </Text>
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
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={() => setUploadModalVisible(true)}>
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Upload Modal */}
        <Modal visible={uploadModalVisible} transparent animationType="slide">
          <View style={styles.uploadModalOverlay}>
            <View style={styles.uploadModalContent}>
              <View style={styles.uploadModalHeader}>
                <Text style={styles.uploadModalTitle}>Add New Report</Text>
                <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                <Text style={styles.inputLabel}>Report Title</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Complete Blood Count"
                  value={uploadTitle}
                  onChangeText={setUploadTitle}
                />

                <Text style={styles.inputLabel}>Category</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text>{uploadCategory}</Text>
                  <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>

                {showCategoryPicker && (
                  <View style={styles.categoryDropdown}>
                    {reportCategories.filter(c => c !== 'All').map(cat => (
                      <TouchableOpacity 
                        key={cat} 
                        style={styles.categoryDropdownItem}
                        onPress={() => { setUploadCategory(cat); setShowCategoryPicker(false); }}
                      >
                        <Text style={styles.categoryDropdownText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={styles.inputLabel}>Record Date</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{uploadDate.toLocaleDateString()}</Text>
                  <Calendar size={20} color="#6B7280" />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={uploadDate}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) setUploadDate(selectedDate);
                    }}
                  />
                )}

                <Text style={styles.inputLabel}>Attachment</Text>
                <TouchableOpacity style={styles.filePickerButton} onPress={handlePickDocument}>
                  <Upload size={24} color={COLORS.primary} />
                  <Text style={styles.filePickerText}>
                    {uploadFile ? uploadFile.name : 'Select Image from Gallery'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.submitButton, (!uploadTitle.trim() || !uploadFile) && styles.submitButtonDisabled]} 
                  onPress={handleUploadReport}
                  disabled={uploading || !uploadTitle.trim() || !uploadFile}
                >
                  {uploading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Upload Report</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

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
                  <Text style={styles.modalHospital}>{(selectedReport as any).hospital || 'Patient Upload'}</Text>

                  {/* Attachment Preview */}
                  {(selectedReport as any).attachments && (selectedReport as any).attachments.length > 0 && (
                    <View style={{ marginTop: 20, width: '100%', alignItems: 'center' }}>
                      <Text style={styles.doctorNotesTitle}>Report Preview</Text>
                      <Image 
                        source={{ uri: `${API_BASE_URL}${(selectedReport as any).attachments[0]}` }} 
                        style={{ width: '100%', height: 300, borderRadius: 12, marginTop: 8, resizeMode: 'contain' }} 
                      />
                    </View>
                  )}

                  {/* Doctor Notes */}
                  <View style={styles.doctorNotesSection}>
                    <Text style={styles.doctorNotesTitle}>Doctor's Notes</Text>
                    <Text style={styles.doctorNotesText}>
                      {(selectedReport as any).description || 'No notes added by doctor yet.'}
                    </Text>
                  </View>

                  {/* Appointment Connection */}
                  {(selectedReport as any).appointment && (
                    <View style={[styles.appointmentCard, { backgroundColor: '#F3F0FF' }]}>
                      <Text style={styles.appointmentTitle}>Related Appointment</Text>
                      <Text style={styles.appointmentDate}>{(selectedReport as any).appointment.date}</Text>
                      <Text style={styles.appointmentDoctor}>
                        {(selectedReport as any).appointment.doctor ? `Dr. ${(selectedReport as any).appointment.doctor.split(' ')[1] || (selectedReport as any).appointment.doctor}` : ''}
                      </Text>
                      <Text style={styles.appointmentDept}>{(selectedReport as any).appointment.dept}</Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3F0FF' }]} onPress={() => handleViewReport(selectedReport)}>
                      <Eye size={20} color={COLORS.primary} />
                      <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3F0FF' }]} onPress={() => handleDownloadReport(selectedReport)}>
                      <Download size={20} color={COLORS.primary} />
                      <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F3F0FF' }]} onPress={() => handleShareReport(selectedReport)}>
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
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  uploadModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  uploadModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  uploadModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  closeText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textHeader,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.textHeader,
  },
  pickerButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryDropdown: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  categoryDropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryDropdownText: {
    fontSize: 16,
    color: COLORS.textHeader,
  },
  filePickerButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
  },
  filePickerText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ReportsScreen;
