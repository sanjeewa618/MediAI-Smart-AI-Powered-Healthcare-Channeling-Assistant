import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, CalendarCheck, Clock, FileText, User } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

const NurseBottomNavBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentRouteName = route?.name;
  const insets = useSafeAreaInsets();
  const { role } = useAuth();

  if (role !== 'nurse' && role !== 'lab') {
    return null;
  }

  return (
    <View style={[styles.container, SHADOWS.medium, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('LabDashboard')}>
        <Home size={22} color={currentRouteName === 'LabDashboard' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'LabDashboard' ? COLORS.primary : '#9CA3AF' }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('LabAppointments')}>
        <CalendarCheck size={22} color={currentRouteName === 'LabAppointments' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'LabAppointments' ? COLORS.primary : '#9CA3AF' }]}>Appointments</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('LabScheduling')}>
        <Clock size={22} color={currentRouteName === 'LabScheduling' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'LabScheduling' ? COLORS.primary : '#9CA3AF' }]}>Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => alert('Reports screen for nurses is under development.')}>
        <FileText size={22} color={'#9CA3AF'} />
        <Text style={styles.label}>Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => alert('Profile screen for nurses is under development.')}>
        <User size={22} color={'#9CA3AF'} />
        <Text style={styles.label}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '600'
  }
});

export default NurseBottomNavBar;