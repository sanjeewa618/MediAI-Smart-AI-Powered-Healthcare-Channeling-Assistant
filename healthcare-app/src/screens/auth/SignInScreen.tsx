import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions, Animated } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft, EyeOff, Eye } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const { width, height } = Dimensions.get('window');

type SignInScreenProp = StackNavigationProp<RootStackParamList, 'SignIn'>;
type SignInRouteProp = RouteProp<RootStackParamList, 'SignIn'>;

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

const SignInScreen = () => {
  const navigation = useNavigation<SignInScreenProp>();
  const route = useRoute<SignInRouteProp>();
  const { role } = route.params || {};
  const { setRole, setToken } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [hidePassword, setHidePassword] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // data should contain { role, token, ... }
        const targetRole = data.role || 'patient';
        setRole(targetRole);
        setToken(data.token);

        if (targetRole === 'patient') navigation.replace('PatientDashboard');
        else if (targetRole === 'doctor') navigation.replace('DoctorDashboard');
        else if (targetRole === 'admin') navigation.replace('AdminDashboard');
        else if (targetRole === 'lab' || targetRole === 'nurse') navigation.replace('LabDashboard');
      } else {
        alert(data.message || 'Invalid credentials.');
      }
    } catch (error) {
      console.error('Sign In Error:', error);
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
              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>
          </View>
        </StaggeredView>

        <StaggeredView delay={250}>
          <View style={styles.imageContainer}>
            <Image 
              source={require('../../../assets/signin-image.png')} 
              style={[styles.illustration as any, { opacity: 0.88 }]}
              resizeMode="contain"
            />
          </View>
        </StaggeredView>

        <StaggeredView delay={400}>
          <View style={styles.form}>
            <CustomInput 
              label="Email or Phone Number"
              placeholder="Enter your email or phone"
              value={email}
              onChangeText={setEmail}
            />
            
            <View style={styles.passwordWrapper}>
              <CustomInput 
                label="Password"
                placeholder="Enter your password"
                secureTextEntry={hidePassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setHidePassword(!hidePassword)}>
                {hidePassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton 
              title="Sign In" 
              onPress={handleSignIn}
              style={styles.signInButton}
              loading={loading}
            />
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
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpText}>Sign Up</Text>
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
  topHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 45, 
    marginBottom: 20,
    position: 'relative',
    width: '100%',
  },
  backButton: { 
    position: 'absolute',
    left: 0,
    width: 48, 
    height: 48, 
    justifyContent: 'center',
    zIndex: 10,
  },
  headerTextWrap: { 
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#1A1A4B',
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 16, 
    color: '#9CA3AF', 
    marginTop: 8,
    textAlign: 'center',
  },
  imageContainer: { 
    height: 300, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
    marginTop: -10,
  },
  illustration: { 
    width: width * 1.1, 
    height: 300,
  },
  form: { width: '100%' },
  passwordWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 16, top: 46 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotPasswordText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  signInButton: { borderRadius: 14 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: '#F0F0F5' },
  dividerText: { marginHorizontal: 15, color: '#9CA3AF', fontSize: 14 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 35 },
  socialButton: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F0F0F5' },
  socialIcon: { width: 24, height: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#9CA3AF', fontSize: 15 },
  signUpText: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
});

export default SignInScreen;
