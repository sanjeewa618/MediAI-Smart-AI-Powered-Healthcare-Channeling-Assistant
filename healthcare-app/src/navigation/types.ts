export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string };
  CreateNewPassword: { email: string };
  RoleSelection: undefined;
  PatientDashboard: undefined;
  DoctorDashboard: undefined;
  LabDashboard: undefined;
  // Patient sub-screens
  BookAppointment: undefined;
  AIHealthAssistant: undefined;
  MyMedicalRecords: undefined;
  LaboratoryResults: undefined;
  FindDoctors: undefined;
  // Doctor/Lab screens
  DoctorAppointments: undefined;
  LabTests: undefined;
  Profile: undefined;
};
