import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type NavigationProp = StackNavigationProp<RootStackParamList, 'OTPVerification'>;
type RoutePropType = RouteProp<RootStackParamList, 'OTPVerification'>;

const OTPVerificationScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { email } = route.params;
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert('Please enter the OTP verification code.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('OTP verified successfully!');
        // Navigate to CreateNewPassword with email and otp (cast as any for routing simplicity)
        navigation.navigate('CreateNewPassword' as any, { email, otp });
      } else {
        alert(data.message || 'Invalid or expired OTP.');
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      alert('Failed to connect to the server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={30} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
          </View>
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
            label="Verification Code"
            placeholder="Enter 6-digit OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
          />

          <CustomButton 
            title="Verify Code" 
            onPress={handleVerifyOtp}
            style={styles.verifyButton}
            loading={loading}
          />
        </View>
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
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1A1A4B',
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 14, 
    color: '#9CA3AF', 
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: { 
    height: 260, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    marginTop: 10,
  },
  illustration: { 
    width: width * 0.9, 
    height: 260,
  },
  form: { width: '100%' },
  verifyButton: { borderRadius: 14, marginTop: 15 },
});

export default OTPVerificationScreen;
