import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft, EyeOff, Globe, Apple, Users, CheckSquare, Square } from 'lucide-react-native';

const { width } = Dimensions.get('window');

type SignUpScreenProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenProp>();
  const [agree, setAgree] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://cdni.iconscout.com/illustration/premium/thumb/login-page-illustration-download-in-svg-png-gif-file-formats--secure-password-online-protection-security-system-pack-business-illustrations-4541785.png' }} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <View style={styles.form}>
          <CustomInput label="Full Name" placeholder="Enter your full name" />
          <CustomInput label="Email" placeholder="Enter your email" keyboardType="email-address" />
          <CustomInput label="Phone Number" placeholder="Enter your phone number" keyboardType="phone-pad" />
          <View style={styles.passwordWrapper}>
            <CustomInput label="Password" placeholder="Create a password" secureTextEntry />
            <TouchableOpacity style={styles.eyeIcon}>
              <EyeOff size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.termsRow}>
            <TouchableOpacity onPress={() => setAgree(!agree)}>
              {agree ? <CheckSquare size={20} color="#6B4EFF" /> : <Square size={20} color="#9CA3AF" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.linkText}>Terms & Conditions</Text>{"\n"}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>

          <CustomButton 
            title="Sign Up" 
            onPress={() => navigation.navigate('RoleSelection')}
            style={styles.signUpButton}
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
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInText}>Sign In</Text>
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
  header: { alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 5 },
  imageContainer: { height: 160, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  illustration: { width: width * 0.6, height: '100%' },
  form: { width: '100%' },
  passwordWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 15, top: 48 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 15, gap: 10 },
  termsText: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  linkText: { color: '#6B4EFF', fontWeight: '700' },
  signUpButton: { borderRadius: 12, marginTop: 10 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 15, color: '#9CA3AF', fontSize: 13 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 25 },
  socialButton: { width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#6B7280', fontSize: 15 },
  signInText: { color: '#6B4EFF', fontWeight: '800', fontSize: 15 },
});

export default SignUpScreen;
