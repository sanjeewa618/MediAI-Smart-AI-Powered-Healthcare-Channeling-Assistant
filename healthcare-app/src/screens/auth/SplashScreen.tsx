import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../theme/theme';

type SplashNav = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashNav>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1400);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient colors={COLORS.gradientPrimary} style={styles.container}>
      <View style={styles.center}>
        <View style={styles.logoWrap}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brand}>MediAI</Text>
        <Text style={styles.tagline}>Smart AI Healthcare Assistant</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 64,
    height: 64,
  },
  brand: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
});

export default SplashScreen;
