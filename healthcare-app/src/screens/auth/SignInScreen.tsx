import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft, EyeOff } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type SignInScreenProp = StackNavigationProp<RootStackParamList, 'SignIn'>;
type SignInRouteProp = RouteProp<RootStackParamList, 'SignIn'>;

const SignInScreen = () => {
  const navigation = useNavigation<SignInScreenProp>();
  const route = useRoute<SignInRouteProp>();
  const { role } = route.params;

  // Capitalize role for display
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{displayRole} Sign In</Text>
          <Text style={styles.subtitle}>Sign in to continue as a {role}</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../assets/signin-image.png')} 
            style={[styles.illustration as any, { opacity: 0.88 }]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.form}>
          <CustomInput 
            label="Email or Phone Number"
            placeholder="Enter your email or phone"
          />
          
          <View style={styles.passwordWrapper}>
            <CustomInput 
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
            />
            <TouchableOpacity style={styles.eyeIcon}>
              <EyeOff size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={() => alert('Forgot password feature coming soon!')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton 
            title="Sign In" 
            onPress={() => {
              if (role === 'patient') navigation.replace('PatientDashboard');
              else if (role === 'doctor') navigation.replace('DoctorDashboard');
              else if (role === 'lab') navigation.replace('LabDashboard');
            }}
            style={styles.signInButton}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.line} />
        </View>

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

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp', { role })}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { paddingHorizontal: 28, paddingBottom: 40 },
  backButton: { marginTop: 10, width: 40, height: 40, justifyContent: 'center' },
  header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#1A1A4B' },
  subtitle: { fontSize: 16, color: '#9CA3AF', marginTop: 8 },
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
