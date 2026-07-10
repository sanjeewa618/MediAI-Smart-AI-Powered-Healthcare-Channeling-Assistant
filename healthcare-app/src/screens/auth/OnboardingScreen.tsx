import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Check, ArrowUpRight, Bot, Activity, Shield } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type OnboardingScreenProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

// Staggered Entrance Animation Component with Scale and Rotation
const StaggeredView = ({
  children,
  delay = 0,
  active,
  style,
  rotate,
}: {
  children: React.ReactNode;
  delay: number;
  active: boolean;
  style?: any;
  rotate?: string;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-35)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (active) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 500,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          delay: delay,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -35,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [active]);

  const transformStyles = [
    { translateY: translateYAnim },
    { scale: scaleAnim },
  ];

  if (rotate) {
    transformStyles.push({ rotate } as any);
  }

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: transformStyles,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (activeIndex < 2) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * width,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.navigate('SignIn');
    }
  };

  const handleSkip = () => {
    navigation.navigate('SignIn');
  };

  const handleScroll = (event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <LinearGradient colors={['#724CF9', '#5E3BEE']} style={styles.container}>
      {/* Skip Button */}
      {activeIndex < 2 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        style={[
          styles.scrollView,
          { backgroundColor: activeIndex === 2 ? '#F6F5FB' : 'transparent' }
        ]}
      >
        {/* SLIDE 1: Welcome Slide */}
        <View style={styles.slide}>
          <StaggeredView delay={100} active={activeIndex === 0}>
            <View style={styles.logoAndTitle}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/app-logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandName}>MediAI</Text>
              <Text style={styles.tagline}>
                Smart AI Powered{"\n"}Healthcare & Channeling{"\n"}Assistant
              </Text>
            </View>
          </StaggeredView>

          <StaggeredView delay={300} active={activeIndex === 0}>
            <View style={styles.illustrationWrap}>
              {/* Decorative background blobs */}
              <View style={styles.blob1} />
              <View style={styles.blob2} />
              <View style={styles.blob3} />

              <Image
                source={require('../../../assets/welcome-image.png')}
                style={[styles.illustration, { opacity: 0.95 }]}
                resizeMode="contain"
              />
            </View>
          </StaggeredView>

          <StaggeredView delay={500} active={activeIndex === 0}>
            <View style={styles.bottomTextContainer}>
              <Text style={styles.footerText}>Your Health, Our Priority</Text>
              <Text style={styles.footerTextBold}>AI Care For Everyone</Text>
            </View>
          </StaggeredView>

          <View style={styles.slide1BottomSpacer} />
        </View>

        {/* SLIDE 2: Doctor Booking Cards Slide */}
        <View style={styles.slide}>
          <View style={styles.slide2Container}>
            <View style={styles.gridContainer}>
              {/* Left Column */}
              <View style={styles.gridColumn}>
                {/* Card 1: Caring from Afar */}
                <StaggeredView
                  delay={100}
                  active={activeIndex === 1}
                  style={[styles.card, styles.whiteCard, styles.tiltedCard]}
                  rotate="-6deg"
                >
                  <View style={styles.checkCircle}>
                    <Check color="#FFFFFF" size={16} strokeWidth={3} />
                  </View>
                  <Text style={styles.cardTitleDark}>
                    Caring from Afar.{"\n"}Your health, our{"\n"}priority
                  </Text>
                </StaggeredView>

                {/* Card 3: Skeleton Loader lines */}
                <StaggeredView
                  delay={400}
                  active={activeIndex === 1}
                  style={[styles.card, styles.translucentCard, styles.skeletonCard]}
                >
                  <View style={styles.skeletonLineContainer}>
                    <View style={[styles.skeletonLine, { width: '80%' }]} />
                    <View style={[styles.skeletonLine, { width: '55%' }]} />
                    <View style={[styles.skeletonLine, { width: '40%' }]} />
                  </View>
                </StaggeredView>
              </View>

              {/* Right Column */}
              <View style={[styles.gridColumn, { marginTop: 25 }]}>
                {/* Card 2: Discover doctors */}
                <StaggeredView
                  delay={250}
                  active={activeIndex === 1}
                  style={[styles.card, styles.translucentCard]}
                >
                  <View style={styles.outlineCircle} />
                  <Text style={styles.cardTitleLight}>
                    Discover trusted doctors, book slots, access prescriptions, and get care.
                  </Text>
                </StaggeredView>

                {/* Card 4: Doctor Card */}
                <StaggeredView
                  delay={550}
                  active={activeIndex === 1}
                  style={{ width: '100%' }}
                >
                  <TouchableOpacity
                    style={[styles.card, styles.whiteCard, styles.doctorCard]}
                    onPress={() => navigation.navigate('SignIn')}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={require('../../../assets/gemini2.png')}
                      style={styles.doctorImage}
                      resizeMode="cover"
                    />
                    <View style={styles.doctorCardHeader}>
                      <ArrowUpRight color="#724CF9" size={18} strokeWidth={2.5} />
                      <Text style={styles.doctorCardText}>
                        Meet our{"\n"}specialist
                      </Text>
                    </View>
                  </TouchableOpacity>
                </StaggeredView>
              </View>
            </View>

            <StaggeredView delay={700} active={activeIndex === 1} style={{ width: '100%', marginTop: 'auto', marginBottom: 10 }}>
              <Text style={styles.slide2Slogan}>
                Book Your Doctor Any Time Any where!
              </Text>
            </StaggeredView>
          </View>
          <View style={styles.slideBottomSpacer} />
        </View>

        {/* SLIDE 3: Health Ease Slide */}
        <View style={[styles.slide, styles.lightSlide]}>
          {/* Header */}
          <StaggeredView delay={100} active={activeIndex === 2} style={styles.slide3HeaderContainer}>
            <View style={styles.slide3Header}>
              <View>
                <Text style={styles.slide3Title}>Manage Your</Text>
                <Text style={styles.slide3Title}>Health with</Text>
                <View style={styles.slide3TitleRow}>
                  <Text style={styles.slide3Title}>MediAI</Text>
                  <Activity color="#4E21E2" size={28} strokeWidth={3} style={styles.pulseIcon} />
                </View>
              </View>
            </View>
          </StaggeredView>

          {/* Doctor Image & Cards Container */}
          <View style={styles.slide3ContentContainer}>
            {/* Doctor Image (gemini1.png is the female doctor in lab coat) */}
            <Image
              source={require('../../../assets/doctor1.png')}
              style={styles.slide3DoctorImage}
              resizeMode="contain"
            />

            {/* Overlapping Cards Container */}
            <View style={styles.slide3CardsContainer}>
              {/* Card A: Consult AI */}
              <StaggeredView delay={250} active={activeIndex === 2} style={[styles.slide3Card, styles.cardStrengthen]}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.slide3CardTitle}>Consult AI</Text>
                  <View style={styles.cardHeaderIconBg}>
                    <Activity color="#200D60" size={16} strokeWidth={2.5} />
                  </View>
                </View>
                <Text style={styles.slide3CardDescription}>
                  Describe symptoms & get instant clinical guidance from our advanced medical bot.
                </Text>
              </StaggeredView>

              {/* Card B: Book Doctors */}
              <StaggeredView delay={450} active={activeIndex === 2} style={[styles.slide3Card, styles.cardSafeguard]} rotate="5deg">
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.slide3CardTitle}>Book Doctors</Text>
                  <View style={styles.cardHeaderIconBg}>
                    <Shield color="#4E21E2" size={16} strokeWidth={2.5} />
                  </View>
                </View>
                <Text style={styles.slide3CardDescriptionLight}>
                  Schedule instant appointments with top doctors and medical specialists near you.
                </Text>
              </StaggeredView>
            </View>
          </View>

          <View style={styles.slideBottomSpacer} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Fixed Navigation Controls */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {[0, 1, 2].map((index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1.0, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { 
                    width: dotWidth, 
                    opacity, 
                    backgroundColor: activeIndex === 2 ? '#724CF9' : '#FFFFFF' 
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            activeIndex === 2 ? styles.actionButtonDark : null
          ]} 
          onPress={handleNext}
        >
          {activeIndex === 2 ? (
            <>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
              <View style={styles.getStartedArrowBg}>
                <ArrowUpRight color="#4E21E2" size={20} strokeWidth={2.5} />
              </View>
            </>
          ) : (
            <Text style={styles.actionButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 45,
    right: 25,
    zIndex: 100,
    padding: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.85,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    height: '100%',
    paddingTop: height * 0.08,
    alignItems: 'center',
  },
  logoAndTitle: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 70,
    height: 70,
  },
  brandName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
    opacity: 0.95,
    fontWeight: '500',
  },
  illustrationWrap: {
    flex: 1,
    width: '100%',
    maxHeight: height * 0.30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
    marginTop: 18,
  },
  blob1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#8E74FF',
    top: '10%',
    left: -10,
    opacity: 0.45,
  },
  blob2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#724CF9',
    bottom: '-10%',
    right: -30,
    opacity: 0.55,
  },
  blob3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#A58BFF',
    top: '30%',
    right: -10,
    opacity: 0.35,
  },
  illustration: {
    width: 230,
    height: 230,
    borderRadius: 115,
    zIndex: 10,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#FFFFFF',
  },
  bottomTextContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  footerTextBold: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 5,
  },
  slide1BottomSpacer: {
    height: 210,
  },
  slideBottomSpacer: {
    height: 180,
  },
  slide2Container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: height * 0.02,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.9,
    marginTop: 15,
  },
  gridColumn: {
    width: '47.5%',
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    minHeight: 140,
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  translucentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tiltedCard: {
    zIndex: 5,
    minHeight: 180,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#724CF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleDark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E1E66',
    lineHeight: 22,
    marginTop: 5,
  },
  outlineCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 10,
  },
  cardTitleLight: {
    fontSize: 14.5,
    color: '#FFFFFF',
    lineHeight: 19,
    opacity: 0.95,
  },
  skeletonCard: {
    justifyContent: 'center',
    minHeight: 140,
  },
  skeletonLineContainer: {
    gap: 8,
  },
  skeletonLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  doctorCard: {
    height: 220,
    overflow: 'hidden',
    position: 'relative',
    padding: 0,
  },
  doctorCardHeader: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
    gap: 4,
  },
  doctorImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  doctorCardText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3B1E9E',
    lineHeight: 16,
  },
  slide2Slogan: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    lineHeight: 34,
    paddingHorizontal: 15,
  },
  slide3Slogan: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 25,
    lineHeight: 32,
    paddingHorizontal: 20,
  },
  bottomSection: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 35 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  slide3TitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseIcon: {
    marginLeft: 4,
    marginTop: 2,
  },
  slide3ContentContainer: {
    width: '100%',
    height: height * 0.58,
    position: 'relative',
    marginTop: -10,
  },
  slide3DoctorImage: {
    position: 'absolute',
    bottom: 10,
    right: -width * 0.12,
    width: width * 0.9,
    height: height * 0.58,
  },
  slide3CardsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    zIndex: 10,
    gap: 15,
  },
  slide3Card: {
    width: width * 0.48,
    minHeight: 196,
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardStrengthen: {
    backgroundColor: '#200D60',
  },
  cardSafeguard: {
    backgroundColor: '#4E21E2',
    marginTop: -20,
    marginLeft: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slide3CardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardHeaderIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide3CardDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 16,
  },
  slide3CardDescriptionLight: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  actionButtonDark: {
    backgroundColor: '#4E21E2',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    width: width * 0.85,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#5E3BEE',
    fontSize: 18,
    fontWeight: '700',
  },
  lightSlide: {
    backgroundColor: '#F6F5FB',
  },
  slide3HeaderContainer: {
    width: '100%',
    paddingHorizontal: 25,
    alignItems: 'flex-start',
    marginTop: 10,
  },
  slide3Header: {
    alignItems: 'flex-start',
  },
  slide3Title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 38,
  },
  getStartedArrowBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 6,
  },
});

export default OnboardingScreen;
