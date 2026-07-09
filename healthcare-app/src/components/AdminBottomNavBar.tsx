import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, Users, Stethoscope, List, FlaskConical, FileText, Calendar } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../theme/theme';

const AdminBottomNavBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentRouteName = route?.name;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, SHADOWS.medium, { paddingBottom: insets.bottom + 6 }]}>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AdminDashboard')}>
        <Home size={20} color={currentRouteName === 'AdminDashboard' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'AdminDashboard' ? COLORS.primary : '#9CA3AF' }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AdminUserManagement')}>
        <Users size={20} color={currentRouteName === 'AdminUserManagement' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'AdminUserManagement' ? COLORS.primary : '#9CA3AF' }]}>Users</Text>
      </TouchableOpacity>


      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AdminAppointments')}>
        <Calendar size={20} color={currentRouteName === 'AdminAppointments' ? COLORS.primary : '#9CA3AF'} />
        <Text 
          numberOfLines={1} 
          adjustsFontSizeToFit 
          style={[styles.label, { color: currentRouteName === 'AdminAppointments' ? COLORS.primary : '#9CA3AF' }]}
        >
          Appointments
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AdminRequests')}>
        <List size={20} color={currentRouteName === 'AdminRequests' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'AdminRequests' ? COLORS.primary : '#9CA3AF' }]}>Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AdminLaboratories')}>
        <FlaskConical size={20} color={currentRouteName === 'AdminLaboratories' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'AdminLaboratories' ? COLORS.primary : '#9CA3AF' }]}>Labs</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AdminReports')}>
        <FileText size={20} color={currentRouteName === 'AdminReports' ? COLORS.primary : '#9CA3AF'} />
        <Text style={[styles.label, { color: currentRouteName === 'AdminReports' ? COLORS.primary : '#9CA3AF' }]}>Reports</Text>
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
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '700'
  }
});

export default AdminBottomNavBar;
