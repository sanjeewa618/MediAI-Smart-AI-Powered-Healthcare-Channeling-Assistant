import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

const { width, height } = Dimensions.get('window');

type SplashNav = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashNav>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate to Onboarding after 1.8 seconds
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#724CF9', '#5E3BEE']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/app-logo.png')}
            style={styles.logo as any}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brandName}>MediAI</Text>
        <Text style={styles.tagline}>
          Smart AI Powered{"\n"}Healthcare & Channeling{"\n"}Assistant
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 100,
    height: 100,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    opacity: 0.9,
    fontWeight: '500',
  },
});

export default SplashScreen;