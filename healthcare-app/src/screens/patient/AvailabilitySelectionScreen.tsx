import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SHADOWS } from '../../theme/theme';
import { Stethoscope, FlaskConical, ChevronRight, Clock, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../../components/BottomNavBar';

type NavigationProp = StackNavigationProp<RootStackParamList, 'AvailabilitySelection'>;

const AvailabilitySelectionScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#8B3DFF', '#5F0FFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Check Availability</Text>
            <Text style={styles.headerSub}>Select the service type</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.selectionTitle}>Choose Service Type</Text>
        
        <TouchableOpacity 
          style={[styles.selectionCard, SHADOWS.medium]}
          onPress={() => navigation.navigate('DoctorAvailability', {})}
        >
          <View style={[styles.iconBox, { backgroundColor: '#F3F0FF' }]}>
            <Stethoscope size={32} color={COLORS.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Doctor Availability</Text>
            <Text style={styles.cardDesc}>Find available specialists and book your appointment instantly.</Text>
          </View>
          <ChevronRight size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.selectionCard, SHADOWS.medium]}
          onPress={() => navigation.navigate('LabAvailability')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
            <FlaskConical size={32} color="#10B981" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Lab Test Availability</Text>
            <Text style={styles.cardDesc}>Check available slots for blood tests, scans, and other lab services.</Text>
          </View>
          <ChevronRight size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Our real-time system ensures you get the most accurate time slots for all your healthcare needs.
          </Text>
        </View>
      </View>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 20,
  },
  selectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  infoBox: {
    marginTop: 'auto',
    backgroundColor: 'rgba(123, 47, 247, 0.05)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(123, 47, 247, 0.1)',
  },
  infoText: {
    fontSize: 13,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default AvailabilitySelectionScreen;
