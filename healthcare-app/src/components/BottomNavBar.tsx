import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, Calendar, Heart, FileText, User, Clock } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../theme/theme';

const BottomNavBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentRouteName = route?.name;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, SHADOWS.medium, { paddingBottom: insets.bottom + 12 }]}>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('PatientDashboard')}>
        <Home size={22} color={currentRouteName === 'PatientDashboard' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'PatientDashboard' ? COLORS.primary : '#9CA3AF' }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('PatientAppointments')}>
        <Calendar size={22} color={currentRouteName === 'PatientAppointments' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'PatientAppointments' ? COLORS.primary : '#9CA3AF' }]}>Appointments</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AIHealthAssistant')}>
        <Heart size={22} color={currentRouteName === 'AIHealthAssistant' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'AIHealthAssistant' ? COLORS.primary : '#9CA3AF' }]}>AI Health</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AvailabilitySelection')}>
        <Clock size={22} color={currentRouteName === 'AvailabilitySelection' || currentRouteName === 'DoctorAvailability' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'AvailabilitySelection' || currentRouteName === 'DoctorAvailability' ? COLORS.primary : '#9CA3AF' }]}>Availability</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Reports')}>
        <FileText size={22} color={currentRouteName === 'Reports' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'Reports' ? COLORS.primary : '#9CA3AF' }]}>Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('PatientProfile')}>
        <User size={22} color={currentRouteName === 'PatientProfile' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'PatientProfile' ? COLORS.primary : '#9CA3AF' }]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center'
  }
});

export default BottomNavBar;
