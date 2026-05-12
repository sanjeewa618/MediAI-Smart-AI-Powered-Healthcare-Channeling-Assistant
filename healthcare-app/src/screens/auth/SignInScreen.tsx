import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft, EyeOff, Globe, Apple, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type SignInScreenProp = StackNavigationProp<RootStackParamList, 'SignIn'>;

const SignInScreen = () => {
  const navigation = useNavigation<SignInScreenProp>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://cdni.iconscout.com/illustration/premium/thumb/male-doctor-explaining-to-female-patient-illustration-download-in-svg-png-gif-file-formats--appointment-health-checkup-clinic-pack-healthcare-illustrations-5381206.png' }} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <View style={styles.form}>
          <CustomInput 
            label="Email or Phone Number"
            placeholder="Enter your email or phone"
            containerStyle={styles.inputContainer}
          />
          <View style={styles.passwordWrapper}>
            <CustomInput 
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              containerStyle={styles.inputContainer}
            />
            <TouchableOpacity style={styles.eyeIcon}>
              <EyeOff size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <CustomButton 
            title="Sign In" 
            onPress={() => navigation.navigate('RoleSelection')}
            style={styles.signInButton}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.socialButton, SHADOWS.small]}>
            <Globe size={24} color="#EA4335" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, SHADOWS.small]}>
            <Apple size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, SHADOWS.small]}>
            <Users size={24} color="#1877F2" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  backButton: { marginTop: 10, marginBottom: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 5 },
  imageContainer: { height: 180, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  illustration: { width: width * 0.7, height: '100%' },
  form: { width: '100%' },
  inputContainer: { marginBottom: 15 },
  passwordWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 15, top: 48 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotPasswordText: { color: '#6B4EFF', fontWeight: '700', fontSize: 14 },
  signInButton: { borderRadius: 12 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 15, color: '#9CA3AF', fontSize: 14 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 30 },
  socialButton: { width: 55, height: 55, borderRadius: 15, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#6B7280', fontSize: 15 },
  signUpText: { color: '#6B4EFF', fontWeight: '800', fontSize: 15 },
});

export default SignInScreen;
