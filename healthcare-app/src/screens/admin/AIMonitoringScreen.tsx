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
  Brain, 
  RotateCw, 
  Power, 
  Activity, 
  Clock, 
  AlertCircle,  
  Cpu,
  BrainCircuit,
  MessageSquare,
  Thermometer,
  CheckCircle,
  X,
  MessageSquareCode
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const INITIAL_AI_LOGS = [
  { id: 'AI01', time: '11:05 AM', query: 'I have severe headache, neck stiffness, and light sensitivity since morning.', response: 'Potential symptoms of Migraine or Meningitis. Recommendation: Urgent consultation with a Neurologist.', status: 'Success', latency: '1.2s' },
  { id: 'AI02', time: '10:45 AM', query: 'My child has a dry cough, mild fever, and runny nose for 2 days.', response: 'Symptoms indicate Pediatric Common Cold / viral infection. Recommendation: Monitor hydration, consult Pediatrician if fever exceeds 102°F.', status: 'Success', latency: '1.5s' },
  { id: 'AI03', time: '09:12 AM', query: 'Sudden chest discomfort radiating to left arm with sweating.', response: 'High risk of acute cardiac event. Recommendation: IMMEDIATE emergency room visit.', status: 'Success', latency: '0.9s' },
  { id: 'AI04', time: '08:30 AM', query: 'Skin rash with itchy red bumps after eating peanuts.', response: 'Suspected allergic reaction (Urticaria). Recommendation: Take antihistamine and monitor for breathing difficulties.', status: 'Success', latency: '1.8s' },
];

const AIMonitoringScreen = () => {
  const navigation = useNavigation<any>();
  const [logs, setLogs] = useState(INITIAL_AI_LOGS);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [isRestarting, setIsRestarting] = useState(false);
  
  // Log Detail Modal
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRestartService = () => {
    setIsRestarting(true);
    setTimeout(() => {
      setIsRestarting(false);
      Alert.alert('AI Service Restarted', 'OpenAI & Gemini gateway instances re-initialized successfully.');
    }, 2000);
  };

  const handleToggleAi = () => {
    const nextState = !isAiEnabled;
    setIsAiEnabled(nextState);
    Alert.alert(
      nextState ? 'AI Service Enabled' : 'AI Service Disabled',
      nextState 
        ? 'Symptom analyzer module is now live for all patients.' 
        : 'Symptom analyzer module is temporarily offline.'
    );
  };

  const openLogDetail = (log: any) => {
    setSelectedLog(log);
    setModalVisible(true);
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
            <Text style={styles.headerTitle}>AI Monitoring Center</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* AI Health Summary Header */}
          <View style={styles.aiHeaderStatus}>
            <Brain size={28} color="#FFF" />
            <View style={styles.aiHeaderMeta}>
              <Text style={styles.aiStatusTitle}>AI Module Status</Text>
              <Text style={styles.aiStatusSub}>
                Model Gateway: {isAiEnabled ? 'ONLINE (Gemini 1.5 Pro / GPT-4o)' : 'OFFLINE'}
              </Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: isAiEnabled ? '#10B981' : '#EF4444' }]} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, SHADOWS.light]}>
            <Activity size={18} color={COLORS.primary} />
            <Text style={styles.statVal}>352</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>
          <View style={[styles.statBox, SHADOWS.light]}>
            <CheckCircle size={18} color="#10B981" />
            <Text style={styles.statVal}>99.1%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={[styles.statBox, SHADOWS.light]}>
            <Clock size={18} color="#3B82F6" />
            <Text style={styles.statVal}>1.35s</Text>
            <Text style={styles.statLabel}>Avg Latency</Text>
          </View>
        </View>

        {/* Control Service Buttons */}
        <Text style={styles.sectionHeading}>AI Module Operations</Text>
        <View style={[styles.operationsCard, SHADOWS.light]}>
          <TouchableOpacity 
            style={[styles.opBtn, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary }]}
            onPress={handleRestartService}
            disabled={isRestarting}
          >
            {isRestarting ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <RotateCw size={18} color={COLORS.primary} />
                <Text style={[styles.opBtnText, { color: COLORS.primary }]}>Restart AI Service</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.opBtn, { backgroundColor: isAiEnabled ? '#FEE2E2' : '#ECFDF5', borderColor: isAiEnabled ? '#EF4444' : '#10B981' }]}
            onPress={handleToggleAi}
          >
            <Power size={18} color={isAiEnabled ? '#EF4444' : '#10B981'} />
            <Text style={[styles.opBtnText, { color: isAiEnabled ? '#EF4444' : '#10B981' }]}>
              {isAiEnabled ? 'Disable AI Module' : 'Enable AI Module'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Query Logs */}
        <Text style={styles.sectionHeading}>Recent Diagnostic Queries</Text>
        {logs.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.logCard, SHADOWS.light]}
            activeOpacity={0.85}
            onPress={() => openLogDetail(item)}
          >
            <View style={styles.logCardHeader}>
              <View style={styles.logCardHeaderLeft}>
                <MessageSquareCode size={16} color={COLORS.primary} />
                <Text style={styles.logId}>{item.id}</Text>
              </View>
              <Text style={styles.logTime}>{item.time} • {item.latency}</Text>
            </View>
            <Text style={styles.logQueryPreview} numberOfLines={2}>
              "{item.query}"
            </Text>
            <View style={styles.divider} />
            <Text style={styles.logResponsePreview} numberOfLines={2}>
              Response: {item.response}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
      </View>
      <AdminBottomNavBar />

      {/* Log Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, SHADOWS.medium]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Diagnosis Audit</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={COLORS.textHeader} />
              </TouchableOpacity>
            </View>

            {selectedLog && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>Log ID: {selectedLog.id}</Text>
                  <Text style={styles.metaText}>Latency: {selectedLog.latency}</Text>
                </View>

                <Text style={styles.bodyLabel}>Patient Symptom Input:</Text>
                <View style={styles.textContainer}>
                  <Text style={styles.bodyText}>"{selectedLog.query}"</Text>
                </View>

                <Text style={styles.bodyLabel}>AI Clinical Feedback:</Text>
                <View style={[styles.textContainer, { backgroundColor: '#F5F3FF' }]}>
                  <Text style={[styles.bodyText, { color: COLORS.primary }]}>
                    {selectedLog.response}
                  </Text>
                </View>

                <View style={styles.complianceRow}>
                  <CheckCircle size={16} color="#10B981" />
                  <Text style={styles.complianceText}>Compliant with medical terminology guidelines.</Text>
                </View>
              </ScrollView>
            )}
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
    paddingBottom: 24
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
  aiHeaderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 14
  },
  aiHeaderMeta: {
    flex: 1,
  },
  aiStatusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  aiStatusSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEBFF',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textHeader,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 12,
  },
  operationsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEEBFF',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  opBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    gap: 6,
  },
  opBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  logCard: {
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
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logId: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  logTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  logQueryPreview: {
    fontSize: 13,
    color: COLORS.textMain,
    lineHeight: 18,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  logResponsePreview: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  // Modal Detail Styles
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textHeader,
  },
  modalBody: {
    marginTop: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  bodyLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 6,
  },
  textContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 13,
    color: COLORS.textMain,
    lineHeight: 18,
  },
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  complianceText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
});

export default AIMonitoringScreen;
