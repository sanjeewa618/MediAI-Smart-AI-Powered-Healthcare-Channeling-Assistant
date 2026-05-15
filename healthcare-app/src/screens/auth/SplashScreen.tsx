import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

type SplashNav = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashNav>();

  return (
    <LinearGradient colors={['#724CF9', '#5E3BEE']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoAndTitle}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/app-logo.png')}
              style={styles.logo as any}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>MediAI</Text>
          <Text style={styles.tagline}>Smart AI Powered{"\n"}Healthcare & Channeling{"\n"}Assistant</Text>
        </View>

        <View style={styles.illustrationWrap}>
          {/* Decorative background blobs to match the mockup */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />
          
          <Image
            source={require('../../../assets/welcome-image.png')}
            style={[styles.illustration as any, { opacity: 0.90 }]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.bottomTextContainer}>
          <Text style={styles.footerText}>Your Health, Our Priority</Text>
          <Text style={styles.footerTextBold}>AI Care For Everyone</Text>
          
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.getStartedButton} 
          onPress={() => navigation.navigate('RoleSelection')}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: height * 0.08,
  },
  logoAndTitle: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 75,
    height: 75,
  },
  brandName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
    opacity: 0.95,
    fontWeight: '500',
  },
  illustrationWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  blob1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#8E74FF',
    top: '10%',
    left: -20,
    opacity: 0.5,
  },
  blob2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#724CF9',
    bottom: '-10%',
    right: -40,
    opacity: 0.6,
  },
  blob3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#A58BFF',
    top: '30%',
    right: -20,
    opacity: 0.4,
  },
  illustration: {
    width: 300,
    height: 300,
    borderRadius: 150, // Makes the square image a perfect circle
    zIndex: 10,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#FFFFFF', // In case of transparency, blends with a clean white circle
  },
  bottomTextContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  footerTextBold: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 5,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  activeDot: {
    width: 28,
    backgroundColor: '#FFFFFF',
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    width: width * 0.85,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  getStartedText: {
    color: '#5E3BEE',
    fontSize: 18,
    fontWeight: '700',
  }
});

export default SplashScreen;