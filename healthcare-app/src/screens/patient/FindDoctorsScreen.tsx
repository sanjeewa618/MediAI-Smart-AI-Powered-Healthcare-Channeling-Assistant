import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Image, Platform } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../../theme/theme';
import { Search, Filter, Star, Clock, ChevronLeft } from 'lucide-react-native';
import { CustomInput } from '../../components/CustomInput';
import BottomNavBar from '../../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';

const doctors = [
  { id: '1', name: 'Dr. Saman Perera', specialty: 'Cardiologist', rating: 4.9, reviews: 120, image: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png' },
  { id: '2', name: 'Dr. Nilmini Silva', specialty: 'Neurologist', rating: 4.8, reviews: 85, image: 'https://img.icons8.com/bubbles/100/000000/doctor-female.png' },
  { id: '3', name: 'Dr. Ajith Kumara', specialty: 'General Physician', rating: 4.7, reviews: 210, image: 'https://img.icons8.com/bubbles/100/000000/doctor-male.png' },
  { id: '4', name: 'Dr. Priya Fernando', specialty: 'Pediatrician', rating: 4.9, reviews: 95, image: 'https://img.icons8.com/bubbles/100/000000/doctor-female.png' },
];

const FindDoctorsScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <LinearGradient colors={['#8B3DFF', '#5F0FFF']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={28} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Find Doctors</Text>
              <Text style={styles.headerSub}>Expert medical professionals</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.searchSection}>
          <CustomInput 
            placeholder="Search doctor, hospital..." 
            icon="Search" 
            containerStyle={{ flex: 1, marginBottom: 0 }} 
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.catSection}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
            {['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Dental', 'Eye'].map((cat, idx) => (
              <TouchableOpacity key={cat} style={[styles.catItem, idx === 0 && styles.activeCat]}>
                <Text style={[styles.catText, idx === 0 && styles.activeCatText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.doctorList}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.docCard, SHADOWS.small]}>
              <Image source={{ uri: item.image }} style={styles.docImg} />
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{item.name}</Text>
                <Text style={styles.docSpec}>{item.specialty}</Text>
                <View style={styles.docMeta}>
                  <View style={styles.ratingRow}>
                    <Star size={14} color="#FACC15" fill="#FACC15" />
                    <Text style={styles.ratingText}>{item.rating} ({item.reviews} reviews)</Text>
                  </View>
                  <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('BookAppointment')}>
                    <Text style={styles.bookBtnText}>Book</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />

        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  wrapper: { flex: 1 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  searchSection: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20, marginTop: 20 },
  filterBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  catSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textHeader, marginLeft: 20, marginBottom: 12 },
  catList: { paddingHorizontal: 20 },
  catItem: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.white, marginRight: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  activeCat: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontWeight: '600', color: COLORS.textSecondary },
  activeCatText: { color: COLORS.white },
  doctorList: { padding: 20 },
  docCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 12, flexDirection: 'row', marginBottom: 16 },
  docImg: { width: 90, height: 90, borderRadius: 16, marginRight: 16 },
  docInfo: { flex: 1, justifyContent: 'center' },
  docName: { fontSize: 16, fontWeight: '700', color: COLORS.textHeader },
  docSpec: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  docMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontSize: 12, color: COLORS.textSecondary },
  bookBtn: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10 },
  bookBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 }
});

export default FindDoctorsScreen;
