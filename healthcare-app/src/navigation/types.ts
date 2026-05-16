export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignIn: { role: string };
  SignUp: { role: string };
  ForgotPassword: { email?: string };
  OTPVerification: { email: string };
  CreateNewPassword: { email: string };
  RoleSelection: undefined;
  PatientDashboard: undefined;
  DoctorDashboard: undefined;
  LabDashboard: undefined;
  Reports: undefined;
  // Patient sub-screens
  BookAppointment: { doctorId?: string; doctorName?: string; specialty?: string; date?: string; time?: string };
  AIHealthAssistant: undefined;
  FindDoctors: undefined;
  PatientAppointments: undefined;
  PatientProfile: undefined;
  DoctorAvailability: { specialty?: string };
  SpecialtyDoctors: { specialty: string };
  AvailabilitySelection: undefined;
  LabAvailability: undefined;
  LabBookingFlow: { lab: any; initialDate?: string; initialTime?: string };
};
