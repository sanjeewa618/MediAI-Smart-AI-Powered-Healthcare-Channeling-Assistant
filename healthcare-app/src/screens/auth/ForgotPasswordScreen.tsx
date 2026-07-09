import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      alert('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('OTP code sent successfully to ' + email);
        navigation.navigate('OTPVerification', { email: email.toLowerCase() });
      } else {
        alert(data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Forgot Password OTP Error:', error);
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
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive verification code</Text>
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
            label="Email Address"
            placeholder="Enter your registered email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <CustomButton 
            title="Send OTP" 
            onPress={handleSendOtp}
            style={styles.sendButton}
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
    height: 250, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    marginTop: 10,
  },
  illustration: { 
    width: width * 0.7, 
    height: 180,
  },
  form: { width: '100%' },
  sendButton: { borderRadius: 14, marginTop: 15 },
});

export default ForgotPasswordScreen;
