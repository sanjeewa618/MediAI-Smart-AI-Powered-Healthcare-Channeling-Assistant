import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SHADOWS } from '../../theme/theme';
import { CustomButton } from '../../components/CustomButton';
import { ArrowLeft, UserRound, Stethoscope, BriefcaseMedical, ShieldCheck } from 'lucide-react-native';

type RoleNav = StackNavigationProp<RootStackParamList, 'RoleSelection'>;

type RoleKey = 'patient' | 'doctor' | 'nurse' | 'admin';

const RoleSelectionScreen = () => {
  const navigation = useNavigation<RoleNav>();
  const [role, setRole] = React.useState<RoleKey>('doctor');

  const handleRoleSelect = (selectedRole: RoleKey) => {
    setRole(selectedRole);
    // Navigate immediately to SignUp screen with the selected role
    navigation.navigate('SignUp', { role: selectedRole });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft size={24} color="#111827" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Choose your role</Text>
        <Text style={styles.subtitle}>This helps us personalize your experience</Text>
      </View>

      <View style={styles.cards}>
        <RoleCard
          active={role === 'doctor'}
          title="Doctor"
          subtitle="Manage patients and schedules"
          onPress={() => handleRoleSelect('doctor')}
          icon={<Stethoscope size={22} color={role === 'doctor' ? '#FFFFFF' : COLORS.primary} />}
        />
        <RoleCard
          active={role === 'nurse'}
          title="Nurse"
          subtitle="Access patient health records"
          onPress={() => handleRoleSelect('nurse')}
          icon={<BriefcaseMedical size={22} color={role === 'nurse' ? '#FFFFFF' : COLORS.primary} />}
        />
      </View>
    </SafeAreaView>
  );
};

function RoleCard({
  active,
  title,
  subtitle,
  icon,
  onPress,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        SHADOWS.medium,
        active ? styles.cardActive : styles.cardInactive,
      ]}
    >
      <View style={[styles.iconWrap, active ? styles.iconWrapActive : styles.iconWrapInactive]}>
        {icon}
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, active ? styles.cardTitleActive : styles.cardTitleInactive]}>
          {title}
        </Text>
        <Text style={[styles.cardSubtitle, active ? styles.cardSubtitleActive : styles.cardSubtitleInactive]}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  header: {
    marginTop: 18,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  cards: {
    marginTop: 24,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  cardActive: {
    backgroundColor: COLORS.primary,
    borderColor: 'rgba(107,78,255,0.2)',
  },
  cardInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF2FF',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  iconWrapInactive: {
    backgroundColor: COLORS.primaryLight,
  },
  cardText: {
    marginLeft: 14,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  cardTitleActive: {
    color: '#FFFFFF',
  },
  cardTitleInactive: {
    color: '#111827',
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  cardSubtitleActive: {
    color: 'rgba(255,255,255,0.9)',
  },
  cardSubtitleInactive: {
    color: '#6B7280',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 18,
  },
});

export default RoleSelectionScreen;
