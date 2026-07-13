import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  Brain,
  ChevronRight,
  RefreshCw,
  Clock,
  Stethoscope,
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.158.225.227:4000';

type Timeframe = 'weekly' | 'monthly' | 'yearly';

type AnalyticsData = {
  timeframe: Timeframe;
  range: {
    start: string;
    end: string;
    label: string;
  };
  summary: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalAppointments: number;
    completedAppointments: number;
    pendingAppointments: number;
    aiAnalyses: number;
    aiUniqueSpecialists: number;
  };
  userStats: {
    total: number;
    active: number;
    new: number;
  };
  appointmentTrend: Array<{ label: string; value: number }>;
  specialtyBreakdown: Array<{ label: string; count: number; percentage: number; color: string }>;
  aiStats: {
    totalAnalyses: number;
    topSpecialist: string;
    specialistBreakdown: Array<{ label: string; count: number }>;
  };
  aiRecent: Array<{
    id: string;
    query: string;
    response: string;
    specialist: string;
    createdAt: string;
  }>;
  userTrend: Array<{ label: string; value: number }>;
};

const TIMEFRAME_OPTIONS: Array<{ key: Timeframe; label: string }> = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const AnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    if (!token) {
      setLoading(false);
      Alert.alert('Authentication required', 'Please sign in as an admin to view analytics.');
      return;
    }

    setRefreshing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics?timeframe=${timeframe}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load analytics');
      }

      setAnalytics(data.data as AnalyticsData);
    } catch (error) {
      console.error('Load analytics error:', error);
      Alert.alert('Error', 'Unable to load analytics from the backend.');
      setAnalytics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, [timeframe, token]);

  const userActivityPercent = useMemo(() => {
    if (!analytics || analytics.userStats.total === 0) return 0;
    return Math.round((analytics.userStats.active / analytics.userStats.total) * 100);
  }, [analytics]);

  const appointmentPeak = useMemo(() => {
    if (!analytics?.appointmentTrend.length) return 0;
    return Math.max(...analytics.appointmentTrend.map(item => item.value), 1);
  }, [analytics]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('AdminDashboard')}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>Analytics & Statistics</Text>
              <Text style={styles.headerSubtitle}>Live aggregated metrics from the admin backend</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={() => void loadAnalytics()}>
              <RefreshCw size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            {TIMEFRAME_OPTIONS.map(item => (
              <TouchableOpacity
                key={item.key}
                style={[styles.tab, timeframe === item.key && styles.activeTab]}
                onPress={() => setTimeframe(item.key)}
              >
                <Text style={[styles.tabText, timeframe === item.key && styles.activeTabText]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
          <View style={[styles.summaryCard, SHADOWS.medium]}>
            <View style={styles.summaryMeta}>
              <Text style={styles.summaryTitle}>Growth & Activity</Text>
              <Text style={styles.summarySub}>
                {analytics ? `Range: ${analytics.range.label}` : 'Loading live metrics from the selected timeframe.'}
              </Text>
            </View>
            <View style={styles.trendRow}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.trendText}>{analytics ? `+${userActivityPercent}%` : '—'}</Text>
            </View>
          </View>

          {loading || refreshing ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading live analytics...</Text>
            </View>
          ) : null}

          <Text style={styles.sectionHeading}>User Account Statistics</Text>
          <View style={[styles.chartCard, SHADOWS.light]}>
            <View style={styles.chartHeader}>
              <Users size={20} color={COLORS.primary} />
              <Text style={styles.chartTitle}>Active vs Registered Users</Text>
            </View>

            <View style={styles.userStatsRow}>
              <View style={styles.userStatItem}>
                <Text style={styles.userStatVal}>{analytics?.userStats.total ?? 0}</Text>
                <Text style={styles.userStatLabel}>Registered</Text>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatItem}>
                <Text style={styles.userStatVal}>{analytics?.userStats.active ?? 0}</Text>
                <Text style={styles.userStatLabel}>Active Now</Text>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatItem}>
                <Text style={styles.userStatVal}>+{analytics?.userStats.new ?? 0}</Text>
                <Text style={styles.userStatLabel}>New Signups</Text>
              </View>
            </View>

            <View style={styles.barProgressBg}>
              <View style={[styles.barProgressFill, { width: `${userActivityPercent}%`, backgroundColor: COLORS.primary }]} />
            </View>
            <View style={styles.barLegends}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.legendText}>Active ({userActivityPercent}%)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
                <Text style={styles.legendText}>Inactive</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionHeading}>Appointment Trend</Text>
          <View style={[styles.chartCard, SHADOWS.light]}>
            <View style={styles.chartHeader}>
              <Calendar size={20} color="#3B82F6" />
              <Text style={styles.chartTitle}>Bookings Across the Selected Range</Text>
            </View>

            <View style={styles.verticalChartContainer}>
              {(analytics?.appointmentTrend || []).map((item, index) => {
                const heightPercent = appointmentPeak > 0 ? (item.value / appointmentPeak) * 100 : 0;
                return (
                  <View key={`${item.label}-${index}`} style={styles.verticalBarColumn}>
                    <View style={styles.barWrapper}>
                      <LinearGradient
                        colors={['#3B82F6', '#60A5FA']}
                        style={[styles.verticalBarFill, { height: `${Math.max(heightPercent, 6)}%` }]}
                      />
                      <Text style={styles.barValText}>{item.value}</Text>
                    </View>
                    <Text style={styles.barLabel}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Text style={styles.sectionHeading}>Top Specialties Channelled</Text>
          <View style={[styles.chartCard, SHADOWS.light]}>
            <View style={styles.chartHeader}>
              <Stethoscope size={20} color="#10B981" />
              <Text style={styles.chartTitle}>Appointment Shares by Department</Text>
            </View>

            <View style={styles.pieListContainer}>
              {(analytics?.specialtyBreakdown || []).map((item, index) => (
                <View key={`${item.label}-${index}`} style={styles.pieListItem}>
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

          <Text style={styles.sectionHeading}>AI Health Assistant Usage</Text>
          <View style={[styles.chartCard, SHADOWS.light, { marginBottom: 30 }]}>
            <View style={styles.chartHeader}>
              <Brain size={20} color="#8B5CF6" />
              <Text style={styles.chartTitle}>Symptom Analysis Load</Text>
            </View>

            <View style={styles.aiWidgetInfo}>
              <View style={styles.aiStatItem}>
                <Text style={styles.aiStatVal}>{analytics?.aiStats.totalAnalyses ?? 0}</Text>
                <Text style={styles.aiStatLabel}>Total Analyses</Text>
              </View>
              <View style={styles.aiStatItem}>
                <Text style={styles.aiStatVal}>{analytics?.summary.aiUniqueSpecialists ?? 0}</Text>
                <Text style={styles.aiStatLabel}>Specialists</Text>
              </View>
              <View style={styles.aiStatItem}>
                <Text style={styles.aiStatVal}>{analytics?.aiStats.topSpecialist || 'N/A'}</Text>
                <Text style={styles.aiStatLabel}>Top Specialist</Text>
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
    backgroundColor: COLORS.background,
  },
  wrapper: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 30 : 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    fontWeight: '600',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
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
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontWeight: '600',
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
  verticalChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: 150,
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
    overflow: 'hidden',
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
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textHeader,
    textAlign: 'center',
  },
  aiStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
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
