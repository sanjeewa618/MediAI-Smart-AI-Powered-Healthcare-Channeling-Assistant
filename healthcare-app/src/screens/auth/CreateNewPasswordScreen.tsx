import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { ArrowLeft, EyeOff, Eye } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CreateNewPassword'>;
type RoutePropType = RouteProp<RootStackParamList, 'CreateNewPassword'>;

const CreateNewPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { email, otp } = (route.params as any) || {};

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [hidePassword, setHidePassword] = React.useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password reset successful! Please login with your new password.');
        navigation.navigate('SignIn');
      } else {
        alert(data.message || 'Failed to reset password.');
      }
    } catch (error) {
      console.error('Reset Password Error:', error);
      alert('Failed to connect to the server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.topHeaderRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={30} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>New Password</Text>
              <Text style={styles.subtitle}>Create a strong new password for your account</Text>
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
          <View style={styles.passwordWrapper}>
            <CustomInput 
              label="New Password" 
              placeholder="Create a password" 
              secureTextEntry={hidePassword} 
              value={password} 
              onChangeText={setPassword} 
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setHidePassword(!hidePassword)}>
              {hidePassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
            </TouchableOpacity>
          </View>

          <View style={styles.passwordWrapper}>
            <CustomInput 
              label="Confirm New Password" 
              placeholder="Confirm your password" 
              secureTextEntry={hideConfirmPassword} 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
              {hideConfirmPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
            </TouchableOpacity>
          </View>

          <CustomButton 
            title="Reset Password" 
            onPress={handleResetPassword}
            style={styles.resetButton}
            loading={loading}
          />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    height: 160, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15,
    marginTop: 5,
  },
  illustration: { 
    width: width * 0.6, 
    height: 160,
  },
  form: { width: '100%' },
  passwordWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 16, top: 46 },
  resetButton: { borderRadius: 14, marginTop: 15 },
});

export default CreateNewPasswordScreen;
