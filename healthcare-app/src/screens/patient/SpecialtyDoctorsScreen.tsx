import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar } from 'react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { ArrowLeft, Star, Clock, ChevronRight, MapPin, Award } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

type SpecialtyDoctorsRouteProp = RouteProp<RootStackParamList, 'SpecialtyDoctors'>;
type SpecialtyDoctorsNavigationProp = StackNavigationProp<RootStackParamList, 'SpecialtyDoctors'>;

const SpecialtyDoctorsScreen = () => {
  const navigation = useNavigation<SpecialtyDoctorsNavigationProp>();
  const route = useRoute<SpecialtyDoctorsRouteProp>();
  const { specialty } = route.params;

  // Dummy data for doctors based on specialty
  const doctors = [
    {
      id: '1',
      name: 'Dr. James Robinson',
      specialty: specialty,
      experience: '12 Years',
      rating: 4.8,
      reviews: 120,
      image: 'https://img.freepik.com/free-photo/doctor-offering-medical-teleconsultation_23-2149329007.jpg',
      hospital: 'City Central Hospital'
    },
    {
      id: '2',
      name: 'Dr. Sarah Mitchell',
      specialty: specialty,
      experience: '8 Years',
      rating: 4.9,
      reviews: 85,
      image: 'https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg',
      hospital: 'MediCare Plus'
    },
    {
      id: '3',
      name: 'Dr. Robert Wilson',
      specialty: specialty,
      experience: '15 Years',
      rating: 4.7,
      reviews: 210,
      image: 'https://img.freepik.com/free-photo/medium-shot-male-doctor-with-stethoscope_23-2148821615.jpg',
      hospital: 'General Wellness Center'
    },
    {
      id: '4',
      name: 'Dr. Emily Chen',
      specialty: specialty,
      experience: '10 Years',
      rating: 4.9,
      reviews: 150,
      image: 'https://img.freepik.com/free-photo/smiling-female-doctor-white-coat-standing-with-arms-crossed-hospital-corridor_651396-63.jpg',
      hospital: 'Apex Medical Group'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={COLORS.screenHeaderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{specialty} Specialists</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <LinearGradient
            colors={COLORS.screenHeaderGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerGradient}
          >
            <View>
              <Text style={styles.bannerTitle}>Find the Best {specialty} Care</Text>
              <Text style={styles.bannerSubtitle}>Consult with top-rated specialists in your area.</Text>
            </View>
            <Award size={48} color="rgba(255,255,255,0.3)" style={styles.bannerIcon} />
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Available Doctors ({doctors.length})</Text>

        {doctors.map((doctor) => (
          <TouchableOpacity 
            key={doctor.id} 
            style={styles.doctorCard}
            onPress={() => navigation.navigate('DoctorAvailability', { specialty: specialty })}
          >
            <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
            <View style={styles.doctorDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <View style={styles.ratingBox}>
                  <Star size={14} color="#FFB800" fill="#FFB800" />
                  <Text style={styles.ratingText}>{doctor.rating}</Text>
                </View>
              </View>
              <Text style={styles.specialtyText}>{doctor.specialty}</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Clock size={14} color={COLORS.textSecondary} />
                  <Text style={styles.infoText}>{doctor.experience}</Text>
                </View>
                <View style={[styles.infoItem, { marginLeft: 16 }]}>
                  <MapPin size={14} color={COLORS.textSecondary} />
                  <Text style={styles.infoText} numberOfLines={1}>{doctor.hospital}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.availabilityBtn}
                onPress={() => navigation.navigate('DoctorAvailability', { specialty: specialty })}
              >
                <Text style={styles.availabilityBtnText}>Check Availability</Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  infoBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  bannerGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    width: '80%',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    width: '85%',
  },
  bannerIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 16,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  doctorImage: {
    width: 100,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  doctorDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textHeader,
    flex: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 4,
  },
  specialtyText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  availabilityBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  availabilityBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
});

export default SpecialtyDoctorsScreen;
