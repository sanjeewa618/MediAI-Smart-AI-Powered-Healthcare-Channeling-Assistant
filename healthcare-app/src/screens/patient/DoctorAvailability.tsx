import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, Dimensions, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { ChevronLeft, Search, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../../components/BottomNavBar';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type NavProp = StackNavigationProp<RootStackParamList, 'DoctorAvailability'>;

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital?: string;
}

  const DoctorAvailability = () => {
    const navigation = useNavigation<NavProp>();
    const { token } = useAuth();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/doctor`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setDoctors(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setLoading(false);
      }
    };
      const fetchSpecialties = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/doctor/specialties`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            const specNames = data.data.map((s: any) => s.name);
            setCategories(['All', ...specNames]);
          }
        } catch (err) {
          console.error('Failed to fetch specialties:', err);
        }
      };
      
      if (token) {
        fetchDoctors();
        fetchSpecialties();
      } else {
        setLoading(false);
      }
    }, [token]);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      (doc.specialization && doc.specialization.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <View style={[styles.card, SHADOWS.medium]}>
      <View style={styles.cardHeader}>
        <View style={styles.docMainInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.textGroup}>
            <Text style={styles.docName}>{item.name}</Text>
            <Text style={styles.docSpecialty}>{item.specialization || 'General Physician'}</Text>
            {item.hospital && <Text style={styles.docHospital}>{item.hospital}</Text>}
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.bookBtn}
        onPress={() => navigation.navigate('DoctorAvailabilityCalendar', {
          doctorId: item._id,
          doctorName: item.name,
          specialty: item.specialization || 'General Physician'
        })}
      >
        <LinearGradient
          colors={['#724CF9', '#5E3BEE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBtn}
        >
          <Text style={styles.bookBtnText}>Book Appointment Instantly</Text>
          <ArrowRight size={18} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.container}>
        <LinearGradient colors={['#8B3DFF', '#5F0FFF']} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={28} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Real-Time Availability</Text>
              <Text style={styles.headerSub}>Find available doctors</Text>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Search size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search availability by doctor or specialty..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </LinearGradient>

        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((category, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.categoryChip, 
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredDoctors}
            keyExtractor={(item) => item._id}
            renderItem={renderDoctorCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.upcomingFeatureContainer}>
                <Text style={styles.upcomingFeatureText}>No Doctors Found</Text>
                <Text style={styles.upcomingFeatureSubText}>
                  {searchQuery
                    ? `No doctors match "${searchQuery}"${selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.`
                    : `There are no doctors available in ${selectedCategory} right now.`}
                </Text>
              </View>
            )}
          />
        )}
      </View>
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
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
    marginBottom: 20
  },
  backBtn: {
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 16,
  },
  searchInput: { flex: 1, marginLeft: 10, color: '#111827', fontSize: 14 },
  categoriesContainer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 10
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563'
  },
  categoryTextActive: {
    color: '#FFFFFF'
  },
  upcomingFeatureContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  upcomingFeatureText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  upcomingFeatureSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  docMainInfo: {
    flexDirection: 'row',
    flex: 1
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  textGroup: {
    flex: 1,
    justifyContent: 'center'
  },
  docName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4
  },
  docSpecialty: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4
  },
  docHospital: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  bookBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8
  }
});

export default DoctorAvailability;
