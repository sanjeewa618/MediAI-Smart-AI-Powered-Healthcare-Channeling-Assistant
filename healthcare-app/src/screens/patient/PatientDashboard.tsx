import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { Search, Bell, Calendar, Bot, Clipboard, Microscope, User as UserIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type PatientDashboardProp = StackNavigationProp<RootStackParamList, 'PatientDashboard'>;

const PatientDashboard = () => {
  const navigation = useNavigation<PatientDashboardProp>();
  const quickActions = [
    { id: '1', title: 'Find Doctors', icon: UserIcon, color: '#4ADE80', target: 'FindDoctors' },
    { id: '2', title: 'Book Now', icon: Calendar, color: '#60A5FA', target: 'FindDoctors' },
    { id: '3', title: 'AI Assistant', icon: Bot, color: '#F87171', target: 'AIHealthAssistant' },
    { id: '4', title: 'My Records', icon: Clipboard, color: '#FB923C' },
    { id: '5', title: 'Lab Results', icon: Microscope, color: '#A78BFA' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, John 👋</Text>
            <Text style={styles.subGreeting}>How are you feeling today?</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell size={24} color={COLORS.textHeader} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* AI Health Banner */}
        <LinearGradient
          colors={COLORS.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.banner, SHADOWS.medium]}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Check your health with AI</Text>
            <Text style={styles.bannerText}>Describe your symptoms and get instant insights.</Text>
            <TouchableOpacity 
              style={styles.bannerBtn}
              onPress={() => navigation.navigate('AIHealthAssistant')}
            >
              <Text style={styles.bannerBtnText}>Check Now</Text>
            </TouchableOpacity>
          </View>
          <Image 
            source={{ uri: 'https://img.icons8.com/bubbles/200/000000/doctor.png' }} 
            style={styles.bannerImage} 
          />
        </LinearGradient>

        {/* Search Bar */}
        <View style={[styles.searchContainer, SHADOWS.small]}>
          <Search size={20} color={COLORS.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search for doctors, labs...</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsList}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity 
                  key={action.id} 
                  style={styles.actionItem}
                  onPress={() => action.target && navigation.navigate(action.target as any)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                    <Icon size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
          </View>
          
          <View style={[styles.appointmentCard, SHADOWS.small]}>
            <View style={styles.docInfo}>
              <Image 
                source={{ uri: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png' }} 
                style={styles.docAvatar} 
              />
              <View>
                <Text style={styles.docName}>Dr. Saman Perera</Text>
                <Text style={styles.docSpecialty}>Cardiologist • General Hospital</Text>
              </View>
            </View>
            <View style={styles.appoDetails}>
              <View style={styles.detailItem}>
                <Calendar size={16} color={COLORS.primary} />
                <Text style={styles.detailText}>Oct 12, 2023</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.timeText}>09:30 AM</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Basic Bottom Tab Placeholder */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><UserIcon size={24} color={COLORS.primary} /><Text style={[styles.navText, {color: COLORS.primary}]}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Calendar size={24} color={COLORS.textSecondary} /><Text style={styles.navText}>Schedule</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Microscope size={24} color={COLORS.textSecondary} /><Text style={styles.navText}>Labs</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><UserIcon size={24} color={COLORS.textSecondary} /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: '800', color: COLORS.textHeader },
  subGreeting: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  notificationBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.error, borderWidth: 2, borderColor: COLORS.white },
  banner: { borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  bannerContent: { flex: 1, zIndex: 1 },
  bannerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  bannerText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, marginBottom: 16, lineHeight: 18 },
  bannerBtn: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
  bannerBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  bannerImage: { width: 100, height: 100, position: 'absolute', right: -10, bottom: -10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 12, borderRadius: 16, marginTop: 24, marginBottom: 24 },
  searchPlaceholder: { marginLeft: 12, color: COLORS.textSecondary, fontSize: 14 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textHeader },
  seeAll: { color: COLORS.primary, fontWeight: '600' },
  actionsList: { flexDirection: 'row' },
  actionItem: { alignItems: 'center', marginRight: 20 },
  actionIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, color: COLORS.textHeader, fontWeight: '600' },
  appointmentCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16 },
  docInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  docAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  docName: { fontSize: 16, fontWeight: '700', color: COLORS.textHeader },
  docSpecialty: { fontSize: 12, color: COLORS.textSecondary },
  appoDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { marginLeft: 8, color: COLORS.textHeader, fontWeight: '600', fontSize: 13 },
  timeText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: COLORS.white, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingBottom: 20 },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, marginTop: 4, fontWeight: '600', color: COLORS.textSecondary }
});

export default PatientDashboard;
