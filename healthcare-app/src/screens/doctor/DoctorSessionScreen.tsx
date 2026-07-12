import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Play, Clock } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../theme/theme';

type DoctorSessionRouteProp = RouteProp<RootStackParamList, 'DoctorSession'>;

const DoctorSessionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<DoctorSessionRouteProp>();
  const { slot, appointments = [] } = route.params || {};

  const [sessionStarted, setSessionStarted] = useState(false);

  const handleStartSession = () => {
    if (sessionStarted) {
      Alert.alert('End Session', 'Are you sure you want to end this session?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End', onPress: () => setSessionStarted(false), style: 'destructive' }
      ]);
    } else {
      setSessionStarted(true);
    }
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
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session Control Card */}
        <View style={styles.sessionControlCard}>
          <View style={styles.sessionControlInfo}>
            <Text style={styles.sessionControlTitle}>
              {sessionStarted ? 'Session is Active' : 'Ready to Start?'}
            </Text>
            <Text style={styles.sessionControlSub}>
              {appointments.length} Patient{appointments.length !== 1 ? 's' : ''} in queue
            </Text>
          </View>
          
          <TouchableOpacity style={[styles.startBtn, sessionStarted && styles.endBtn]} onPress={handleStartSession}>
            {sessionStarted ? (
              <Text style={[styles.startBtnText, { color: '#DC2626' }]}>End Session</Text>
            ) : (
              <LinearGradient colors={['#10B981', '#059669']} style={styles.startBtnGrad}>
                <Play size={18} color="#FFF" fill="#FFF" />
                <Text style={styles.startBtnText}>START</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Patient Queue</Text>
        
        {appointments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Clock size={40} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No appointments yet</Text>
            <Text style={styles.emptySub}>Patients booking this slot will appear here.</Text>
          </View>
        ) : (
          appointments.map((app: any, index: number) => {
            const isNext = sessionStarted && index === 0;
            return (
              <View key={app._id} style={[styles.patientCard, isNext && styles.patientCardActive]}>
                <View style={styles.queueCircle}>
                  <Text style={styles.queueText}>{app.queueNumber}</Text>
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{app.patient?.name || 'Unknown Patient'}</Text>
                  <Text style={styles.patientDetails}>Status: {app.status}</Text>
                </View>
                {isNext && (
                  <TouchableOpacity style={styles.callBtn}>
                    <Text style={styles.callBtnText}>Call In</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
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
    borderColor: '#F3F4F6'
  },
  patientCardActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: '#F5F3FF'
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
  patientInfo: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  patientDetails: { fontSize: 13, color: '#6B7280', marginTop: 2, textTransform: 'capitalize' },
  callBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  callBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#4B5563', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
});

export default DoctorSessionScreen;
