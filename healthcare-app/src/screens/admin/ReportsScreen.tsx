import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Download,
  Calendar,
  Users,
  Brain,
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Share2,
  Filter,
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type ReportKey = 'patient-registration' | 'doctor-consultation' | 'appointment-activity' | 'ai-diagnostics';
type RangeKey = '7d' | '30d' | '90d' | 'thisMonth' | 'lastMonth';
type ExportFormat = 'PDF' | 'Excel';

type ReportResponse = {
  reportType: ReportKey;
  title: string;
  description: string;
  range: {
    label: string;
    start: string;
    end: string;
  };
  summary: Record<string, string | number>;
  rows: Array<Record<string, any>>;
};

const REPORT_TYPES: Array<{
  key: ReportKey;
  name: string;
  icon: React.ReactNode;
  hint: string;
}> = [
  {
    key: 'patient-registration',
    name: 'Patient Registration Summary',
    icon: <Users size={20} color={COLORS.primary} />,
    hint: 'Onboarding volume, registrations, and user growth',
  },
  {
    key: 'doctor-consultation',
    name: 'Doctor Consultation Summary',
    icon: <Users size={20} color="#10B981" />,
    hint: 'Consultation load and doctor workload',
  },
  {
    key: 'appointment-activity',
    name: 'Appointment Activity',
    icon: <Calendar size={20} color="#3B82F6" />,
    hint: 'Booking lifecycle and daily activity',
  },
  {
    key: 'ai-diagnostics',
    name: 'AI Symptom Analyzer Diagnostics',
    icon: <Brain size={20} color="#8B5CF6" />,
    hint: 'Analysis usage and specialist recommendations',
  },
];

const RANGE_OPTIONS: Array<{ key: RangeKey; label: string }> = [
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: '90d', label: 'Last 90 Days' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
];

const formatValue = (value: any) => {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  if (value instanceof Date) return value.toLocaleString();
  return String(value);
};

const ReportsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportKey>('appointment-activity');
  const [selectedRange, setSelectedRange] = useState<RangeKey>('30d');
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [exportingType, setExportingType] = useState<ExportFormat | null>(null);
  const [rangePickerVisible, setRangePickerVisible] = useState(false);

  const selectedReportMeta = useMemo(
    () => REPORT_TYPES.find(item => item.key === selectedReport) || REPORT_TYPES[0],
    [selectedReport]
  );

  const selectedRangeLabel = useMemo(
    () => RANGE_OPTIONS.find(item => item.key === selectedRange)?.label || 'Last 30 Days',
    [selectedRange]
  );

  const loadReport = async () => {
    if (!token) {
      setLoadingReport(false);
      Alert.alert('Authentication required', 'Please sign in as an admin to view reports.');
      return;
    }

    setLoadingReport(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/reports?reportType=${selectedReport}&range=${selectedRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load report');
      }

      setReportData(data.data as ReportResponse);
    } catch (error) {
      console.error('Load report error:', error);
      Alert.alert('Error', 'Unable to load report data from the server.');
      setReportData(null);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, [selectedReport, selectedRange, token]);

  const handleExport = async (format: ExportFormat) => {
    if (!token) {
      Alert.alert('Authentication required', 'Please sign in as an admin to export reports.');
      return;
    }

    setExportingType(format);
    try {
      const extension = format === 'PDF' ? 'pdf' : 'xlsx';
      const mimeType = format === 'PDF'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const downloadUrl = `${API_BASE_URL}/api/admin/reports/export?reportType=${selectedReport}&range=${selectedRange}&format=${format.toLowerCase()}`;
      const fileName = `medi-ai-${selectedReport}-${selectedRange}.${extension}`.replace(/[^a-z0-9._-]/gi, '-');
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const result = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType,
          dialogTitle: `${selectedReportMeta.name} (${selectedRangeLabel})`,
        });
      } else {
        Alert.alert('Export complete', `File saved to ${result.uri}`);
      }
    } catch (error) {
      console.error('Export report error:', error);
      Alert.alert('Export failed', 'Unable to export the selected report.');
    } finally {
      setExportingType(null);
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
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Reports & Logs</Text>
              <Text style={styles.headerSubtitle}>Backend-generated operational reports</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={() => void loadReport()}>
              <RefreshCw size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateSelectorRow}>
            <Clock size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.dateText}>Active Range: {selectedRangeLabel}</Text>
            <TouchableOpacity style={styles.changeRangeBtn} onPress={() => setRangePickerVisible(true)}>
              <Filter size={12} color="#FFF" />
              <Text style={styles.changeRangeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
          <Text style={styles.sectionHeading}>Select Report Category</Text>

          {REPORT_TYPES.map(item => {
            const isSelected = selectedReport === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.reportCard,
                  SHADOWS.light,
                  isSelected && styles.selectedReportCard,
                ]}
                onPress={() => setSelectedReport(item.key)}
              >
                <View style={styles.reportCardLeft}>
                  <View style={styles.iconWrap}>
                    {item.icon}
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={[styles.reportName, isSelected && styles.selectedReportName]}>
                      {item.name}
                    </Text>
                    <Text style={styles.reportCount}>{item.hint}</Text>
                  </View>
                </View>
                {isSelected ? (
                  <CheckCircle size={20} color={COLORS.primary} />
                ) : (
                  <ChevronRight size={18} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            );
          })}

          <Text style={styles.sectionHeading}>Report Preview</Text>
          <View style={[styles.exportCard, SHADOWS.light]}>
            <View style={styles.previewHeader}>
              <FileText size={18} color={COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.exportTargetTitle}>{reportData?.title || selectedReportMeta.name}</Text>
                <Text style={styles.exportTargetDesc}>
                  {reportData?.description || 'Loading live report data from the backend.'}
                </Text>
              </View>
            </View>

            <View style={styles.rangeMetaRow}>
              <Text style={styles.rangeMetaText}>Range: {reportData?.range.label || selectedRangeLabel}</Text>
              <Text style={styles.rangeMetaText}>Source: Admin API</Text>
            </View>

            <View style={styles.divider} />

            {loadingReport ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Compiling live report data...</Text>
              </View>
            ) : reportData ? (
              <View>
                <View style={styles.summaryGrid}>
                  {Object.entries(reportData.summary).map(([key, value]) => (
                    <View key={key} style={[styles.summaryPill, SHADOWS.light]}>
                      <Text style={styles.summaryPillValue}>{formatValue(value)}</Text>
                      <Text style={styles.summaryPillLabel}>{key}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.previewSectionTitle}>Recent Rows</Text>
                {reportData.rows.slice(0, 5).map((row, index) => (
                  <View key={`${selectedReport}-${index}`} style={styles.previewRow}>
                    <Text style={styles.previewRowIndex}>{index + 1}</Text>
                    <View style={styles.previewRowBody}>
                      {Object.entries(row).slice(0, 4).map(([key, value]) => (
                        <Text key={key} style={styles.previewRowText}>
                          {key}: {formatValue(value)}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}

                {reportData.rows.length === 0 ? (
                  <Text style={styles.emptyPreviewText}>No records were found for the selected range.</Text>
                ) : null}
              </View>
            ) : (
              <Text style={styles.emptyPreviewText}>No report data available.</Text>
            )}

            <View style={styles.divider} />

            {exportingType ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Exporting to {exportingType}...</Text>
              </View>
            ) : (
              <View style={styles.exportActionsRow}>
                <TouchableOpacity
                  style={[styles.exportBtn, styles.pdfBtn]}
                  onPress={() => void handleExport('PDF')}
                >
                  <Download size={18} color="#FFF" />
                  <Text style={styles.exportBtnText}>Download PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.exportBtn, styles.excelBtn]}
                  onPress={() => void handleExport('Excel')}
                >
                  <Download size={18} color="#FFF" />
                  <Text style={styles.exportBtnText}>Download Excel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      <AdminBottomNavBar />

      <Modal visible={rangePickerVisible} transparent animationType="fade" onRequestClose={() => setRangePickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            <Text style={styles.modalSubtitle}>The selected range updates the backend report query.</Text>

            {RANGE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.rangeOption,
                  selectedRange === option.key && styles.rangeOptionSelected,
                ]}
                onPress={() => {
                  setSelectedRange(option.key);
                  setRangePickerVisible(false);
                }}
              >
                <Text style={[
                  styles.rangeOptionText,
                  selectedRange === option.key && styles.rangeOptionTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setRangePickerVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
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
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    fontWeight: '600',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
  changeRangeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeRangeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '800',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 12,
    marginTop: 8,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  selectedReportCard: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  reportCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportInfo: {
    marginLeft: 14,
    flex: 1,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  selectedReportName: {
    color: COLORS.primary,
  },
  reportCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 3,
  },
  exportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEEBFF',
    marginTop: 8,
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  exportTargetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  exportTargetDesc: {
    fontSize: 12,
    color: COLORS.textMain,
    marginTop: 6,
    lineHeight: 18,
  },
  rangeMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  rangeMetaText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  loaderText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginTop: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryPill: {
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: '#FAFAFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  summaryPillValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textHeader,
  },
  summaryPillLabel: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  previewSectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  previewRowIndex: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '900',
    color: COLORS.primary,
    overflow: 'hidden',
  },
  previewRowBody: {
    flex: 1,
    gap: 4,
  },
  previewRowText: {
    fontSize: 11,
    color: COLORS.textMain,
    lineHeight: 16,
  },
  emptyPreviewText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
  },
  exportActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  pdfBtn: {
    backgroundColor: '#EF4444',
  },
  excelBtn: {
    backgroundColor: '#10B981',
  },
  exportBtnText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '800',
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
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textHeader,
  },
  modalSubtitle: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },
  rangeOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  rangeOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  rangeOptionText: {
    color: COLORS.textHeader,
    fontWeight: '700',
  },
  rangeOptionTextSelected: {
    color: COLORS.primary,
  },
  modalCloseBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginTop: 4,
  },
  modalCloseText: {
    fontWeight: '800',
    color: COLORS.textHeader,
  },
});

export default ReportsScreen;
