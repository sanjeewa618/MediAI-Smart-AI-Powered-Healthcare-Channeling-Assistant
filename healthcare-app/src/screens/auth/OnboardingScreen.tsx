import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

type OnboardingScreenProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenProp>();

  return (
    <LinearGradient
      colors={['#6B4EFF', '#8E74FF']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.hexagon}>
             <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/100/ffffff/medical-heart.png' }} 
              style={styles.logoIcon}
            />
          </View>
          <Text style={styles.logoText}>MediAI</Text>
          <Text style={styles.logoSubtitle}>Smart AI Powered{"\n"}Healthcare & Channeling{"\n"}Assistant</Text>
        </View>

        <View style={styles.illustrationContainer}>
          <Image 
            source={{ uri: 'https://cdni.iconscout.com/illustration/premium/thumb/doctors-team-illustration-download-in-svg-png-gif-file-formats--medical-staff-group-professionals-hospital-pack-healthcare-illustrations-5381182.png' }} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.slogan}>Your Health, Our Priority{"\n"}AI Care For Everyone</Text>
          
          <View style={styles.pagination}>
            <View style={styles.dotActive} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <TouchableOpacity 
            style={[styles.getStartedBtn, SHADOWS.medium]}
            onPress={() => navigation.navigate('RoleSelection')}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingTop: height * 0.08 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  hexagon: { width: 70, height: 70, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoIcon: { width: 35, height: 35 },
  logoText: { fontSize: 38, fontWeight: '800', color: COLORS.white, letterSpacing: 1 },
  logoSubtitle: { fontSize: 15, color: COLORS.white, textAlign: 'center', marginTop: 8, lineHeight: 20, fontWeight: '500' },
  illustrationContainer: { width: width, height: height * 0.38, justifyContent: 'center', alignItems: 'center' },
  illustration: { width: width * 0.85, height: '100%' },
  bottomSection: { width: '100%', alignItems: 'center', position: 'absolute', bottom: 50 },
  slogan: { fontSize: 17, color: COLORS.white, textAlign: 'center', fontWeight: '600', lineHeight: 24, marginBottom: 25 },
  pagination: { flexDirection: 'row', marginBottom: 25 },
  dotActive: { width: 25, height: 6, borderRadius: 3, backgroundColor: COLORS.white, marginHorizontal: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.4)', marginHorizontal: 3 },
  getStartedBtn: { backgroundColor: COLORS.white, paddingHorizontal: 50, paddingVertical: 16, borderRadius: 30 },
  getStartedText: { color: '#6B4EFF', fontSize: 17, fontWeight: '800' },
});

export default OnboardingScreen;
