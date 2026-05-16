import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

// Dashboards (Placeholders for now)
import PatientDashboard from '../screens/patient/PatientDashboard';
import DoctorDashboard from '../screens/doctor/DoctorDashboard';
import LabDashboard from '../screens/lab/LabDashboard';
import DoctorAvailability from '../screens/doctor/DoctorAvailability';

// New Reports screen
import ReportsScreen from '../screens/patient/ReportsScreen';

// Patient Sub-screens
import FindDoctorsScreen from '../screens/patient/FindDoctorsScreen';
import AIHealthAssistantScreen from '../screens/patient/AIHealthAssistantScreen';
import PatientAppointmentsScreen from '../screens/patient/PatientAppointmentsScreen';
import BookAppointmentScreen from '../screens/patient/BookAppointmentScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
      <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
      <Stack.Screen name="DoctorAvailability" component={DoctorAvailability} />
      <Stack.Screen name="LabDashboard" component={LabDashboard} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="FindDoctors" component={FindDoctorsScreen} />
      <Stack.Screen name="AIHealthAssistant" component={AIHealthAssistantScreen} />
      <Stack.Screen name="PatientAppointments" component={PatientAppointmentsScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
