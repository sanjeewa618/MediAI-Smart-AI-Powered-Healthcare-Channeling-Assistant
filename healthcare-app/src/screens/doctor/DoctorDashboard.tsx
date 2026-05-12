import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { Users, Calendar, Clipboard, Bell, LogOut } from 'lucide-react-native';

const DoctorDashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Doctor Portal</Text>
          <TouchableOpacity><LogOut size={24} color={COLORS.error} /></TouchableOpacity>
        </View>

        <View style={[styles.profileCard, SHADOWS.medium]}>
          <Image source={{ uri: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png' }} style={styles.avatar} />
          <View>
            <Text style={styles.name}>Dr. Saman Perera</Text>
            <Text style={styles.specialty}>Senior Cardiologist</Text>
            <View style={styles.statusBadge}><Text style={styles.statusText}>Active</Text></View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, SHADOWS.small]}>
            <Users size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>120</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={[styles.statBox, SHADOWS.small]}>
            <Calendar size={24} color="#4ADE80" />
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.appoCard, SHADOWS.small]}>
            <View style={styles.patientInfo}>
              <View style={styles.placeholderAvatar}><Text>P{i}</Text></View>
              <View>
                <Text style={styles.patientName}>Patient Name {i}</Text>
                <Text style={styles.appoTime}>09:00 AM - Heart Checkup</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewBtn}><Text style={styles.viewBtnText}>Details</Text></TouchableOpacity>
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
  profileCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginRight: 20 },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.textHeader },
  specialty: { color: COLORS.textSecondary, marginBottom: 8 },
  statusBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  statusText: { color: '#166534', fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { backgroundColor: COLORS.white, width: '48%', padding: 20, borderRadius: 20, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: COLORS.textHeader, marginVertical: 4 },
  statLabel: { color: COLORS.textSecondary, fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textHeader, marginBottom: 16 },
  appoCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  patientInfo: { flexDirection: 'row', alignItems: 'center' },
  placeholderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  patientName: { fontWeight: '700', color: COLORS.textHeader },
  appoTime: { fontSize: 12, color: COLORS.textSecondary },
  viewBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  viewBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '600' }
});

export default DoctorDashboard;
