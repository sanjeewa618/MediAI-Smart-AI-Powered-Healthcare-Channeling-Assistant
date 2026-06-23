import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Calendar, 
  Brain, 
  ChevronRight,
  TrendingDown,
  CreditCard,
  Clock
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  // Custom data for charts depending on timeframe
  const userStats = {
    total: 1380,
    active: 942,
    new: timeframe === 'weekly' ? 24 : timeframe === 'monthly' ? 104 : 850
  };

  const appointmentData = [
    { label: 'Cardiology', count: 48, percentage: 40, color: '#7B2FF7' },
    { label: 'Pediatrics', count: 36, percentage: 30, color: '#3B82F6' },
    { label: 'Dermatology', count: 24, percentage: 20, color: '#10B981' },
    { label: 'Neurology', count: 12, percentage: 10, color: '#F59E0B' },
  ];

  const weeklyTrend = [
    { day: 'Mon', value: 30 },
    { day: 'Tue', value: 45 },
    { day: 'Wed', value: 65 },
    { day: 'Thu', value: 50 },
    { day: 'Fri', value: 80 },
    { day: 'Sat', value: 95 },
    { day: 'Sun', value: 40 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
      {/* Top Header */}
      <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AdminDashboard')}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics & Statistics</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Timeframe Switcher */}
        <View style={styles.tabContainer}>
          {(['weekly', 'monthly', 'yearly'] as const).map(item => (
            <TouchableOpacity 
              key={item}
              style={[styles.tab, timeframe === item && styles.activeTab]}
              onPress={() => setTimeframe(item)}
            >
              <Text style={[styles.tabText, timeframe === item && styles.activeTabText]}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
        {/* Core summary card */}
        <View style={[styles.summaryCard, SHADOWS.medium]}>
          <View style={styles.summaryMeta}>
            <Text style={styles.summaryTitle}>Growth & Activity</Text>
            <Text style={styles.summarySub}>Overall appointments are up 12% compared to last period.</Text>
          </View>
          <View style={styles.trendRow}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.trendText}>+12.4%</Text>
          </View>
        </View>

        {/* User Stats Widget (Bar Chart Mock) */}
        <Text style={styles.sectionHeading}>User Account Statistics</Text>
        <View style={[styles.chartCard, SHADOWS.light]}>
          <View style={styles.chartHeader}>
            <Users size={20} color={COLORS.primary} />
            <Text style={styles.chartTitle}>Active vs Registered Users</Text>
          </View>
          
          <View style={styles.userStatsRow}>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatVal}>{userStats.total}</Text>
              <Text style={styles.userStatLabel}>Registered</Text>
            </View>
            <View style={styles.userStatDivider} />
            <View style={styles.userStatItem}>
              <Text style={styles.userStatVal}>{userStats.active}</Text>
              <Text style={styles.userStatLabel}>Active Now</Text>
            </View>
            <View style={styles.userStatDivider} />
            <View style={styles.userStatItem}>
              <Text style={styles.userStatVal}>+{userStats.new}</Text>
              <Text style={styles.userStatLabel}>New Signups</Text>
            </View>
          </View>

          {/* Graphical Bar */}
          <View style={styles.barProgressBg}>
            <View style={[styles.barProgressFill, { width: `${(userStats.active / userStats.total) * 100}%`, backgroundColor: COLORS.primary }]} />
          </View>
          <View style={styles.barLegends}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Active ({Math.round((userStats.active / userStats.total) * 100)}%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
              <Text style={styles.legendText}>Inactive</Text>
            </View>
          </View>
        </View>

        {/* Appointments stats widget (Vertical Bar Chart Mock) */}
        <Text style={styles.sectionHeading}>Weekly Appointment Trend</Text>
        <View style={[styles.chartCard, SHADOWS.light]}>
          <View style={styles.chartHeader}>
            <Calendar size={20} color="#3B82F6" />
            <Text style={styles.chartTitle}>Daily Bookings Count</Text>
          </View>

          <View style={styles.verticalChartContainer}>
            {weeklyTrend.map((item, index) => (
              <View key={index} style={styles.verticalBarColumn}>
                <View style={styles.barWrapper}>
                  <LinearGradient 
                    colors={['#3B82F6', '#60A5FA']} 
                    style={[styles.verticalBarFill, { height: `${(item.value / 100) * 100}%` }]} 
                  />
                  <Text style={styles.barValText}>{item.value}</Text>
                </View>
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Doctor and specialty stats widget (Pie-List Mock) */}
        <Text style={styles.sectionHeading}>Top Specialties Channelled</Text>
        <View style={[styles.chartCard, SHADOWS.light]}>
          <View style={styles.chartHeader}>
            <Users size={20} color="#10B981" />
            <Text style={styles.chartTitle}>Appointment Shares by Department</Text>
          </View>

          <View style={styles.pieListContainer}>
            {appointmentData.map((item, index) => (
              <View key={index} style={styles.pieListItem}>
                <View style={styles.pieListMeta}>
                  <View style={[styles.bulletDot, { backgroundColor: item.color }]} />
                  <Text style={styles.pieListLabel}>{item.label}</Text>
                </View>
                <View style={styles.pieBarTrack}>
                  <View style={[styles.pieBarFill, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={styles.pieListPercent}>{item.percentage}% ({item.count})</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Monitoring Center widget summary */}
        <Text style={styles.sectionHeading}>AI Health Assistant Usage</Text>
        <View style={[styles.chartCard, SHADOWS.light, { marginBottom: 30 }]}>
          <View style={styles.chartHeader}>
            <Brain size={20} color="#8B5CF6" />
            <Text style={styles.chartTitle}>Symptom Analysis Load</Text>
          </View>

          <View style={styles.aiWidgetInfo}>
            <View style={styles.aiStatItem}>
              <Text style={styles.aiStatVal}>352</Text>
              <Text style={styles.aiStatLabel}>Total Analyses</Text>
            </View>
            <View style={styles.aiStatItem}>
              <Text style={styles.aiStatVal}>98.2%</Text>
              <Text style={styles.aiStatLabel}>Accuracy rating</Text>
            </View>
            <View style={styles.aiStatItem}>
              <Text style={styles.aiStatVal}>1.4s</Text>
              <Text style={styles.aiStatLabel}>Avg Latency</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.aiMonitorLink}
            onPress={() => navigation.navigate('AdminAIMonitoring')}
          >
            <Text style={styles.aiMonitorLinkText}>Open AI Monitoring Center</Text>
            <ChevronRight size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 16
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  activeTab: {
    backgroundColor: COLORS.white,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  activeTabText: {
    color: COLORS.primary,
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
  summaryMeta: {
    flex: 1,
    paddingRight: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  summarySub: {
    fontSize: 12,
    color: COLORS.textMain,
    marginTop: 4,
    lineHeight: 16,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 12,
    marginTop: 8,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEBFF',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  userStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  userStatVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textHeader,
  },
  userStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  userStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
  },
  barProgressBg: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  barProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  barLegends: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  // Vertical Bars
  verticalChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 20,
    paddingBottom: 10,
  },
  verticalBarColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 100,
    width: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  verticalBarFill: {
    width: '100%',
    borderRadius: 8,
  },
  barValText: {
    position: 'absolute',
    top: -20,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  barLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 8,
  },
  // Pie List
  pieListContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  pieListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieListMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  bulletDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pieListLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  pieBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  pieBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  pieListPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textHeader,
    width: 70,
    textAlign: 'right',
  },
  // AI widget
  aiWidgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  aiStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  aiStatVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textHeader,
  },
  aiStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  aiMonitorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 8,
  },
  aiMonitorLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
});

export default AnalyticsScreen;
