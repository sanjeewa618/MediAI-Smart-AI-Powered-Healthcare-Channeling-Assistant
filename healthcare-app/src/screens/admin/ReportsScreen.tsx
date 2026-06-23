import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Brain, 
  ChevronRight,
  CheckCircle,
  Clock,
  Folder,
  X,
  Share2
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const ReportsScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedReport, setSelectedReport] = useState<string>('Appointment Activity');
  const [exportingType, setExportingType] = useState<'PDF' | 'Excel' | null>(null);
  const [dateRange, setDateRange] = useState('June 2026');

  const reportTypes = [
    { name: 'Patient Registration Summary', icon: <Users size={20} color={COLORS.primary} />, count: '1,250 patient profiles' },
    { name: 'Doctor Consultation Summary', icon: <Users size={20} color="#10B981" />, count: '45 doctor records' },
    { name: 'Appointment Activity', icon: <Calendar size={20} color="#3B82F6" />, count: 'Daily/Weekly/Monthly charts' },
    { name: 'AI Symptom Analyzer Diagnostics', icon: <Brain size={20} color="#8B5CF6" />, count: 'AI prompt counts & accuracy' },
  ];

  const handleExport = (format: 'PDF' | 'Excel') => {
    setExportingType(format);
    setTimeout(() => {
      setExportingType(null);
      Alert.alert(
        'Export Complete',
        `${selectedReport} Report has been successfully exported as ${format}.`,
        [{ text: 'OK' }]
      );
    }, 2500);
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
            <Text style={styles.headerTitle}>Reports & Logs</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Date Selector mock */}
          <View style={styles.dateSelectorRow}>
            <Clock size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.dateText}>Active Range: {dateRange}</Text>
            <TouchableOpacity style={styles.changeRangeBtn} onPress={() => Alert.alert('Select Period', 'Range selection coming soon.')}>
              <Text style={styles.changeRangeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>

          <Text style={styles.sectionHeading}>Select Report Category</Text>
          
          {reportTypes.map((item, index) => {
            const isSelected = selectedReport === item.name;
            return (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.reportCard, 
                  SHADOWS.light,
                  isSelected && styles.selectedReportCard
                ]}
                onPress={() => setSelectedReport(item.name)}
              >
                <View style={styles.reportCardLeft}>
                  <View style={styles.iconWrap}>
                    {item.icon}
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={[styles.reportName, isSelected && styles.selectedReportName]}>
                      {item.name}
                    </Text>
                    <Text style={styles.reportCount}>{item.count}</Text>
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

          {/* Export Panel */}
          <Text style={styles.sectionHeading}>Export Configuration</Text>
          <View style={[styles.exportCard, SHADOWS.light]}>
            <Text style={styles.exportTargetTitle}>Generating: {selectedReport} Report</Text>
            <Text style={styles.exportTargetDesc}>Exports aggregate metadata including timestamps, diagnostic logs, and activity events.</Text>
            
            <View style={styles.divider} />
            
            {exportingType ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Compiling database to {exportingType}...</Text>
              </View>
            ) : (
              <View style={styles.exportActionsRow}>
                <TouchableOpacity 
                  style={[styles.exportBtn, styles.pdfBtn]}
                  onPress={() => handleExport('PDF')}
                >
                  <Download size={18} color="#FFF" />
                  <Text style={styles.exportBtnText}>Download PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.exportBtn, styles.excelBtn]}
                  onPress={() => handleExport('Excel')}
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
    paddingBottom: 20
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16
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
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
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
    marginLeft: 6
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
    paddingBottom: 40
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
});

export default ReportsScreen;
