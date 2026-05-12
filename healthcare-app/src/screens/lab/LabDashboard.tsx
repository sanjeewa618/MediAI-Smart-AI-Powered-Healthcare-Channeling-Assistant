import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { Microscope, FileText, Bell, Plus, CheckCircle, Clock } from 'lucide-react-native';

const LabDashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Laboratory Portal</Text>
          <TouchableOpacity style={styles.bellBtn}><Bell size={24} color={COLORS.textHeader} /></TouchableOpacity>
        </View>

        <View style={styles.statsPanel}>
          <View style={[styles.mainStat, SHADOWS.medium]}>
            <Text style={styles.mainStatTitle}>Pending Tests</Text>
            <Text style={styles.mainStatValue}>24</Text>
            <TouchableOpacity style={styles.addBtn}><Plus size={20} color={COLORS.white} /><Text style={styles.addBtnText}>New Result</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentGrid}>
          <View style={[styles.gridItem, SHADOWS.small]}>
            <CheckCircle size={24} color="#4ADE80" />
            <Text style={styles.gridVal}>142</Text>
            <Text style={styles.gridLab}>Completed</Text>
          </View>
          <View style={[styles.gridItem, SHADOWS.small]}>
            <Clock size={24} color="#FB923C" />
            <Text style={styles.gridVal}>08</Text>
            <Text style={styles.gridLab}>Urgent</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recently Submitted Reports</Text>
        {[1, 2].map((i) => (
          <View key={i} style={[styles.reportCard, SHADOWS.small]}>
            <View style={styles.reportIcon}><FileText size={24} color={COLORS.primary} /></View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>Full Blood Count - Lab#{1024 + i}</Text>
              <Text style={styles.reportPatient}>Patient: Sarah Connor</Text>
              <Text style={styles.reportDate}>Submitted 2 hours ago</Text>
            </View>
            <View style={styles.statusDone}><Text style={styles.statusDoneText}>Sent</Text></View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textHeader },
  bellBtn: { padding: 4 },
  statsPanel: { marginBottom: 20 },
  mainStat: { backgroundColor: COLORS.primary, borderRadius: 24, padding: 24, alignItems: 'center' },
  mainStatTitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 16, fontWeight: '600' },
  mainStatValue: { color: COLORS.white, fontSize: 48, fontWeight: '800', marginVertical: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: COLORS.white, fontWeight: '700', marginLeft: 8 },
  recentGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  gridItem: { backgroundColor: COLORS.white, width: '48%', padding: 20, borderRadius: 20, alignItems: 'center' },
  gridVal: { fontSize: 20, fontWeight: '800', color: COLORS.textHeader, marginTop: 10 },
  gridLab: { color: COLORS.textSecondary, fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textHeader, marginBottom: 16 },
  reportCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reportIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  reportInfo: { flex: 1 },
  reportTitle: { fontWeight: '700', color: COLORS.textHeader, fontSize: 14 },
  reportPatient: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  reportDate: { fontSize: 11, color: COLORS.primary, marginTop: 4, fontWeight: '600' },
  statusDone: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusDoneText: { color: '#166534', fontSize: 11, fontWeight: '700' }
});

export default LabDashboard;
