import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft, EyeOff, Circle, CheckCircle2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type SignUpScreenProp = StackNavigationProp<RootStackParamList, 'SignUp'>;
type SignUpRouteProp = RouteProp<RootStackParamList, 'SignUp'>;

const SignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenProp>();
  const route = useRoute<SignUpRouteProp>();
  const { role } = route.params;
  const [agree, setAgree] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={30} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>
        </View>

        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../assets/signup-image2.png')} 
            style={[styles.illustration as any, { opacity: 0.90 }]}
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
              {agree ? <CheckCircle2 size={22} color={COLORS.primary} /> : <Circle size={22} color="#D1D1D6" />}
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
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn', { role })}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
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
  passwordWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 16, top: 46 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 15, gap: 12 },
  termsText: { fontSize: 14, color: '#9CA3AF', lineHeight: 22 },
  linkText: { color: COLORS.primary, fontWeight: '700' },
  signUpButton: { borderRadius: 14, marginTop: 10 },
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
