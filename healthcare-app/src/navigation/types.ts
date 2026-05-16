export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignIn: { role: string };
  SignUp: { role: string };
  ForgotPassword: undefined;
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
  MyMedicalRecords: undefined;
  LaboratoryResults: undefined;
  FindDoctors: undefined;
  PatientAppointments: undefined;
    PatientProfile: undefined;
  DoctorAvailability: undefined;
  // Doctor/Lab screens
  DoctorAppointments: undefined;
  LabTests: undefined;
  Profile: undefined;
};
