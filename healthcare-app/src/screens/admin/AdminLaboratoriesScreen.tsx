import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  ArrowLeft, 
  FlaskConical, 
  CheckCircle, 
  Activity, 
  Settings, 
  Clock, 
  ChevronRight,
  TrendingUp
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const INITIAL_LABS = [
  { id: 'L01', name: 'Biochemistry Lab (Lab 01)', location: '1st Floor, Wing A', activeTests: 45, capacity: '80%', status: 'Active' },
  { id: 'L02', name: 'Pathology & Hematology (Lab 02)', location: '2nd Floor, Wing B', activeTests: 60, capacity: '95%', status: 'Active' },
  { id: 'L03', name: 'Microbiology & Immunology', location: '1st Floor, Wing C', activeTests: 18, capacity: '30%', status: 'Active' },
  { id: 'L04', name: 'PCR & Molecular Diagnostics', location: 'Ground Floor, Wing A', activeTests: 0, capacity: '0%', status: 'Maintenance' },
];

const AdminLaboratoriesScreen = () => {
  const navigation = useNavigation<any>();
  const [labs, setLabs] = useState(INITIAL_LABS);

  const handleToggleMaintenance = (id: string) => {
    setLabs(prev => prev.map(lab => {
      if (lab.id === id) {
        const newStatus = lab.status === 'Active' ? 'Maintenance' : 'Active';
        Alert.alert('Status Updated', `${lab.name} is now ${newStatus}`);
        return { ...lab, status: newStatus };
      }
      return lab;
    }));
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
            <Text style={styles.headerTitle}>Hospital Laboratories</Text>
            <View style={{ width: 44 }} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
          {/* Overview summary */}
          <View style={[styles.summaryCard, SHADOWS.light]}>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTitle}>Labs Capacity Load</Text>
              <Text style={styles.summaryDesc}>123 Total diagnostic tests scheduled for processing today.</Text>
            </View>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.summaryBadge}>
              <TrendingUp size={20} color="#FFF" />
            </LinearGradient>
          </View>

          <Text style={styles.sectionHeading}>Laboratory Rooms</Text>
          {labs.map((item) => (
            <View key={item.id} style={[styles.labCard, SHADOWS.light]}>
              <View style={styles.labInfoRow}>
                <View style={[styles.iconWrap, { backgroundColor: item.status === 'Active' ? '#ECFDF5' : '#FEF2F2' }]}>
                  <FlaskConical size={24} color={item.status === 'Active' ? '#10B981' : '#EF4444'} />
                </View>
                <View style={styles.labDetails}>
                  <Text style={styles.labName}>{item.name}</Text>
                  <Text style={styles.labLocation}>{item.location}</Text>
                  <Text style={styles.labLoad}>
                    Load: {item.activeTests} tests ({item.capacity} capacity)
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#ECFDF5' : '#FEF2F2' }]}>
                  <Text style={[styles.statusText, { color: item.status === 'Active' ? '#10B981' : '#EF4444' }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  style={[styles.actionBtn, { borderColor: COLORS.primary }]}
                  onPress={() => Alert.alert('Lab Slots', 'Manage slots feature coming soon.')}
                >
                  <Clock size={14} color={COLORS.primary} />
                  <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Manage Slots</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, { borderColor: item.status === 'Active' ? '#EF4444' : '#10B981' }]}
                  onPress={() => handleToggleMaintenance(item.id)}
                >
                  <Settings size={14} color={item.status === 'Active' ? '#EF4444' : '#10B981'} />
                  <Text style={[styles.actionBtnText, { color: item.status === 'Active' ? '#EF4444' : '#10B981' }]}>
                    {item.status === 'Active' ? 'Set Maintenance' : 'Set Active'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <View style={{ height: 40 }} />
        </ScrollView>
        <AdminBottomNavBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  wrapper: {
    flex: 1,
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EEEBFF',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  summaryInfo: {
    flex: 1,
    paddingRight: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  summaryDesc: {
    fontSize: 12,
    color: COLORS.textMain,
    marginTop: 4,
    lineHeight: 16,
  },
  summaryBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 12,
  },
  labCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
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
  labInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labDetails: {
    flex: 1,
    marginLeft: 14,
  },
  labName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  labLocation: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  labLoad: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: '700',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default AdminLaboratoriesScreen;
