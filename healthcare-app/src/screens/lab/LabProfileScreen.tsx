import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Platform, Image, Switch, Modal, TextInput, Alert
} from 'react-native';
import {
  ChevronLeft, Bell, Edit2, Camera, Mail, Phone,
  MapPin, Calendar, Award, Clock, Shield, ChevronRight,
  Star, Activity, FileText, LogOut, Settings, User, X, Trash2, Plus
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import NurseBottomNavBar from '../../components/NurseBottomNavBar';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const STATIC_PROFILE_DATA = {
  photo: 'https://img.icons8.com/bubbles/200/000000/user-female.png',
  rating: 4.8,
  totalTests: 1284,
  completedThisMonth: 48,
  certifications: ['BMLS Certified', 'Phlebotomy Expert', 'BLS Certified'],
};

const MENU_ITEMS = [
  { icon: FileText, label: 'My Reports', sublabel: 'View submitted reports', color: COLORS.primary, bg: COLORS.primaryLight, screen: 'LabReports' },
  { icon: Calendar, label: 'My Schedule', sublabel: 'Manage shift schedules', color: '#10B981', bg: '#ECFDF5', screen: 'LabScheduling' },
  { icon: Settings, label: 'Account Settings', sublabel: 'Notifications & preferences', color: '#6366F1', bg: '#EEF2FF', screen: null },
  { icon: Award, label: 'Certifications', sublabel: '3 active certifications', color: '#F59E0B', bg: '#FEF9C3', screen: null },
  { icon: Shield, label: 'Privacy & Security', sublabel: 'Password and 2FA', color: '#EF4444', bg: '#FEE2E2', screen: null },
];

const LabProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { token, role } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [onDuty, setOnDuty] = useState(true);

  const [profileInfo, setProfileInfo] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Hematology & Pathology',
    hospital: 'City Hospital, Colombo 07',
    staffId: 'NUR-2021-0047',
    experienceYears: '5',
    joined: 'March 15, 2021',
    shift: '08:00 AM – 04:00 PM',
    photo: '',
    certifications: [] as string[],
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [certificationsModalVisible, setCertificationsModalVisible] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalTestsDone: 0,
    completedThisMonth: 0,
    accuracy: '99.2%',
    rating: '4.8★',
  });

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Certifications input state
  const [newCertText, setNewCertText] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data) {
        setProfileInfo({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || 'Hematology & Pathology',
          hospital: data.hospital || 'City Hospital, Colombo 07',
          staffId: data.staffId || 'NUR-2021-0047',
          experienceYears: data.experienceYears ? String(data.experienceYears) : '5',
          joined: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'March 15, 2021',
          shift: '08:00 AM – 04:00 PM',
          photo: data.photo || '',
          certifications: data.certifications || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch nurse profile:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/nurse/profile/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStats({
          totalTestsDone: data.data.totalTestsDone || 0,
          completedThisMonth: data.data.completedThisMonth || 0,
          accuracy: data.data.accuracy || '99.2%',
          rating: (data.data.rating || '4.8') + '★',
        });
      }
    } catch (err) {
      console.error('Failed to fetch nurse stats:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchStats();
    }
  }, [token]);

  const saveProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/nurse/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileInfo)
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
        setEditModalVisible(false);
        fetchProfile();
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Save Profile Error:', err);
      Alert.alert('Error', 'Network error while updating profile.');
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Permission to access gallery is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await handleUploadAvatar(asset.uri);
      }
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleUploadAvatar = async (uri: string) => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('avatar', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: type,
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/nurse/profile/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProfileInfo((prev) => ({ ...prev, photo: data.photo }));
        Alert.alert('Success', 'Profile picture updated successfully!');
        fetchProfile();
      } else {
        Alert.alert('Upload Failed', data.message || 'Could not upload profile picture.');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'Something went wrong while uploading profile picture.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Password changed successfully!');
        setPasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert('Error', 'Network error changing password.');
    }
  };

  const handleAddCertification = async () => {
    if (!newCertText.trim()) return;
    const updatedCerts = [...profileInfo.certifications, newCertText.trim()];
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/nurse/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileInfo,
          certifications: updatedCerts
        })
      });
      const data = await response.json();
      if (response.ok) {
        setProfileInfo((prev) => ({ ...prev, certifications: updatedCerts }));
        setNewCertText('');
        Alert.alert('Success', 'Certification added successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to add certification.');
      }
    } catch (error) {
      console.error('Add cert error:', error);
      Alert.alert('Error', 'Network error adding certification.');
    }
  };

  const handleRemoveCertification = async (index: number) => {
    const updatedCerts = profileInfo.certifications.filter((_, idx) => idx !== index);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/nurse/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profileInfo,
          certifications: updatedCerts
        })
      });
      const data = await response.json();
      if (response.ok) {
        setProfileInfo((prev) => ({ ...prev, certifications: updatedCerts }));
        Alert.alert('Success', 'Certification removed.');
      } else {
        Alert.alert('Error', data.message || 'Failed to remove certification.');
      }
    } catch (error) {
      console.error('Remove cert error:', error);
      Alert.alert('Error', 'Network error removing certification.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header Gradient */}
        <LinearGradient colors={COLORS.screenHeaderGradient as any} style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Bell size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={{ 
                  uri: profileInfo.photo 
                    ? (profileInfo.photo.startsWith('http') ? profileInfo.photo : `${API_BASE_URL}${profileInfo.photo}`) 
                    : STATIC_PROFILE_DATA.photo 
                }} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage}>
                <Camera size={16} color="#FFF" />
              </TouchableOpacity>
              {onDuty && <View style={styles.onDutyDot} />}
            </View>
            <Text style={styles.profileName}>{profileInfo.name || 'Nurse'}</Text>
            <Text style={styles.profileRole}>{role === 'nurse' ? 'Senior Lab Nurse' : 'Lab Technician'}</Text>
            <View style={styles.deptBadge}>
              <Text style={styles.deptBadgeText}>{profileInfo.department}</Text>
            </View>

            {/* On Duty Toggle */}
            <View style={styles.dutyToggle}>
              <Text style={styles.dutyLabel}>{onDuty ? '🟢 On Duty' : '⚪ Off Duty'}</Text>
              <Switch
                value={onDuty}
                onValueChange={setOnDuty}
                trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#10B981' }}
                thumbColor="#FFF"
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Tests Done', value: String(stats.totalTestsDone), icon: Activity, color: COLORS.primary },
            { label: 'This Month', value: String(stats.completedThisMonth), icon: Calendar, color: '#10B981' },
            { label: 'Accuracy', value: stats.accuracy, icon: Shield, color: '#6366F1' },
            { label: 'Rating', value: stats.rating, icon: Star, color: '#F59E0B' },
          ].map((stat, idx) => (
            <View key={idx} style={[styles.statCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }]}>
              <View style={[styles.statIconBox, { backgroundColor: stat.color + '18' }]}>
                <stat.icon size={16} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }]}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.infoCardTitle}>Personal Information</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditModalVisible(true)}>
              <Edit2 size={14} color={COLORS.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {[
            { icon: Mail, label: 'Email', value: profileInfo.email, color: COLORS.primary },
            { icon: Phone, label: 'Phone', value: profileInfo.phone, color: '#10B981' },
            { icon: MapPin, label: 'Location', value: profileInfo.hospital, color: '#6366F1' },
            { icon: Calendar, label: 'Joined', value: profileInfo.joined, color: '#F59E0B' },
            { icon: Clock, label: 'Shift', value: profileInfo.shift, color: '#EF4444' },
            { icon: User, label: 'Employee ID', value: profileInfo.staffId, color: '#0EA5E9' },
            { icon: Award, label: 'Experience Years', value: `${profileInfo.experienceYears} Years`, color: '#F59E0B' },
          ].map((item, idx) => (
            <View key={idx} style={styles.infoRow}>
              <View style={[styles.infoIconBox, { backgroundColor: item.color + '15' }]}>
                <item.icon size={15} color={item.color} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Certifications */}
        <View style={[styles.certCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={styles.certTitle}>Certifications</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => setCertificationsModalVisible(true)}>
              <Plus size={12} color={COLORS.primary} />
              <Text style={styles.editBtnText}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.certList}>
            {profileInfo.certifications && profileInfo.certifications.length > 0 ? (
              profileInfo.certifications.map((cert, idx) => (
                <View key={idx} style={styles.certBadge}>
                  <Award size={12} color={COLORS.primary} />
                  <Text style={styles.certText}>{cert}</Text>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic' }}>No certifications added yet.</Text>
            )}
          </View>
        </View>

        {/* Notifications Toggle */}
        <View style={[styles.infoCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Push Notifications</Text>
              <Text style={styles.toggleSub}>Receive alerts for new tests & updates</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuCard, { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }]}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.menuItem, idx < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              onPress={() => {
                if (item.screen) {
                  navigation.navigate(item.screen);
                } else if (item.label === 'Privacy & Security') {
                  setPasswordModalVisible(true);
                } else if (item.label === 'Certifications') {
                  setCertificationsModalVisible(true);
                } else if (item.label === 'Account Settings') {
                  setEditModalVisible(true);
                }
              }}
            >
              <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                <item.icon size={18} color={item.color} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSublabel}>{item.sublabel}</Text>
              </View>
              <ChevronRight size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn', params: { role: 'nurse' } }],
          })}
        >
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.2 (Beta)</Text>
        <View style={{ height: 20 }} />
      </ScrollView>

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
            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={profileInfo.name}
                  onChangeText={(t) => setProfileInfo({ ...profileInfo, name: t })}
                />
              </View>
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
                <Text style={styles.inputLabel}>Department</Text>
                <TextInput
                  style={styles.input}
                  value={profileInfo.department}
                  onChangeText={(t) => setProfileInfo({ ...profileInfo, department: t })}
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
                <Text style={styles.inputLabel}>Employee ID (Staff ID)</Text>
                <TextInput
                  style={styles.input}
                  value={profileInfo.staffId}
                  onChangeText={(t) => setProfileInfo({ ...profileInfo, staffId: t })}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Experience Years</Text>
                <TextInput
                  style={styles.input}
                  value={profileInfo.experienceYears}
                  onChangeText={(t) => setProfileInfo({ ...profileInfo, experienceYears: t })}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
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
            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder="Enter current password"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Enter new password"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm new password"
                />
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword}>
                <Text style={styles.saveBtnText}>Update Password</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Certifications Management Modal */}
      <Modal visible={certificationsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSmall}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Certifications</Text>
              <TouchableOpacity onPress={() => setCertificationsModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#1F2937" />
              </TouchableOpacity>
            </View>
            <View style={{ maxHeight: 400 }}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newCertText}
                  onChangeText={setNewCertText}
                  placeholder="Add new certification"
                />
                <TouchableOpacity 
                  style={[styles.saveBtn, { marginTop: 0, paddingHorizontal: 16, justifyContent: 'center' }]} 
                  onPress={handleAddCertification}
                >
                  <Plus size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.inputLabel, { marginBottom: 10 }]}>Active Certifications</Text>
              
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                {profileInfo.certifications && profileInfo.certifications.length > 0 ? (
                  profileInfo.certifications.map((cert, idx) => (
                    <View 
                      key={idx} 
                      style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        paddingVertical: 12, 
                        paddingHorizontal: 16, 
                        backgroundColor: '#F8FAFC', 
                        borderRadius: 12, 
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: '#E2E8F0'
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Award size={16} color={COLORS.primary} />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textHeader, flex: 1 }} numberOfLines={1}>{cert}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveCertification(idx)}>
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>
                    No certifications added yet.
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 120 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 36,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  avatarSection: { alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatar: { width: 100, height: 100, borderRadius: 30, borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },
  cameraBtn: { position: 'absolute', bottom: -4, right: -4, width: 30, height: 30, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  onDutyDot: { position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFF' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  profileRole: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },
  deptBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  deptBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  dutyToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  dutyLabel: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  statCard: { backgroundColor: '#FFF', padding: 14, borderRadius: 20, width: '47%', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  statIconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.textHeader },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  infoCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  infoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  infoCardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textHeader },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  editBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: 14, color: COLORS.textHeader, fontWeight: '700', marginTop: 2 },
  certCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  certTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textHeader, marginBottom: 14 },
  certList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  certBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
  certText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textHeader },
  toggleSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  menuCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 16, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIconBox: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: COLORS.textHeader },
  menuSublabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, marginTop: 16, paddingVertical: 16, borderRadius: 20, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { fontSize: 16, fontWeight: '800', color: '#EF4444' },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, marginTop: 16 },

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
    maxHeight: '90%',
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
    paddingBottom: 20,
  },
  inputGroup: {
    gap: 6,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default LabProfileScreen;
