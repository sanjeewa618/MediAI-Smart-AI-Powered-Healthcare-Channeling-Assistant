import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import {
  ChevronLeft,
  Edit3,
  FileText,
  Clock,
  Heart,
  Shield,
  Bell,
  Lock,
  Phone,
  LogOut,
  ChevronRight,
  VerifiedIcon,
  Droplets,
  AlertTriangle,
  Pill,
  Ruler,
  Activity,
  CheckCircle2,
  Camera,
  Trash2,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../../components/BottomNavBar';
import { COLORS, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

type PatientProfileNavProp = StackNavigationProp<RootStackParamList, 'PatientDashboard'>;

const PatientProfileScreen = () => {
  const navigation = useNavigation<PatientProfileNavProp>();
  const { token } = useAuth();

  const [appointmentReminder, setAppointmentReminder] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isMedicalEditing, setIsMedicalEditing] = useState(false);
  const [isInsuranceEditing, setIsInsuranceEditing] = useState(false);
  const [isBloodGroupModalVisible, setIsBloodGroupModalVisible] = useState(false);
  const [isEmergencyEditing, setIsEmergencyEditing] = useState(false);
  const [isEmergencyModalVisible, setIsEmergencyModalVisible] = useState(false);
  const [newEmergencyName, setNewEmergencyName] = useState('');
  const [newEmergencyRelation, setNewEmergencyRelation] = useState('');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileData, setProfileData] = useState({
    name: 'Sarah Johnson',
    nic: 'XX****-****-1234',
    dob: '15 March 1996',
    gender: 'Female',
    phone: '+94 71 234 5678',
    email: 'sarah@email.com',
    address: '123 Medical Lane, City',
    bloodGroup: 'O+',
    height: '165',
    weight: '62',
    bmi: '22.8',
    allergies: ['Penicillin', 'Peanuts'] as string[],
    chronicConditions: [] as string[],
    emergencyContacts: [
      { name: 'Michael Johnson', relation: 'Brother', phone: '+94 71 987 6543' }
    ] as { name: string, relation: string, phone: string }[],
    insurance: {
      provider: 'National Health Insurance',
      policyNumber: 'POL-2024-056789',
      coverageType: 'Full Coverage',
      expiryDate: '15 Dec 2025',
      documentUrl: ''
    },
    photo: '',
    createdAt: '',
    stats: {
      totalAppointments: 0,
      completedAppointments: 0,
    }
  });

  const calculateAge = (dobString: string) => {
    if (!dobString) return 'N/A';
    let dob = new Date(dobString);
    
    // Fallback parsing for "DD Month YYYY" format on certain JS engines (like Hermes)
    if (isNaN(dob.getTime())) {
      const parts = dobString.split(' ');
      if (parts.length === 3) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = monthNames.findIndex(m => dobString.includes(m));
        if (monthIndex !== -1) {
          const year = parseInt(parts[2]);
          const day = parseInt(parts[0]);
          dob = new Date(year, monthIndex, day);
        }
      }
    }

    if (isNaN(dob.getTime())) return 'N/A';
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getMemberSince = (dateString: string) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const calculateBMI = (weightKg: string, heightCm: string) => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (w > 0 && h > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return '';
  };

  const handleHeightChange = (text: string) => {
    setProfileData(prev => {
      const newBmi = calculateBMI(prev.weight, text);
      return { ...prev, height: text, bmi: newBmi || prev.bmi };
    });
  };

  const handleWeightChange = (text: string) => {
    setProfileData(prev => {
      const newBmi = calculateBMI(text, prev.height);
      return { ...prev, weight: text, bmi: newBmi || prev.bmi };
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      setProfileData(p => ({ ...p, dob: formattedDate }));
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [meRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/patient/stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })
        ]);

        const data = await meRes.json();
        const statsData = statsRes.ok ? await statsRes.json() : null;

        if (meRes.ok && data) {
          setProfileData(prev => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            nic: data.nic || prev.nic,
            dob: data.dob || prev.dob,
            gender: data.gender || prev.gender,
            address: data.address || prev.address,
            bloodGroup: data.bloodGroup || prev.bloodGroup,
            height: data.height ? data.height.toString() : prev.height,
            weight: data.weight ? data.weight.toString() : prev.weight,
            bmi: data.bmi ? data.bmi.toString() : prev.bmi,
            allergies: Array.isArray(data.allergies) ? data.allergies : prev.allergies,
            chronicConditions: Array.isArray(data.chronicConditions) ? data.chronicConditions : prev.chronicConditions,
            emergencyContacts: Array.isArray(data.emergencyContacts) && data.emergencyContacts.length > 0 ? data.emergencyContacts : prev.emergencyContacts,
            insurance: data.insurance || prev.insurance,
            photo: data.photo || prev.photo || '',
            createdAt: data.createdAt || prev.createdAt,
            stats: statsData?.success ? statsData.data : prev.stats,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleUploadInsuranceCard = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Permission to access gallery is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const formData = new FormData();
        const filename = asset.uri.split('/').pop() || 'insurance-card.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('insuranceCard', {
          uri: asset.uri,
          name: filename,
          type: type,
        } as any);

        const uploadRes = await fetch(`${API_BASE_URL}/api/patient/upload-insurance`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.data && uploadData.data.documentUrl) {
            setProfileData(p => ({
              ...p,
              insurance: {
                ...p.insurance,
                documentUrl: uploadData.data.documentUrl
              }
            }));
            Alert.alert('Success', 'Insurance card uploaded successfully!');
          }
        } else {
          Alert.alert('Error', 'Failed to upload insurance card');
        }
      }
    } catch (error) {
      console.error('Image picking/upload error:', error);
      Alert.alert('Error', 'An error occurred while uploading');
    }
  };

  const handlePickProfileImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Permission to access gallery is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const formData = new FormData();
        const filename = asset.uri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('avatar', {
          uri: asset.uri,
          name: filename,
          type: type,
        } as any);

        const response = await fetch(`${API_BASE_URL}/api/patient/profile/upload-avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        });

        const uploadData = await response.json();
        if (response.ok && uploadData.success && uploadData.photo) {
          setProfileData(p => ({
            ...p,
            photo: uploadData.photo
          }));
          Alert.alert('Success', 'Profile picture updated successfully!');
        } else {
          Alert.alert('Error', uploadData.message || 'Failed to upload profile picture');
        }
      }
    } catch (error) {
      console.error('Image picking/upload error:', error);
      Alert.alert('Error', 'An error occurred while uploading');
    }
  };

  const handleAddAllergy = () => {
    const txt = newAllergy.trim();
    if (!txt) return;
    if ((profileData.allergies || []).includes(txt)) {
      setNewAllergy('');
      return;
    }
    setProfileData(p => ({ ...p, allergies: [...(p.allergies || []), txt] }));
    setNewAllergy('');
  };

  const handleAddCondition = () => {
    const txt = newCondition.trim();
    if (!txt) return;
    setProfileData(p => ({ ...p, chronicConditions: [...p.chronicConditions, txt] }));
    setNewCondition('');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Password changed successfully');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred while changing password');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patient/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      if (response.ok) {
        const data = await response.json();
        // Sync local state with the persisted server data so new allergies/conditions
        // remain visible after save and re-renders.
        if (data && data.data) {
          const d = data.data;
          setProfileData(prev => ({
            ...prev,
            allergies: Array.isArray(d.allergies) ? d.allergies : prev.allergies,
            chronicConditions: Array.isArray(d.chronicConditions) ? d.chronicConditions : prev.chronicConditions,
            emergencyContacts: Array.isArray(d.emergencyContacts) ? d.emergencyContacts : prev.emergencyContacts,
            insurance: d.insurance || prev.insurance,
          }));
        }
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
        setIsMedicalEditing(false);
        setIsEmergencyEditing(false);
        setIsInsuranceEditing(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while updating the profile');
      console.error(err);
    }
  };

  const [editReportsModalVisible, setEditReportsModalVisible] = useState(false);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [userReports, setUserReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchUserReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/medical-records`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserReports(data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch reports');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Network error while fetching reports');
    } finally {
      setLoadingReports(false);
    }
  };

  const openEditReportsModal = () => {
    setEditReportsModalVisible(true);
    fetchUserReports();
  };

  const handleDeleteRequest = (id: string) => {
    setSelectedReportId(id);
    setDeletePassword('');
    setConfirmDeleteModalVisible(true);
  };

  const confirmAndDelete = async () => {
    if (!deletePassword) {
      Alert.alert('Error', 'Password is required to delete a report');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/medical-records/${selectedReportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Alert.alert('Success', 'Report successfully deleted');
        setConfirmDeleteModalVisible(false);
        fetchUserReports(); // refresh the list
      } else {
        Alert.alert('Error', data.message || 'Incorrect password or failed to delete');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred during deletion');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: () => {
          navigation.navigate('PatientDashboard');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={COLORS.screenHeaderGradient} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={28} color="#FFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>My Profile</Text>
              <Text style={styles.headerSub}>Medical Identity Dashboard</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Header Card */}
          <View style={[styles.profileCard, SHADOWS.medium]}>
            <View style={styles.profileHeader}>
              <TouchableOpacity onPress={handlePickProfileImage} style={styles.photoContainer}>
                <Image
                  source={profileData.photo ? { uri: `${API_BASE_URL}${profileData.photo}` } : require('../../../assets/robot-avatar.png')}
                  style={styles.profilePhoto}
                />
                <View style={styles.cameraIconBadge}>
                  <Camera size={14} color="#FFF" />
                </View>
              </TouchableOpacity>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.patientName}>{profileData.name}</Text>
                  <VerifiedIcon size={20} color="#10B981" fill="#10B981" />
                </View>
                <Text style={styles.patientId}>ID: MH-2024-08542</Text>
                <View style={styles.badgesRow}>
                  <View style={styles.ageBadge}>
                    <Text style={styles.badgeText}>{calculateAge(profileData.dob)} y/o</Text>
                  </View>
                  <View style={styles.genderBadge}>
                    <Text style={styles.badgeText}>{profileData.gender}</Text>
                  </View>
                  <View style={styles.bloodBadge}>
                    <Text style={styles.bloodBadgeText}>{profileData.bloodGroup}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.profileMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Member Since</Text>
                <Text style={styles.metaValue}>{getMemberSince(profileData.createdAt)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Completed</Text>
                <Text style={styles.metaValue}>{profileData.stats.completedAppointments}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Appointments</Text>
                <Text style={styles.metaValue}>{profileData.stats.totalAppointments}</Text>
              </View>
            </View>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              {isEditing ? (
                <TouchableOpacity onPress={handleSaveProfile}>
                  <CheckCircle2 size={24} color={COLORS.primary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Edit3 size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.infoCard, SHADOWS.small]}>
              <InfoRow label="Full Name" value={profileData.name} isEditing={isEditing} onChangeText={(t) => setProfileData(p => ({ ...p, name: t }))} />
              <View style={styles.infoDivider} />
              <InfoRow label="NIC / Passport" value={profileData.nic} isEditing={isEditing} onChangeText={(t) => setProfileData(p => ({ ...p, nic: t }))} />
              <View style={styles.infoDivider} />
              <InfoRow label="Date of Birth" value={profileData.dob} isEditing={isEditing} onPress={() => setShowDatePicker(true)} />
              {showDatePicker && (
                <DateTimePicker
                  value={profileData.dob ? new Date(profileData.dob) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
              <View style={styles.infoDivider} />
              <InfoRow label="Age" value={`${calculateAge(profileData.dob)} Years`} isEditing={false} onChangeText={() => {}} editable={false} />
              <View style={styles.infoDivider} />
              <InfoRow label="Gender" value={profileData.gender} isEditing={isEditing} onChangeText={(t) => setProfileData(p => ({ ...p, gender: t }))} options={['Male', 'Female', 'Rather not to say']} />
              <View style={styles.infoDivider} />
              <InfoRow label="Mobile Number" value={profileData.phone} isEditing={isEditing} onChangeText={(t) => setProfileData(p => ({ ...p, phone: t }))} />
              <View style={styles.infoDivider} />
              <InfoRow label="Email" value={profileData.email} isEditing={isEditing} onChangeText={(t) => setProfileData(p => ({ ...p, email: t }))} editable={false} />
              <View style={styles.infoDivider} />
              <InfoRow label="Address" value={profileData.address} isEditing={isEditing} onChangeText={(t) => setProfileData(p => ({ ...p, address: t }))} />
            </View>
          </View>

          {/* Medical Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Medical Information</Text>
              {isMedicalEditing ? (
                <TouchableOpacity onPress={handleSaveProfile}>
                  <CheckCircle2 size={24} color={COLORS.primary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setIsMedicalEditing(true)}>
                  <Edit3 size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.medicalCard, SHADOWS.small]}>
              <View style={styles.medicalGrid}>
                <MedicalInfoItem
                  icon={<Droplets size={20} color="#EF4444" />}
                  label="Blood Group"
                  value={profileData.bloodGroup}
                  isEditing={isMedicalEditing}
                  editable={false}
                  onPress={isMedicalEditing ? () => setIsBloodGroupModalVisible(true) : undefined}
                />
                <MedicalInfoItem
                  icon={<Ruler size={20} color="#3B82F6" />}
                  label="Height"
                  value={profileData.height ? `${profileData.height} cm` : ''}
                  isEditing={isMedicalEditing}
                  onChangeText={(text) => handleHeightChange(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
                <MedicalInfoItem
                  icon={<Ruler size={20} color="#3B82F6" />}
                  label="Weight"
                  value={profileData.weight ? `${profileData.weight} kg` : ''}
                  isEditing={isMedicalEditing}
                  onChangeText={(text) => handleWeightChange(text.replace(/[^0-9.]/g, ''))}
                  keyboardType="numeric"
                />
                <MedicalInfoItem
                  icon={<Activity size={20} color="#8B5CF6" />}
                  label="BMI"
                  value={profileData.bmi}
                />
              </View>
              <View style={styles.medicalDivider} />
              {/* Allergies */}
              <View style={styles.allergySection}>
                <View style={styles.allergyHeader}>
                  <AlertTriangle size={18} color="#F59E0B" />
                  <Text style={styles.allergyTitle}>Allergies</Text>
                </View>
                {isMedicalEditing ? (
                  <View>
                    <View style={[styles.allergyBadges, { flexWrap: 'wrap' }]}>
                      {profileData.allergies.map((allergy, index) => (
                        <TouchableOpacity
                          key={`${allergy}-${index}`}
                          style={styles.allergyBadge}
                          onPress={() =>
                            setProfileData(p => ({
                              ...p,
                              allergies: p.allergies.filter((_, i) => i !== index),
                            }))
                          }
                        >
                          <Text style={styles.allergyText}>{allergy}  ✕</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.addRow}>
                      <TextInput
                        style={[styles.addInput, styles.addInputField]}
                        placeholder="Add allergy and press +"
                        placeholderTextColor="#9CA3AF"
                        value={newAllergy}
                        onChangeText={setNewAllergy}
                        onSubmitEditing={handleAddAllergy}
                        returnKeyType="done"
                        blurOnSubmit={false}
                      />
                      <TouchableOpacity style={styles.addBtn} onPress={handleAddAllergy}>
                        <Text style={styles.addBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.allergyBadges, { flexWrap: 'wrap' }]}>
                    {profileData.allergies.length > 0 ? (
                      profileData.allergies.map((allergy, index) => (
                        <View key={`${allergy}-${index}`} style={styles.allergyBadge}>
                          <Text style={styles.allergyText}>{allergy}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No allergies recorded</Text>
                    )}
                  </View>
                )}
              </View>
              <View style={styles.medicalDivider} />
              {/* Chronic Conditions */}
              <View style={styles.chronicSection}>
                <View style={styles.chronicHeader}>
                  <Heart size={18} color="#EF4444" />
                  <Text style={styles.chronicTitle}>Chronic Conditions</Text>
                </View>
                {isMedicalEditing ? (
                  <View>
                    <View style={[styles.allergyBadges, { flexWrap: 'wrap' }]}>
                      {profileData.chronicConditions.map((condition, index) => (
                        <TouchableOpacity
                          key={`${condition}-${index}`}
                          style={[styles.allergyBadge, { backgroundColor: '#FEE2E2' }]}
                          onPress={() =>
                            setProfileData(p => ({
                              ...p,
                              chronicConditions: p.chronicConditions.filter((_, i) => i !== index),
                            }))
                          }
                        >
                          <Text style={[styles.allergyText, { color: '#991B1B' }]}>{condition}  ✕</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.addRow}>
                      <TextInput
                        style={[styles.addInput, styles.addInputField]}
                        placeholder="Add condition and press +"
                        placeholderTextColor="#9CA3AF"
                        value={newCondition}
                        onChangeText={setNewCondition}
                        onSubmitEditing={handleAddCondition}
                        returnKeyType="done"
                        blurOnSubmit={false}
                      />
                      <TouchableOpacity style={styles.addBtn} onPress={handleAddCondition}>
                        <Text style={styles.addBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.allergyBadges, { flexWrap: 'wrap' }]}>
                    {profileData.chronicConditions.length > 0 ? (
                      profileData.chronicConditions.map((condition, index) => (
                        <View key={`${condition}-${index}`} style={[styles.allergyBadge, { backgroundColor: '#FEE2E2' }]}>
                          <Text style={[styles.allergyText, { color: '#991B1B' }]}>{condition}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No chronic conditions recorded</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Emergency Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {isEmergencyEditing && profileData.emergencyContacts.length < 5 && (
                  <TouchableOpacity onPress={() => setIsEmergencyModalVisible(true)} style={styles.addBtnSmall}>
                    <Text style={styles.addBtnTextSmall}>+</Text>
                  </TouchableOpacity>
                )}
                {isEmergencyEditing ? (
                  <TouchableOpacity onPress={handleSaveProfile}>
                    <CheckCircle2 size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setIsEmergencyEditing(true)}>
                    <Edit3 size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {profileData.emergencyContacts.map((contact, index) => (
              <View key={index} style={[styles.emergencyCard, SHADOWS.small, { marginBottom: 12 }]}>
                <View style={styles.emergencyContact}>
                  <View style={styles.emergencyIcon}>
                    <Phone size={24} color="#FFF" />
                  </View>
                  <View style={styles.emergencyInfo}>
                    <Text style={styles.emergencyName}>{contact.name}</Text>
                    <Text style={styles.emergencyRelation}>{contact.relation}</Text>
                  </View>
                  {isEmergencyEditing ? (
                    <TouchableOpacity 
                      style={[styles.emergencyCallBtn, { backgroundColor: '#FEE2E2' }]}
                      onPress={() => setProfileData(p => ({...p, emergencyContacts: p.emergencyContacts.filter((_, i) => i !== index)}))}
                    >
                      <Text style={{color: '#EF4444', fontWeight: '800'}}>✕</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.emergencyCallBtn}>
                      <Phone size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.emergencyPhone}>
                  <Text style={styles.emergencyPhoneLabel}>Phone:</Text>
                  <Text style={styles.emergencyPhoneValue}>{contact.phone}</Text>
                </View>
              </View>
            ))}
            {(!profileData.emergencyContacts || profileData.emergencyContacts.length === 0) && (
              <Text style={styles.noDataText}>No emergency contacts recorded.</Text>
            )}
          </View>

          {/* Insurance Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Insurance Information</Text>
              {isInsuranceEditing ? (
                <TouchableOpacity onPress={handleSaveProfile}>
                  <CheckCircle2 size={24} color={COLORS.primary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setIsInsuranceEditing(true)}>
                  <Edit3 size={18} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.insuranceCard, SHADOWS.small]}>
              <InfoRow 
                label="Insurance Provider" 
                value={profileData.insurance.provider} 
                isEditing={isInsuranceEditing} 
                onChangeText={(t) => setProfileData(p => ({...p, insurance: {...p.insurance, provider: t}}))} 
              />
              <View style={styles.infoDivider} />
              <InfoRow 
                label="Policy Number" 
                value={profileData.insurance.policyNumber} 
                isEditing={isInsuranceEditing} 
                onChangeText={(t) => setProfileData(p => ({...p, insurance: {...p.insurance, policyNumber: t}}))} 
              />
              <View style={styles.infoDivider} />
              <InfoRow 
                label="Coverage Type" 
                value={profileData.insurance.coverageType} 
                isEditing={isInsuranceEditing} 
                onChangeText={(t) => setProfileData(p => ({...p, insurance: {...p.insurance, coverageType: t}}))} 
              />
              <View style={styles.infoDivider} />
              <InfoRow 
                label="Expiry Date" 
                value={profileData.insurance.expiryDate} 
                isEditing={isInsuranceEditing} 
                onChangeText={(t) => setProfileData(p => ({...p, insurance: {...p.insurance, expiryDate: t}}))} 
              />
              <View style={styles.infoDivider} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                <Text style={styles.infoLabel}>Insurance Card</Text>
                {profileData.insurance.documentUrl ? (
                  <Image source={{ uri: `${API_BASE_URL}${profileData.insurance.documentUrl}` }} style={{ width: 60, height: 40, borderRadius: 4 }} />
                ) : (
                  <Text style={styles.noDataText}>No Card Uploaded</Text>
                )}
              </View>

              {isInsuranceEditing && (
                <TouchableOpacity style={styles.uploadInsuranceBtn} onPress={handleUploadInsuranceCard}>
                  <Text style={styles.uploadInsuranceBtnText}>
                    {profileData.insurance.documentUrl ? "Replace Insurance Card" : "Upload Insurance Card"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Notifications & Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications & Preferences</Text>
            <View style={[styles.settingsCard, SHADOWS.small]}>
              <SettingRow
                icon={<Bell size={20} color={COLORS.primary} />}
                label="Appointment Reminders"
                value={appointmentReminder}
                onToggle={setAppointmentReminder}
              />
              <View style={styles.settingDivider} />
              <SettingRow
                icon={<Phone size={20} color={COLORS.primary} />}
                label="SMS Alerts"
                value={smsAlerts}
                onToggle={setSmsAlerts}
              />
              <View style={styles.settingDivider} />
              <SettingRow
                icon={<Bell size={20} color={COLORS.primary} />}
                label="Email Notifications"
                value={emailNotifications}
                onToggle={setEmailNotifications}
              />
            </View>
          </View>

          {/* Security & Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security & Privacy</Text>
            <View style={[styles.securityCard, SHADOWS.small]}>
              <TouchableOpacity style={styles.securityOption} onPress={() => setShowPasswordModal(true)}>
                <Lock size={20} color={COLORS.primary} />
                <Text style={styles.securityLabel}>Change Password</Text>
                <ChevronRight size={20} color="#D1D5DB" />
              </TouchableOpacity>
              <View style={styles.securityDivider} />
              <TouchableOpacity style={styles.securityOption}>
                <Shield size={20} color={COLORS.primary} />
                <Text style={styles.securityLabel}>Two-Factor Authentication</Text>
                <View style={styles.enabledBadge}>
                  <Text style={styles.enabledBadgeText}>Enabled</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.securityDivider} />
              <TouchableOpacity style={styles.securityOption}>
                <Clock size={20} color={COLORS.primary} />
                <Text style={styles.securityLabel}>Login Activity</Text>
                <ChevronRight size={20} color="#D1D5DB" />
              </TouchableOpacity>
              <View style={styles.securityDivider} />
              <TouchableOpacity style={styles.securityOption}>
                <Heart size={20} color={COLORS.primary} />
                <Text style={styles.securityLabel}>Data Privacy Settings</Text>
                <ChevronRight size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Edit Reports Button */}
          <View style={styles.section}>
            <TouchableOpacity style={[styles.logoutBtn, SHADOWS.small, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]} onPress={openEditReportsModal}>
              <FileText size={20} color="#FFF" />
              <Text style={[styles.logoutBtnText, { color: '#FFF' }]}>Edit Medical Reports</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <View style={styles.section}>
            <TouchableOpacity style={[styles.logoutBtn, SHADOWS.small]} onPress={handleLogout}>
              <LogOut size={20} color="#EF4444" />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        <BottomNavBar />
      </View>

      {/* Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Current Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleChangePassword}>
                <Text style={styles.modalSaveBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isBloodGroupModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBloodGroupModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsBloodGroupModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Blood Group</Text>
            <View style={styles.bloodGroupGrid}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <TouchableOpacity
                  key={bg}
                  style={[styles.bloodGroupBtn, profileData.bloodGroup === bg && styles.bloodGroupBtnSelected]}
                  onPress={() => {
                    setProfileData(p => ({ ...p, bloodGroup: bg }));
                    setIsBloodGroupModalVisible(false);
                  }}
                >
                  <Text style={[styles.bloodGroupText, profileData.bloodGroup === bg && styles.bloodGroupTextSelected]}>{bg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Reports Modal */}
      <Modal
        visible={editReportsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditReportsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%', padding: 0 }]}>
            <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.modalTitle, { marginBottom: 0 }]}>My Medical Reports</Text>
              <TouchableOpacity onPress={() => setEditReportsModalVisible(false)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 24, color: '#9CA3AF', fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>
            
            {loadingReports ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: COLORS.textSecondary }}>Loading reports...</Text>
              </View>
            ) : userReports.length === 0 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: COLORS.textSecondary }}>No reports found.</Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1, padding: 20 }}>
                {userReports.map((report: any) => (
                  <View key={report._id} style={[styles.infoCard, SHADOWS.small, { marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textHeader }}>{report.title || 'Medical Report'}</Text>
                      <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>
                        {new Date(report.recordDate || report.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity style={{ padding: 10, backgroundColor: '#FEE2E2', borderRadius: 8 }} onPress={() => handleDeleteRequest(report._id)}>
                      <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Confirm Delete Password Modal */}
      <Modal
        visible={confirmDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 16, textAlign: 'center' }}>
              Do you really want to delete this report? Please enter your password to confirm.
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setConfirmDeleteModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: '#EF4444' }]} onPress={confirmAndDelete}>
                <Text style={styles.modalSaveBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isEmergencyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEmergencyModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsEmergencyModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Name"
              placeholderTextColor="#9CA3AF"
              value={newEmergencyName}
              onChangeText={setNewEmergencyName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Relation (e.g. Brother)"
              placeholderTextColor="#9CA3AF"
              value={newEmergencyRelation}
              onChangeText={setNewEmergencyRelation}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Phone Number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={newEmergencyPhone}
              onChangeText={setNewEmergencyPhone}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsEmergencyModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveBtn} 
                onPress={() => {
                  if (newEmergencyName.trim() && newEmergencyRelation.trim() && newEmergencyPhone.trim()) {
                    setProfileData(p => ({
                      ...p, 
                      emergencyContacts: [
                        ...p.emergencyContacts, 
                        { name: newEmergencyName.trim(), relation: newEmergencyRelation.trim(), phone: newEmergencyPhone.trim() }
                      ]
                    }));
                    setNewEmergencyName('');
                    setNewEmergencyRelation('');
                    setNewEmergencyPhone('');
                    setIsEmergencyModalVisible(false);
                  } else {
                    Alert.alert("Missing Fields", "Please fill out all fields.");
                  }
                }}
              >
                <Text style={styles.modalSaveBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// Info Row Component
const InfoRow = ({ label, value, isEditing, onChangeText, editable = true, options, onPress }: { label: string; value: string; isEditing?: boolean; onChangeText?: (text: string) => void; editable?: boolean; options?: string[]; onPress?: () => void }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    {isEditing && editable ? (
      options ? (
        <View style={styles.optionsRow}>
          {options.map(opt => (
            <TouchableOpacity key={opt} onPress={() => onChangeText?.(opt)} style={[styles.optionBtn, value === opt && styles.optionBtnSelected]}>
              <Text style={[styles.optionText, value === opt && styles.optionTextSelected]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : onPress ? (
        <TouchableOpacity onPress={onPress}>
          <TextInput
            style={[styles.infoValue, styles.infoInput]}
            value={value}
            editable={false}
            pointerEvents="none"
            placeholder={label}
            placeholderTextColor="#9CA3AF"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
          style={[styles.infoValue, styles.infoInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={label}
          placeholderTextColor="#9CA3AF"
        />
      )
    ) : (
      <Text style={styles.infoValue}>{value}</Text>
    )}
  </View>
);

// Medical Info Item Component
const MedicalInfoItem = ({
  icon,
  label,
  value,
  isEditing,
  onChangeText,
  keyboardType = 'default',
  editable = true,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isEditing?: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: any;
  editable?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.medicalItem} onPress={onPress} disabled={!onPress}>
    {icon}
    <Text style={styles.medicalItemLabel}>{label}</Text>
    {isEditing && editable ? (
      <TextInput
        style={[styles.medicalItemValue, styles.medicalInput]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor="#9CA3AF"
      />
    ) : (
      <Text style={styles.medicalItemValue}>{value}</Text>
    )}
  </TouchableOpacity>
);

// Setting Row Component
const SettingRow = ({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}) => (
  <View style={styles.settingRow}>
    {icon}
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }} thumbColor={value ? COLORS.primary : '#9CA3AF'} />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  scrollContent: { padding: 20, paddingBottom: 120 },

  // Profile Card
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  photoContainer: { position: 'relative' },
  profilePhoto: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  patientName: { fontSize: 20, fontWeight: '800', color: COLORS.textHeader },
  patientId: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  badgesRow: { flexDirection: 'row', gap: 8 },
  ageBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  genderBadge: { backgroundColor: '#FCE7F3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  bloodBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600', color: COLORS.textHeader },
  bloodBadgeText: { fontSize: 11, fontWeight: '800', color: '#DC2626' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  profileMeta: { flexDirection: 'row', justifyContent: 'space-around' },
  metaItem: { alignItems: 'center' },
  metaLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  metaValue: { fontSize: 16, fontWeight: '700', color: COLORS.primary },

  // Quick Actions
  quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  quickActionBtn: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  quickActionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textHeader, marginTop: 8, textAlign: 'center' },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textHeader },

  // Info Card
  infoCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },
  infoInput: { borderBottomWidth: 1, borderBottomColor: COLORS.primary, padding: 0, margin: 0, minWidth: 150, textAlign: 'right' },
  optionsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1, paddingLeft: 10 },
  optionBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  optionBtnSelected: { backgroundColor: COLORS.primary + '1A', borderColor: COLORS.primary },
  optionText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  optionTextSelected: { color: COLORS.primary },
  infoDivider: { height: 1, backgroundColor: '#F3F4F6' },

  // Medical Card
  medicalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  medicalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  medicalItem: { width: '48%', alignItems: 'center', paddingVertical: 12, backgroundColor: '#F9FAFB', borderRadius: 12 },
  medicalItemLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  medicalItemValue: { fontSize: 14, fontWeight: '800', color: COLORS.textHeader },
  medicalDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  allergySection: { marginVertical: 12 },
  allergyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  allergyTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  allergyBadges: { flexDirection: 'row', gap: 8 },
  allergyBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  allergyText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  chronicSection: { marginVertical: 12 },
  chronicHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  chronicTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  noDataText: { fontSize: 12, color: COLORS.textSecondary },
  medicationsSection: { marginVertical: 12 },
  medicationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  medicationTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textHeader },
  medicationItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  medicationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  medicationName: { fontSize: 12, color: COLORS.textSecondary },

  // Add row (input + button)
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  addInputField: { flex: 1, marginTop: 0 },

  // Emergency Card
  emergencyCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  emergencyContact: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  emergencyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  emergencyInfo: { flex: 1 },
  emergencyName: { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },
  emergencyRelation: { fontSize: 12, color: COLORS.textSecondary },
  emergencyCallBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  emergencyPhone: { marginTop: 12 },
  emergencyPhoneLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  emergencyPhoneValue: { fontSize: 14, fontWeight: '700', color: COLORS.textHeader },

  // Insurance Card
  insuranceCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  uploadInsuranceBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: COLORS.primary, borderRadius: 12, alignItems: 'center' },
  uploadInsuranceBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  // Settings Card
  settingsCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textHeader },
  settingDivider: { height: 1, backgroundColor: '#F3F4F6' },

  // Security Card
  securityCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  securityOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  securityLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textHeader },
  enabledBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  enabledBadgeText: { fontSize: 11, fontWeight: '600', color: '#166534' },
  securityDivider: { height: 1, backgroundColor: '#F3F4F6' },

  // Logout Button
  logoutBtn: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 2, borderColor: '#EF4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  logoutBtnText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },

  medicalInput: { borderBottomWidth: 1, borderBottomColor: COLORS.primary, padding: 0, margin: 0, minWidth: 60, textAlign: 'center' },
  addInput: { borderBottomWidth: 1, borderBottomColor: COLORS.primary, paddingVertical: 4, fontSize: 13, color: COLORS.textHeader },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#FFF', fontSize: 20, fontWeight: '800', lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#FFF', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textHeader, marginBottom: 20, textAlign: 'center' },
  bloodGroupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  bloodGroupBtn: { width: '45%', paddingVertical: 12, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  bloodGroupBtnSelected: { backgroundColor: COLORS.primary + '1A', borderColor: COLORS.primary },
  bloodGroupText: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
  bloodGroupTextSelected: { color: COLORS.primary },
  addBtnSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnTextSmall: { color: '#FFF', fontSize: 18, fontWeight: '800', lineHeight: 20 },
  modalInput: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 10, marginBottom: 16, fontSize: 15, color: COLORS.textHeader },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#F3F4F6' },
  modalCancelBtnText: { color: COLORS.textSecondary, fontWeight: '700' },
  modalSaveBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: COLORS.primary },
  modalSaveBtnText: { color: '#FFF', fontWeight: '700' },
});

export default PatientProfileScreen;