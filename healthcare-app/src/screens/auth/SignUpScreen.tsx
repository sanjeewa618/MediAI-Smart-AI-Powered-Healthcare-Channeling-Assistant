import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft, EyeOff, Eye, Circle, CheckCircle2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type SignUpScreenProp = StackNavigationProp<RootStackParamList, 'SignUp'>;
type SignUpRouteProp = RouteProp<RootStackParamList, 'SignUp'>;

// Staggered Entrance Animation Wrapper
const StaggeredView = ({ children, delay = 0, style }: { children: React.ReactNode; delay: number; style?: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const SignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenProp>();
  const route = useRoute<SignUpRouteProp>();
  const { role } = route.params || {};
  const [agree, setAgree] = React.useState(true);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [isOtpSent, setIsOtpSent] = React.useState(false);
  const [hidePassword, setHidePassword] = React.useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = React.useState(true);
  const [doctorId, setDoctorId] = React.useState('');
  const [nurseId, setNurseId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = React.useState('');
  const [selectedDepartment, setSelectedDepartment] = React.useState('');
  const [doctorSpecialties, setDoctorSpecialties] = React.useState<any[]>([]);
  const [labDepartments, setLabDepartments] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (role === 'doctor') {
      const fetchSpecialties = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/doctor/specialties`);
          const data = await res.json();
          if (data.success && data.data) {
            setDoctorSpecialties(data.data);
          }
        } catch (error) {
          console.log('Failed to fetch doctor specialties:', error);
        }
      };
      fetchSpecialties();
    } else if (role === 'nurse') {
      const fetchDepartments = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/nurse/departments`);
          const data = await res.json();
          if (data.success && data.data) {
            setLabDepartments(data.data);
          }
        } catch (error) {
          console.log('Failed to fetch lab departments:', error);
        }
      };
      fetchDepartments();
    }
  }, [role]);

  const handleSendOtp = async () => {
    if (!email) {
      alert('Please enter your email first.');
      return;
    }
    setOtpLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsOtpSent(true);
        alert('OTP Sent to ' + email);
      } else {
        alert(data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      alert('Failed to connect to the server. Please check your network.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignUpPatient = async () => {
    if (!name || !email || !phone || !password || !confirmPassword || (isOtpSent && !otp)) {
      alert('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (!agree) {
      alert('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: 'patient', // Enforce patient role
          otp, // Send verification code to backend
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! Please sign in.');
        navigation.navigate('SignIn');
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      alert('Failed to connect to the server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpStaff = async () => {
    if (!name.trim()) {
      alert('Full Name is required.');
      return;
    }
    if (!email.trim()) {
      alert('Email is required.');
      return;
    }
    if (!phone.trim()) {
      alert('Phone Number is required.');
      return;
    }
    if (role === 'doctor' && !selectedSpecialty) {
      alert('Please select your medical specialty.');
      return;
    }
    if (role === 'nurse' && !selectedDepartment) {
      alert('Please select your lab category.');
      return;
    }
    if (role === 'doctor' && !doctorId.trim()) {
      alert('Doctor ID is required.');
      return;
    }
    if (role === 'nurse' && !nurseId.trim()) {
      alert('Nurse ID is required.');
      return;
    }
    if (!password) {
      alert('Password is required.');
      return;
    }
    if (!confirmPassword) {
      alert('Please confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (!agree) {
      alert('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: role,
          staffId: role === 'doctor' ? doctorId : nurseId,
          specialty: role === 'doctor' ? selectedSpecialty : undefined,
          department: role === 'nurse' ? selectedDepartment : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Staff registration request submitted successfully! Pending admin approval.');
        navigation.navigate('SignIn');
      } else {
        alert(data.message || 'Registration request failed.');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      alert('Failed to connect to the server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <StaggeredView delay={100}>
          <View style={styles.topHeaderRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={30} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>
                {role === 'doctor' ? 'Doctor Request' : role === 'nurse' ? 'Nurse Request' : 'Create Account'}
              </Text>
              <Text style={styles.subtitle}>
                {role === 'doctor' || role === 'nurse' 
                  ? `Submit request to join as a ${role}`
                  : 'Sign up to get started'}
              </Text>
            </View>
          </View>
        </StaggeredView>

        <StaggeredView delay={250}>
          <View style={styles.imageContainer}>
            <Image 
              source={require('../../../assets/signup-image2.png')} 
              style={[styles.illustration as any, { opacity: 0.90 }]}
              resizeMode="contain"
            />
          </View>
        </StaggeredView>

        <StaggeredView delay={400}>
          <View style={styles.form}>
            <CustomInput label="Full Name" placeholder="Enter your full name" value={name} onChangeText={setName} />
            
            <CustomInput label="Email" placeholder="Enter your email" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
            
            <View style={styles.otpButtonContainer}>
              <TouchableOpacity 
                style={styles.otpButtonNew} 
                onPress={handleSendOtp} 
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.otpButtonTextNew}>
                    {isOtpSent ? 'Resend OTP' : 'Send OTP'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            
            {isOtpSent && (
              <CustomInput 
                label="OTP Code" 
                placeholder="Enter the OTP sent to your email" 
                keyboardType="number-pad" 
                value={otp} 
                onChangeText={setOtp} 
              />
            )}
            
            <CustomInput label="Phone Number" placeholder="Enter your phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            
            {/* Doctor Specialty Selector */}
            {role === 'doctor' && (
              <View style={styles.categorySection}>
                <Text style={styles.categoryLabel}>Select Your Specialty <Text style={styles.requiredStar}>*</Text></Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsContainer}
                >
                  {doctorSpecialties.map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={[
                        styles.chip,
                        selectedSpecialty === item.name 
                          ? { backgroundColor: item.bg, borderColor: item.text } 
                          : { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }
                      ]}
                      onPress={() => setSelectedSpecialty(item.name)}
                      activeOpacity={0.75}
                    >
                      <Text style={[
                        styles.chipText,
                        selectedSpecialty === item.name 
                          ? { color: item.text, fontWeight: '700' } 
                          : { color: '#6B7280' }
                      ]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {selectedSpecialty ? (
                  (() => {
                    const matched = doctorSpecialties.find(d => d.name === selectedSpecialty);
                    return (
                      <View style={[styles.selectedBadge, matched ? { backgroundColor: matched.bg } : {}]}>
                        <Text style={[styles.selectedBadgeText, matched ? { color: matched.text } : {}]}>✓ {selectedSpecialty}</Text>
                      </View>
                    );
                  })()
                ) : null}
              </View>
            )}

            {/* Nurse Department Selector */}
            {role === 'nurse' && (
              <View style={styles.categorySection}>
                <Text style={styles.categoryLabel}>Select Your Lab Category <Text style={styles.requiredStar}>*</Text></Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsContainer}
                >
                  {labDepartments.map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={[
                        styles.chip,
                        selectedDepartment === item.name 
                          ? { backgroundColor: item.bg, borderColor: item.text } 
                          : { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }
                      ]}
                      onPress={() => setSelectedDepartment(item.name)}
                      activeOpacity={0.75}
                    >
                      <Text style={[
                        styles.chipText,
                        selectedDepartment === item.name 
                          ? { color: item.text, fontWeight: '700' } 
                          : { color: '#6B7280' }
                      ]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {selectedDepartment ? (
                  (() => {
                    const matched = labDepartments.find(n => n.name === selectedDepartment);
                    return (
                      <View style={[styles.selectedBadge, matched ? { backgroundColor: matched.bg } : {}]}>
                        <Text style={[styles.selectedBadgeText, matched ? { color: matched.text } : {}]}>✓ {selectedDepartment}</Text>
                      </View>
                    );
                  })()
                ) : null}
              </View>
            )}

            {role === 'doctor' && (
              <CustomInput label="Doctor ID" placeholder="Enter your Doctor ID" value={doctorId} onChangeText={setDoctorId} />
            )}
            {role === 'nurse' && (
              <CustomInput label="Nurse ID" placeholder="Enter your Nurse ID" value={nurseId} onChangeText={setNurseId} />
            )}

            <View style={styles.passwordWrapper}>
              <CustomInput label="Password" placeholder="Create a password" secureTextEntry={hidePassword} value={password} onChangeText={setPassword} />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setHidePassword(!hidePassword)}>
                {hidePassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>

            <View style={styles.passwordWrapper}>
              <CustomInput label="Confirm Password" placeholder="Confirm your password" secureTextEntry={hideConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
                {hideConfirmPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>

            <View style={styles.termsRow}>
              <TouchableOpacity onPress={() => setAgree(!agree)}>
                {agree ? <CheckCircle2 size={22} color={COLORS.primary} /> : <Circle size={22} color="#D1D1D6" />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the <Text style={styles.linkText}>Terms & Conditions</Text>{"\n"}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>

            {role === 'doctor' || role === 'nurse' ? (
              <CustomButton 
                title="Submit Request" 
                onPress={handleSignUpStaff}
                loading={loading}
                style={styles.signUpButton}
              />
            ) : (
              <View style={styles.buttonRow}>
                <CustomButton 
                  title="Sign Up as Patient" 
                  onPress={handleSignUpPatient}
                  style={styles.patientButton}
                  textStyle={{ fontSize: 12 }}
                  loading={loading}
                  disabled={!isOtpSent || !otp}
                />
                <CustomButton 
                  title="Request for hospital staff" 
                  variant="outline"
                  onPress={() => navigation.navigate('RoleSelection')}
                  style={styles.staffButton}
                  textStyle={{ fontSize: 10.5 }}
                />
              </View>
            )}
          </View>
        </StaggeredView>

        <StaggeredView delay={550}>
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.line} />
          </View>
        </StaggeredView>

        <StaggeredView delay={650}>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, SHADOWS.light]}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, SHADOWS.light]}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/0/747.png' }} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, SHADOWS.light]}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/124/124010.png' }} style={styles.socialIcon} />
            </TouchableOpacity>
          </View>
        </StaggeredView>

        <StaggeredView delay={750}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </StaggeredView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { paddingHorizontal: 28, paddingBottom: 40 },
  topHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 45, marginBottom: 20 },
  backButton: { width: 48, height: 48, justifyContent: 'center', marginRight: 10 },
  headerTextWrap: { flex: 1 },
  title: { fontSize: 32, fontWeight: '800', color: '#1A1A4B' },
  subtitle: { fontSize: 16, color: '#9CA3AF', marginTop: 5 },
  imageContainer: { 
    height: 320, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 0,
    marginTop: -10
  },
  illustration: { 
    width: width * 1.25, 
    height: 320 
  },
  form: { width: '100%' },
  emailWrapper: { position: 'relative' },
  otpButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
    marginTop: -8,
  },
  otpButtonNew: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  otpButtonTextNew: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  otpButton: { 
    position: 'absolute', 
    right: 8, 
    top: 34, 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  otpButtonText: { 
    color: COLORS.white, 
    fontSize: 12, 
    fontWeight: '600' 
  },
  // Category / Chip selector styles
  categorySection: {
    marginBottom: 16,
    marginTop: 4,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  requiredStar: {
    color: '#EF4444',
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingBottom: 6,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#FAF5FF',
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipNurse: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  chipNurseSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  chipTextNurse: {
    color: '#3B82F6',
  },
  chipTextNurseSelected: {
    color: '#FFFFFF',
  },
  selectedBadge: {
    marginTop: 8,
    backgroundColor: '#ECFDF5',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  selectedBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  passwordWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 16, top: 46 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 15, gap: 12 },
  termsText: { fontSize: 14, color: '#9CA3AF', lineHeight: 22 },
  linkText: { color: COLORS.primary, fontWeight: '700' },
  signUpButton: { borderRadius: 14, marginTop: 10 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    width: '100%',
  },
  patientButton: {
    flex: 1.25,
    marginVertical: 0,
    paddingHorizontal: 8,
  },
  staffButton: {
    flex: 1,
    marginVertical: 0,
    paddingHorizontal: 6,
  },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#F0F0F5' },
  dividerText: { marginHorizontal: 15, color: '#9CA3AF', fontSize: 13 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 25 },
  socialButton: { width: 52, height: 52, borderRadius: 14, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F0F0F5' },
  socialIcon: { width: 22, height: 22 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#9CA3AF', fontSize: 15 },
  signInText: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
});

export default SignUpScreen;
