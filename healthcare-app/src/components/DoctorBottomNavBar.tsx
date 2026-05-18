import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, Calendar, Clock, History, FileText, User } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../theme/theme';

const TABS = [
  { name: 'DoctorDashboard', label: 'Home', icon: Home },
  { name: 'DoctorAppointments', label: 'Appointments', icon: Calendar },
  { name: 'DoctorScheduling', label: 'Scheduling', icon: Clock },
  { name: 'DoctorHistory', label: 'History', icon: History },
  { name: 'DoctorReports', label: 'Reports', icon: FileText },
  { name: 'DoctorProfile', label: 'Profile', icon: User },
];

const DoctorBottomNavBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentRouteName = route?.name;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, SHADOWS.medium, { paddingBottom: insets.bottom }]}>
      {TABS.map((tab) => {
        const isActive = currentRouteName === tab.name;
        const IconComp = tab.icon;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.item}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.7}
          >
            <IconComp size={22} color={isActive ? COLORS.primary : '#9CA3AF'} />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 100,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    marginTop: 1,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '600',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default DoctorBottomNavBar;
