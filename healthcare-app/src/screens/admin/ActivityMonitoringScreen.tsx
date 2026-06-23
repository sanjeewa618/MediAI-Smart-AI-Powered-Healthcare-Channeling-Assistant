import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Platform,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  ArrowLeft, 
  Search, 
  LogIn, 
  Calendar, 
  Brain, 
  CreditCard, 
  AlertOctagon, 
  User,
  Clock,
  Settings,
  FileText
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const MOCK_LOGS = [
  { id: 'L001', time: '10:30 AM', user: 'Patient: Dilshan Silva', activity: 'Booked Appointment with Dr. Saman Perera', type: 'Appointment' },
  { id: 'L002', time: '10:34 AM', user: 'Doctor: Dr. Saman Perera', activity: 'Updated weekly schedule timings', type: 'Doctor' },
  { id: 'L003', time: '10:45 AM', user: 'Patient: Nisansala Perera', activity: 'Symptom Analyzer requested: headache, fever', type: 'AI' },
  { id: 'L004', time: '10:46 AM', user: 'AI System', activity: 'Symptom Analysis completed: recommended general practitioner', type: 'AI' },
  { id: 'L005', time: '10:55 AM', user: 'Patient: Dilshan Silva', activity: 'Paid LKR 2,500 consultation fee via Card', type: 'Payment' },
  { id: 'L006', time: '11:00 AM', user: 'Nurse: Nurse Anula', activity: 'Logged into dashboard', type: 'Login' },
  { id: 'L007', time: '11:15 AM', user: 'System Guard', activity: 'Failed login attempt from IP 192.168.1.105', type: 'Error' },
  { id: 'L008', time: '11:20 AM', user: 'Doctor: Dr. K. Liyanage', activity: 'Created patient prescription report', type: 'Doctor' },
  { id: 'L009', time: '11:32 AM', user: 'AI System', activity: 'API key limit threshold warning (85% utilization)', type: 'Error' },
];

const ActivityMonitoringScreen = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const filterTypes = ['All', 'Login', 'Appointment', 'Doctor', 'AI', 'Payment', 'Error'];

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            log.activity.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'All' ? true : log.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Login':
        return <LogIn size={18} color="#3B82F6" />;
      case 'Appointment':
        return <Calendar size={18} color={COLORS.primary} />;
      case 'Doctor':
        return <User size={18} color="#8B5CF6" />;
      case 'AI':
        return <Brain size={18} color="#10B981" />;
      case 'Payment':
        return <CreditCard size={18} color="#059669" />;
      case 'Error':
        return <AlertOctagon size={18} color="#EF4444" />;
      default:
        return <Clock size={18} color="#6B7280" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Login': return { bg: '#EFF6FF', text: '#3B82F6' };
      case 'Appointment': return { bg: '#F3E8FF', text: COLORS.primary };
      case 'Doctor': return { bg: '#F5F3FF', text: '#8B5CF6' };
      case 'AI': return { bg: '#ECFDF5', text: '#10B981' };
      case 'Payment': return { bg: '#E6F4EA', text: '#059669' };
      case 'Error': return { bg: '#FEF2F2', text: '#EF4444' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
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
          <Text style={styles.headerTitle}>Activity Monitoring</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color="#9CA3AF" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search user name or activity..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Horizontal filter options */}
      <View style={{ backgroundColor: COLORS.white }}>
        <FlatList 
          data={filterTypes}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => {
            const isSelected = selectedType === item;
            return (
              <TouchableOpacity 
                style={[styles.filterPill, isSelected && styles.activeFilterPill]}
                onPress={() => setSelectedType(item)}
              >
                <Text style={[styles.filterPillText, isSelected && styles.activeFilterPillText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Log Feed */}
      <FlatList 
        data={filteredLogs}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.logList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const typeColors = getTypeColor(item.type);
          return (
            <View style={[styles.logCard, SHADOWS.light]}>
              <View style={styles.logHeader}>
                <View style={[styles.iconWrap, { backgroundColor: typeColors.bg }]}>
                  {getActivityIcon(item.type)}
                </View>
                <View style={styles.logMeta}>
                  <Text style={styles.logUser}>{item.user}</Text>
                  <Text style={styles.logTime}>{item.time}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: typeColors.bg }]}>
                  <Text style={[styles.typeText, { color: typeColors.text }]}>{item.type}</Text>
                </View>
              </View>
              <Text style={styles.logDesc}>{item.activity}</Text>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activity logs match your filters.</Text>
          </View>
        )}
      />
      </View>
      <AdminBottomNavBar />
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
    paddingBottom: 20
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
  searchContainer: {
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textHeader,
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginRight: 6
  },
  activeFilterPill: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(123, 47, 247, 0.2)'
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  activeFilterPillText: {
    color: COLORS.primary,
  },
  logList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40
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
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logMeta: {
    flex: 1,
    marginLeft: 12,
  },
  logUser: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  logTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  logDesc: {
    fontSize: 13,
    color: COLORS.textMain,
    marginTop: 12,
    lineHeight: 18,
    marginLeft: 48,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default ActivityMonitoringScreen;
