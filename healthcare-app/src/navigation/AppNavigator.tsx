import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { RootStackParamList } from './types';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import CreateNewPasswordScreen from '../screens/auth/CreateNewPasswordScreen';

// Dashboard Screens
import PatientDashboard from '../screens/patient/PatientDashboard';
import DoctorDashboard from '../screens/doctor/DoctorDashboard';
import DoctorAppointmentsScreen from '../screens/doctor/DoctorAppointmentsScreen';
import DoctorSchedulingScreen from '../screens/doctor/DoctorSchedulingScreen';
import DoctorHistoryScreen from '../screens/doctor/DoctorHistoryScreen';
import DoctorReportsScreen from '../screens/doctor/DoctorReportsScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileScreen';
import LabDashboard from '../screens/lab/LabDashboard';
import LabAppointmentsScreen from '../screens/lab/LabAppointmentsScreen';
import LabSchedulingScreen from '../screens/lab/LabSchedulingScreen';
import LabReportsScreen from '../screens/lab/LabReportsScreen';
import LabProfileScreen from '../screens/lab/LabProfileScreen';
import ReportsScreen from '../screens/patient/ReportsScreen';

// Patient Sub-screens
import FindDoctorsScreen from '../screens/patient/FindDoctorsScreen';
import AIHealthAssistantScreen from '../screens/patient/AIHealthAssistantScreen';
import PatientAppointmentsScreen from '../screens/patient/PatientAppointmentsScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';
import SpecialtyDoctorsScreen from '../screens/patient/SpecialtyDoctorsScreen';
import AvailabilitySelectionScreen from '../screens/patient/AvailabilitySelectionScreen';
import LabAvailabilityScreen from '../screens/patient/LabAvailabilityScreen';
import LabBookingFlowScreen from '../screens/patient/LabBookingFlowScreen';
import DoctorAvailability from '../screens/doctor/DoctorAvailability';
import SettingsScreen from '../screens/patient/SettingsScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import DoctorVerificationScreen from '../screens/admin/DoctorVerificationScreen';
import AdminRequestsScreen from '../screens/admin/AdminRequestsScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import AIMonitoringScreen from '../screens/admin/AIMonitoringScreen';
import AdminReportsScreen from '../screens/admin/ReportsScreen';
import AdminSettingsScreen from '../screens/admin/SettingsScreen';
import AdminLaboratoriesScreen from '../screens/admin/AdminLaboratoriesScreen';



const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
      <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
      <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
      <Stack.Screen name="DoctorAppointments" component={DoctorAppointmentsScreen} />
      <Stack.Screen name="DoctorScheduling" component={DoctorSchedulingScreen} />
      <Stack.Screen name="DoctorHistory" component={DoctorHistoryScreen} />
      <Stack.Screen name="DoctorReports" component={DoctorReportsScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen name="LabDashboard" component={LabDashboard} />
      <Stack.Screen name="LabAppointments" component={LabAppointmentsScreen} />
      <Stack.Screen name="LabScheduling" component={LabSchedulingScreen} />
      <Stack.Screen name="LabReports" component={LabReportsScreen} />
      <Stack.Screen name="LabProfile" component={LabProfileScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="FindDoctors" component={FindDoctorsScreen} />
      <Stack.Screen name="AIHealthAssistant" component={AIHealthAssistantScreen} />
      <Stack.Screen name="PatientAppointments" component={PatientAppointmentsScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="PatientProfile" component={PatientProfileScreen} />
      <Stack.Screen name="DoctorAvailability" component={DoctorAvailability} />
      <Stack.Screen name="SpecialtyDoctors" component={SpecialtyDoctorsScreen} />
      <Stack.Screen name="AvailabilitySelection" component={AvailabilitySelectionScreen} />
      <Stack.Screen name="LabAvailability" component={LabAvailabilityScreen} />
      <Stack.Screen name="LabBookingFlow" component={LabBookingFlowScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUserManagement" component={UserManagementScreen} />
      <Stack.Screen name="AdminDoctorVerification" component={DoctorVerificationScreen} />
      <Stack.Screen name="AdminRequests" component={AdminRequestsScreen} />
      <Stack.Screen name="AdminAnalytics" component={AnalyticsScreen} />
      <Stack.Screen name="AdminAIMonitoring" component={AIMonitoringScreen} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Stack.Screen name="AdminLaboratories" component={AdminLaboratoriesScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
