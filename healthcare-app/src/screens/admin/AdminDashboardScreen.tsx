import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Image, 
  Platform,
  Modal,
  Animated,
  PanResponder,
  Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { 
  Menu, 
  Users, 
  CheckSquare, 
  List, 
  BarChart2, 
  Brain, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  Calendar, 
  ChevronRight,
  ArrowRight,
  TrendingUp,
  X,
  Stethoscope,
  BriefcaseMedical,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Home,
  FlaskConical
} from 'lucide-react-native';
import AdminBottomNavBar from '../../components/AdminBottomNavBar';

const { width, height } = Dimensions.get('window');

// Mock data representing a single hospital state
const STATS = {
  totalUsers: 1380,
  totalPatients: 1250,
  totalDoctors: 45,
  totalNurses: 85,
  todaysAppointments: 120,
  activeAIRequests: 14,
  pendingVerifications: 3
};

const AdminDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Left-to-Right Drawer animation configuration:
  // Closed = -width * 0.75 (offscreen to the left), Open = 0
  const menuAnimX = useRef(new Animated.Value(-width * 0.75)).current;

  const overlayOpacity = menuAnimX.interpolate({
    inputRange: [-width * 0.75, 0],
    outputRange: [0, 0.5],
    extrapolate: 'clamp'
  });

  const openDrawer = () => {
    setIsDrawerOpen(true);
    menuAnimX.setValue(-width * 0.75);
    Animated.spring(menuAnimX, {
      toValue: 0,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.spring(menuAnimX, {
      toValue: -width * 0.75,
      damping: 20,
      stiffness: 90,
      useNativeDriver: true,
    }).start(() => {
      setIsDrawerOpen(false);
    });
  };

  // PanResponder to handle swiping the drawer closed (dragging from right to left)
  const menuPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => {
        return gestureState.dx < -20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onMoveShouldSetPanResponderCapture: (e, gestureState) => {
        return gestureState.dx < -30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
      },
      onPanResponderGrant: () => {
        menuAnimX.setOffset((menuAnimX as any)._value);
        menuAnimX.setValue(0);
      },
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dx < 0) {
          menuAnimX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        menuAnimX.flattenOffset();
        if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          closeDrawer();
        } else {
          Animated.spring(menuAnimX, {
            toValue: 0,
            damping: 20,
            stiffness: 90,
            useNativeDriver: true,
          }).start();
        }
      }
    })
  ).current;

  const navigateTo = (screenName: string) => {
    closeDrawer();
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Drawer Modal */}
      <Modal
        transparent
        visible={isDrawerOpen}
        onRequestClose={closeDrawer}
        animationType="none"
      >
        <View style={styles.menuOverlay}>
          {/* Animated background overlay */}
          <Animated.View style={[styles.menuDismissArea, { opacity: overlayOpacity }]}>
            <Pressable 
              style={StyleSheet.absoluteFill} 
              onPress={closeDrawer} 
            />
          </Animated.View>
          
          {/* Slide-out drawer on the left */}
          <Animated.View 
            style={[
              styles.menuContent, 
              { transform: [{ translateX: menuAnimX }] }
            ]}
            {...menuPanResponder.panHandlers}
          >
            {/* Purple Top Header similar to Patient Screen */}
            <LinearGradient
              colors={['#8B3DFF', '#5F0FFF']}
              style={styles.menuHeader}
            >
              <TouchableOpacity 
                style={styles.menuCloseBtn}
                onPress={closeDrawer}
              >
                <X size={24} color="#FFF" />
              </TouchableOpacity>
              
              <Image 
                source={{ uri: 'https://img.icons8.com/bubbles/100/000000/administrator-male.png' }} 
                style={styles.menuAvatar} 
              />
              <Text style={styles.menuUserName}>City Hospital Admin</Text>
              <Text style={styles.menuUserEmail}>admin@cityhospital.lk</Text>
              
              <View style={styles.membershipBadge}>
                <Sparkles size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.membershipText}>Super Admin</Text>
              </View>
            </LinearGradient>

            <View style={styles.menuItemsContainer}>
              <ScrollView style={styles.menuItemsList} showsVerticalScrollIndicator={false} directionalLockEnabled={true}>
                <TouchableOpacity style={styles.menuItem} onPress={closeDrawer}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#F3F0FF' }]}>
                    <Home size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuItemText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('AdminUserManagement')}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Users size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.menuItemText}>Users</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('AdminAppointments')}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
                    <Calendar size={20} color="#EF4444" />
                  </View>
                  <Text style={styles.menuItemText}>Appointments</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('AdminRequests')}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <List size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.menuItemText}>Requests</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('AdminLaboratories')}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#E0F2FE' }]}>
                    <FlaskConical size={20} color="#0EA5E9" />
                  </View>
                  <Text style={styles.menuItemText}>Labs</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('AdminReports')}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#F3F4F6' }]}>
                    <FileText size={20} color="#6B7280" />
                  </View>
                  <Text style={styles.menuItemText}>Reports</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('AdminSettings')}>
                  <View style={[styles.menuIconBox, { backgroundColor: '#F9FAFB' }]}>
                    <Settings size={20} color="#9CA3AF" />
                  </View>
                  <Text style={styles.menuItemText}>System Settings</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity 
                  style={[styles.menuItem, { marginBottom: 30 }]} 
                  onPress={() => {
                    closeDrawer();
                    navigation.replace('SignIn', { role: 'admin' });
                  }}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                    <LogOut size={20} color="#EF4444" />
                  </View>
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Logout</Text>
                </TouchableOpacity>
              </ScrollView>
              <Text style={styles.menuVersion}>Version 1.0.2 (Beta)</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <View style={styles.wrapper}>
        {/* Top Purple Header */}
        <LinearGradient 
          colors={COLORS.screenHeaderGradient as any} 
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.headerActionBtn} onPress={openDrawer}>
              <Menu size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={[styles.headerInfo, { marginLeft: 15 }]}>
              <Text style={styles.headerTitle}>City Hospital</Text>
              <Text style={styles.headerSubtitle}>Super Admin Dashboard</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerActionBtn}>
                <Bell size={20} color="#FFF" />
                <View style={styles.bellBadge} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerActionBtn, { marginLeft: 10 }]} 
                onPress={() => navigation.replace('SignIn', { role: 'admin' })}
              >
                <LogOut size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
          {/* Welcome Card */}
          <View style={[styles.welcomeCard, SHADOWS.medium]}>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeTitle}>Overview & Status</Text>
              <Text style={styles.welcomeDesc}>Monitor hospital activities, AI diagnostics and manage credentials.</Text>
            </View>
            <LinearGradient colors={['#9333EA', '#7B2FF7']} style={styles.welcomePulse}>
              <TrendingUp size={24} color="#FFF" />
            </LinearGradient>
          </View>

          {/* Stats Overview */}
          <Text style={styles.sectionHeading}>Hospital Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, SHADOWS.light]}>
              <View style={[styles.iconWrap, { backgroundColor: '#F3E8FF' }]}>
                <Users size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.statVal}>{STATS.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>

            <View style={[styles.statCard, SHADOWS.light]}>
              <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Users size={22} color="#3B82F6" />
              </View>
              <Text style={styles.statVal}>{STATS.totalPatients}</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>

            <View style={[styles.statCard, SHADOWS.light]}>
              <View style={[styles.iconWrap, { backgroundColor: '#ECFDF5' }]}>
                <Stethoscope size={22} color="#10B981" />
              </View>
              <Text style={styles.statVal}>{STATS.totalDoctors}</Text>
              <Text style={styles.statLabel}>Doctors</Text>
            </View>

            <View style={[styles.statCard, SHADOWS.light]}>
              <View style={[styles.iconWrap, { backgroundColor: '#FFFBEB' }]}>
                <BriefcaseMedical size={22} color="#F59E0B" />
              </View>
              <Text style={styles.statVal}>{STATS.totalNurses}</Text>
              <Text style={styles.statLabel}>Nurses</Text>
            </View>

            <View style={[styles.statCard, SHADOWS.light]}>
              <View style={[styles.iconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Calendar size={22} color="#EF4444" />
              </View>
              <Text style={styles.statVal}>{STATS.todaysAppointments}</Text>
              <Text style={styles.statLabel}>Today's Appointments</Text>
            </View>

            <View style={[styles.statCard, SHADOWS.light]}>
              <View style={[styles.iconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Brain size={22} color="#6366F1" />
              </View>
              <Text style={styles.statVal}>{STATS.activeAIRequests}</Text>
              <Text style={styles.statLabel}>Active AI Req.</Text>
            </View>

            <View style={[styles.statCard, SHADOWS.light, { width: '100%' }]}>
              <View style={styles.verificationsHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <CheckSquare size={22} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.statVal}>{STATS.pendingVerifications}</Text>
                  <Text style={styles.statLabel}>Pending Doctor Verifications</Text>
                </View>
                <TouchableOpacity 
                  style={styles.verifyGoBtn}
                  onPress={() => navigation.navigate('AdminDoctorVerification')}
                >
                  <Text style={styles.verifyGoText}>Review</Text>
                  <ChevronRight size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionHeading}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionCard, SHADOWS.light]}
              onPress={() => navigation.navigate('AdminDoctorVerification')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#F3E8FF' }]}>
                <UserCheck size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.actionTitle}>Verify Doctor</Text>
              <Text style={styles.actionDesc}>Check submitted credentials</Text>
              <ArrowRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, SHADOWS.light]}
              onPress={() => navigation.navigate('AdminReports')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <FileText size={20} color="#10B981" />
              </View>
              <Text style={styles.actionTitle}>View Reports</Text>
              <Text style={styles.actionDesc}>Examine system usage & stats</Text>
              <ArrowRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, SHADOWS.light]}
              onPress={() => navigation.navigate('AdminLaboratories')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <FlaskConical size={20} color="#0EA5E9" />
              </View>
              <Text style={styles.actionTitle}>Manage Labs</Text>
              <Text style={styles.actionDesc}>Track biochemistry labs</Text>
              <ArrowRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, SHADOWS.light]}
              onPress={() => navigation.navigate('AdminUserManagement')}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Users size={20} color="#3B82F6" />
              </View>
              <Text style={styles.actionTitle}>Manage Users</Text>
              <Text style={styles.actionDesc}>Patients, Doctors, Nurses</Text>
              <ArrowRight size={16} color={COLORS.textSecondary} style={styles.actionArrow} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
        
        {/* Bottom Tab Bar */}
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
    flex: 1 
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 40 : 50,
    paddingHorizontal: 20,
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#7B2FF7',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  welcomeInfo: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  welcomeDesc: {
    fontSize: 13,
    color: COLORS.textMain,
    marginTop: 6,
    lineHeight: 18,
  },
  welcomePulse: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEEBFF',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statVal: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textHeader,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  verificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  verifyGoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 2,
  },
  verifyGoText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEEBFF',
    position: 'relative',
    shadowColor: '#7B2FF7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 7,
    elevation: 2,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  actionDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 14,
  },
  actionArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  // Side Menu Drawer Styles (Left to Right)
  menuOverlay: {
    flex: 1,
  },
  menuDismissArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  menuContent: {
    width: width * 0.75,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
    overflow: 'hidden',
  },
  menuHeader: {
    padding: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    alignItems: 'center',
    paddingBottom: 35,
    overflow: 'hidden',
  },
  menuItemsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -30, // Overlap the purple header
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    paddingTop: 10,
  },
  menuCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 15,
  },
  menuUserName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  menuUserEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 15,
    gap: 6,
  },
  membershipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuItemsList: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 15,
  },
  menuVersion: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;
