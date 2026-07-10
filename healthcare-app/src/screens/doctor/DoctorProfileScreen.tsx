import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, Switch, Image, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Star, Clock, Shield, Bell, LogOut, ChevronRight, Edit3, Phone, Mail, MapPin, Pencil, X, Lock } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../../theme/theme';
import DoctorBottomNavBar from '../../components/DoctorBottomNavBar';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const MENU_ITEMS = [
  { icon: Bell, label: 'Notifications', sub: 'Appointment alerts & reminders', color: '#F59E0B', action: null },
  { icon: Shield, label: 'Change Password', sub: 'Update your security credentials', color: '#10B981', action: 'password' },
  { icon: Clock, label: 'Working Hours', sub: 'Set your availability hours', color: '#3B82F6', action: null },
];

const DoctorProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [doctorName, setDoctorName] = useState('Loading...');
  const [doctorSpec, setDoctorSpec] = useState('Doctor');
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [profileImage, setProfileImage] = useState('https://img.icons8.com/bubbles/100/000000/doctor-male.png');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Profile Info State
  const [profileInfo, setProfileInfo] = useState({
    phone: '',
    email: '',
    hospital: '',
    experienceYears: '0 yrs',
    totalConsultations: '0'
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok && data) {
          const name = data.name || 'Doctor';
          setDoctorName(name.startsWith('Dr.') ? name : `Dr. ${name}`);
          setDoctorSpec(data.specialization || 'General Practitioner');
          setProfileInfo({
            phone: data.phone || '+94 77 123 4567',
            email: data.email || 'dr.saman@mediAI.lk',
            hospital: data.hospital || 'National Hospital, Colombo',
            experienceYears: data.experienceYears || '12 yrs',
            totalConsultations: data.totalConsultations || '1.2k+'
          });
        }
      } catch (err) {
        console.error('Failed to fetch doctor profile:', err);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const saveProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/doctor/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileInfo)
      });
      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
        setEditModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Network error');
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match!');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully!');
        setPasswordModalVisible(false);
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        Alert.alert('Error', data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Network error');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      if (selectedAsset && selectedAsset.uri) {
        setProfileImage(selectedAsset.uri);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#8B3DFF', '#6A11CB']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight size={22} color="#FFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditModalVisible(true)}>
            <Edit3 size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View>
            <Image source={{ uri: profileImage }} style={styles.docAvatarImg} />
            <TouchableOpacity
              style={styles.pencilBadge}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <Pencil size={12} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.docName}>{doctorName}</Text>
            <Text style={styles.docSpec}>{doctorSpec}</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.rating}>4.9</Text>
              <Text style={styles.ratingCount}>· 248 patients</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Online Status Toggle */}
        <View style={[styles.statusCard, SHADOWS.small]}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusDot, { backgroundColor: onlineStatus ? '#10B981' : '#9CA3AF' }]} />
            <View>
              <Text style={styles.statusTitle}>{onlineStatus ? 'Available for Patients' : 'Currently Offline'}</Text>
              <Text style={styles.statusSub}>Toggle your availability status</Text>
            </View>
          </View>
          <Switch
            value={onlineStatus}
            onValueChange={setOnlineStatus}
            trackColor={{ false: '#E5E7EB', true: COLORS.primaryLight }}
            thumbColor={onlineStatus ? COLORS.primary : '#9CA3AF'}
          />
        </View>

        {/* Contact Info */}
        <View style={[styles.section, SHADOWS.small]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <TouchableOpacity
              style={styles.sectionPencilBtn}
              onPress={() => setEditModalVisible(true)}
            >
              <Pencil size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {[
            { icon: Phone, text: profileInfo.phone },
            { icon: Mail, text: profileInfo.email },
            { icon: MapPin, text: profileInfo.hospital },
          ].map((item, i) => (
            <View key={i} style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <item.icon size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.contactText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Experience', value: profileInfo.experienceYears },
            { label: 'Consultations', value: profileInfo.totalConsultations },
            { label: 'Avg. Time', value: '24 min' },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, SHADOWS.small]}>
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={[styles.section, SHADOWS.small]}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuDivider]}
              onPress={() => item.action === 'password' && setPasswordModalVisible(true)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <item.icon size={18} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity 
          style={[styles.logoutBtn, SHADOWS.small]} 
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn', params: { role: 'doctor' } }],
          })}
        >
          <LogOut size={18} color={COLORS.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <DoctorBottomNavBar />
      <NurseBottomNavBar />

      {/* Edit Details Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Info</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={profileInfo.phone}
                  onChangeText={(t) => setProfileInfo({ ...profileInfo, phone: t })}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={profileInfo.email}
                  onChangeText={(t) => setProfileInfo({ ...profileInfo, email: t })}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location (Hospital/Clinic)</Text>
                <TextInput
                  style={styles.input}
                  value={profileInfo.hospital}
                  onChangeText={(t) => setProfileInfo({ ...profileInfo, hospital: t })}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Experience</Text>
                <TextInput
                  style={styles.input}
                  value={profileInfo.experienceYears}
                  onChangeText={(t) => setProfileInfo({ ...profileInfo, experienceYears: t })}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Consultations</Text>
                <TextInput
                  style={styles.input}
                  value={profileInfo.totalConsultations}
                  onChangeText={(t) => setProfileInfo({ ...profileInfo, totalConsultations: t })}
                />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  placeholder="********"
                  onChangeText={(t) => setPasswords({ ...passwords, current: t })}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  placeholder="Enter new password"
                  onChangeText={(t) => setPasswords({ ...passwords, new: t })}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  placeholder="Confirm new password"
                  onChangeText={(t) => setPasswords({ ...passwords, confirm: t })}
                />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={handlePasswordChange}>
                <Text style={styles.saveBtnText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 50, paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  editBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  docAvatarImg: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  pencilBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7C3AED',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8B3DFF',
  },
  profileInfo: { flex: 1 },
  docName: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  docSpec: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  rating: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  ratingCount: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  content: { padding: 16, gap: 14 },
  statusCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  statusSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  section: { backgroundColor: '#FFF', borderRadius: 20, padding: 18 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 0 },
  sectionPencilBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  contactIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  contactText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#FFF', borderRadius: 18, padding: 16, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginTop: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  menuSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  logoutBtn: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#FEE2E2' },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.error },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContentSmall: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default DoctorProfileScreen;
