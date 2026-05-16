import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  TextInput, SafeAreaView, Platform, StatusBar, Dimensions,
  KeyboardAvoidingView, Alert, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS } from '../../theme/theme';
import { 
  ArrowLeft, ChevronRight, Calendar, Clock, User, 
  MapPin, Activity, CheckCircle2, Upload, Wallet,
  Home, Building2, AlertCircle, Phone, Mail, 
  FileText, ArrowRight, Check, Timer, FlaskConical, Shield, Bell
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type BookingFlowRouteProp = RouteProp<RootStackParamList, 'LabBookingFlow'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'LabBookingFlow'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LabBookingFlowScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BookingFlowRouteProp>();
  const { lab, initialDate, initialTime } = route.params;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8; // Simplified grouping

  // Form States
  const [selectedDate, setSelectedDate] = useState(initialDate || '13');
  const [selectedTime, setSelectedTime] = useState(initialTime || '');
  const [patientDetails, setPatientDetails] = useState({
    fullName: '',
    nic: '',
    dob: '',
    gender: 'Male',
    mobile: '',
    email: '',
    address: '',
    medicalNotes: ''
  });
  const [collectionMethod, setCollectionMethod] = useState('Hospital'); // Hospital or Home
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [reminderOptions, setReminderOptions] = useState({
    email: true,
    phone: false
  });
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleAddToCalendar = () => {
    Alert.alert(
      "Added to Calendar",
      `Lab appointment at ${lab.name} on ${selectedDate} May at ${selectedTime} has been added to your calendar.`,
      [{ text: "OK" }]
    );
  };

  const handleSetReminder = () => {
    setReminderModalVisible(true);
  };

  const saveReminder = () => {
    setReminderModalVisible(false);
    Alert.alert("Reminder Set", "You will receive notifications via " + (reminderOptions.email ? "Email " : "") + (reminderOptions.phone ? "and SMS" : ""));
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const uri = result.assets[0]?.uri;
      if (uri) setSelectedImage(uri);
    }
  };

  const steps = [
    'Test',
    'Details',
    'Method',
    'Review',
    'Payment',
    'Done'
  ];

  const handleNext = () => {
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepperContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <View style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              currentStep > index + 1 ? styles.stepDotCompleted : 
              currentStep === index + 1 ? styles.stepDotActive : null
            ]}>
              {currentStep > index + 1 ? (
                <Check size={12} color="#FFF" />
              ) : (
                <Text style={[
                  styles.stepDotText,
                  currentStep === index + 1 && styles.stepDotTextActive
                ]}>{index + 1}</Text>
              )}
            </View>
            <Text style={[
              styles.stepLabel,
              currentStep === index + 1 && styles.stepLabelActive
            ]}>{step}</Text>
          </View>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              currentStep > index + 1 && styles.stepLineActive
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  // --- STEP RENDERS ---

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirm Test Details</Text>
      <View style={[styles.card, SHADOWS.medium, { flexDirection: 'row', padding: 16, alignItems: 'center' }]}>
        <Image source={typeof lab.image === 'number' ? lab.image : { uri: lab.image }} style={styles.testImageThumbnail} />
        <View style={[styles.testInfoSection, { flex: 1, padding: 0, marginLeft: 16 }]}>
          <Text style={styles.testNameLarge}>{lab.name}</Text>
          <Text style={styles.testLabSub}>{lab.floor}</Text>
          
          <View style={styles.testTags}>
            <View style={styles.testTag}>
              <CheckCircle2 size={14} color="#10B981" />
              <Text style={styles.testTagText}>Results in {lab.duration}</Text>
            </View>
            <View style={styles.testTag}>
              <CheckCircle2 size={14} color="#10B981" />
              <Text style={styles.testTagText}>Fasting Not Required</Text>
            </View>
            <View style={styles.testTag}>
              <CheckCircle2 size={14} color="#10B981" />
              <Text style={styles.testTagText}>Home Collection Available</Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Total Price</Text>
            <Text style={styles.priceValueLarge}>{lab.price}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.nurseInfoSmall}>
        <Image 
          source={{ uri: 'https://img.freepik.com/free-photo/female-nurse-white-coat-standing-with-clipboard-isolated_1303-31411.jpg' }} 
          style={styles.nurseAvatarSmall} 
        />
        <View>
          <Text style={styles.nurseNameLabel}>Assigned Nurse</Text>
          <Text style={styles.nurseNameValue}>{lab.nurse}</Text>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Patient Information</Text>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter your full name"
            value={patientDetails.fullName}
            onChangeText={(v) => setPatientDetails({...patientDetails, fullName: v})}
          />
        </View>
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.inputLabel}>NIC / Passport</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 981234567V"
              value={patientDetails.nic}
              onChangeText={(v) => setPatientDetails({...patientDetails, nic: v})}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity 
                style={[styles.genderBtn, patientDetails.gender === 'Male' && styles.genderBtnActive]}
                onPress={() => setPatientDetails({...patientDetails, gender: 'Male'})}
              >
                <Text style={[styles.genderBtnText, patientDetails.gender === 'Male' && styles.genderBtnTextActive]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.genderBtn, patientDetails.gender === 'Female' && styles.genderBtnActive]}
                onPress={() => setPatientDetails({...patientDetails, gender: 'Female'})}
              >
                <Text style={[styles.genderBtnText, patientDetails.gender === 'Female' && styles.genderBtnTextActive]}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: 077 123 4567"
            keyboardType="phone-pad"
            value={patientDetails.mobile}
            onChangeText={(v) => setPatientDetails({...patientDetails, mobile: v})}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Medical Notes (Optional)</Text>
          <TextInput 
            style={[styles.input, { height: 80, paddingTop: 12 }]} 
            placeholder="Existing diseases, allergies..."
            multiline
            value={patientDetails.medicalNotes}
            onChangeText={(v) => setPatientDetails({...patientDetails, medicalNotes: v})}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Sample Collection Method</Text>
      <View style={styles.methodRow}>
        <TouchableOpacity 
          style={[styles.methodCard, collectionMethod === 'Hospital' && styles.methodCardActive]}
          onPress={() => setCollectionMethod('Hospital')}
        >
          <Building2 size={32} color={collectionMethod === 'Hospital' ? COLORS.primary : '#9CA3AF'} />
          <Text style={[styles.methodTitle, collectionMethod === 'Hospital' && styles.methodTitleActive]}>Visit Lab</Text>
          <Text style={styles.methodDesc}>Visit hospital physically</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.methodCard, collectionMethod === 'Home' && styles.methodCardActive]}
          onPress={() => setCollectionMethod('Home')}
        >
          <Home size={32} color={collectionMethod === 'Home' ? COLORS.primary : '#9CA3AF'} />
          <Text style={[styles.methodTitle, collectionMethod === 'Home' && styles.methodTitleActive]}>Home Collection</Text>
          <Text style={styles.methodDesc}>Nurse visits your home</Text>
        </TouchableOpacity>
      </View>

      {collectionMethod === 'Home' && (
        <View style={[styles.homeDetails, SHADOWS.small]}>
          <Text style={styles.inputLabel}>Home Address</Text>
          <TextInput style={styles.input} placeholder="Enter your full address" multiline />
          <Text style={[styles.inputLabel, { marginTop: 15 }]}>Landmark</Text>
          <TextInput style={styles.input} placeholder="Near Supermarket, etc." />
        </View>
      )}

      <Text style={[styles.stepTitle, { marginTop: 30 }]}>Doctor Referral (Optional)</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.uploadedPreview} />
        ) : (
          <>
            <Upload size={24} color={COLORS.primary} />
            <Text style={styles.uploadText}>Upload Prescription / Referral</Text>
            <Text style={styles.uploadSub}>Camera, Gallery or PDF</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review Booking</Text>
      <View style={[styles.reviewCard, SHADOWS.medium]}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewIconWrap}>
            <FlaskConical size={24} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.reviewTestName}>{lab.description}</Text>
            <Text style={styles.reviewLabName}>{lab.name}</Text>
          </View>
        </View>
        
        <View style={styles.reviewDivider} />
        
        <View style={styles.reviewItem}>
          <Calendar size={18} color="#6B7280" />
          <Text style={styles.reviewItemText}>{selectedDate} May 2026</Text>
        </View>
        <View style={styles.reviewItem}>
          <Clock size={18} color="#6B7280" />
          <Text style={styles.reviewItemText}>{selectedTime || 'Not selected'}</Text>
        </View>
        <View style={styles.reviewItem}>
          <User size={18} color="#6B7280" />
          <Text style={styles.reviewItemText}>Nurse {lab.nurse}</Text>
        </View>
        <View style={styles.reviewItem}>
          <MapPin size={18} color="#6B7280" />
          <Text style={styles.reviewItemText}>{collectionMethod === 'Home' ? 'Home Collection' : 'Hospital Visit'}</Text>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{lab.price}</Text>
        </View>
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Payment Method</Text>
      <TouchableOpacity 
        style={[styles.payOption, paymentMethod === 'Card' && styles.payOptionActive]}
        onPress={() => setPaymentMethod('Card')}
      >
        <Wallet size={24} color={paymentMethod === 'Card' ? COLORS.primary : '#6B7280'} />
        <View style={styles.payInfo}>
          <Text style={styles.payName}>Credit / Debit Card</Text>
          <Text style={styles.paySub}>Visa, Mastercard, Amex</Text>
        </View>
        <View style={[styles.radio, paymentMethod === 'Card' && styles.radioActive]} />
      </TouchableOpacity>

      {paymentMethod === 'Card' && (
        <View style={styles.cardDetailsForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="John Doe" 
              value={cardDetails.name}
              onChangeText={(txt) => setCardDetails({...cardDetails, name: txt})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0000 0000 0000 0000" 
              keyboardType="numeric"
              value={cardDetails.number}
              onChangeText={(txt) => setCardDetails({...cardDetails, number: txt})}
            />
          </View>
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Expiry</Text>
              <TextInput 
                style={styles.input} 
                placeholder="MM/YY" 
                value={cardDetails.expiry}
                onChangeText={(txt) => setCardDetails({...cardDetails, expiry: txt})}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput 
                style={styles.input} 
                placeholder="000" 
                keyboardType="numeric"
                secureTextEntry
                value={cardDetails.cvv}
                onChangeText={(txt) => setCardDetails({...cardDetails, cvv: txt})}
              />
            </View>
          </View>
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.payOption, paymentMethod === 'Cash' && styles.payOptionActive]}
        onPress={() => setPaymentMethod('Cash')}
      >
        <Building2 size={24} color={paymentMethod === 'Cash' ? COLORS.primary : '#6B7280'} />
        <View style={styles.payInfo}>
          <Text style={styles.payName}>Pay at Hospital</Text>
          <Text style={styles.paySub}>Cash or Card at counter</Text>
        </View>
        <View style={[styles.radio, paymentMethod === 'Cash' && styles.radioActive]} />
      </TouchableOpacity>

      {paymentMethod === 'Cash' && (
        <View style={styles.cashInfoBox}>
          <AlertCircle size={20} color={COLORS.primary} />
          <Text style={styles.cashInfoText}>
            You can pay at the hospital reception. Please arrive 15 minutes before your scheduled time.
          </Text>
        </View>
      )}

      <View style={styles.securityInfo}>
        <Shield size={16} color="#10B981" />
        <Text style={styles.securityText}>Your payment is 100% secure and encrypted.</Text>
      </View>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.successContent}>
      <LinearGradient
        colors={['#ECFDF5', '#FFF']}
        style={styles.successBg}
      >
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSub}>Your lab test has been scheduled successfully.</Text>
        
        <View style={[styles.ticketCard, SHADOWS.medium]}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketLabel}>Booking ID</Text>
            <Text style={styles.ticketID}>#MED-LAB-2026-482</Text>
          </View>
          
          <View style={styles.ticketRow}>
            <View style={styles.ticketItem}>
              <Text style={styles.ticketLabel}>Token</Text>
              <Text style={styles.tokenValue}>22</Text>
            </View>
            <View style={styles.ticketItem}>
              <Text style={styles.ticketLabel}>Room</Text>
              <Text style={styles.roomValue}>{lab.name}</Text>
            </View>
          </View>

          <View style={styles.ticketDivider} />

          <View style={styles.ticketDetails}>
            <View style={styles.ticketDetailRow}>
              <Text style={styles.ticketDetailLabel}>Date</Text>
              <Text style={styles.ticketDetailValue}>{selectedDate} May, 2026</Text>
            </View>
            <View style={styles.ticketDetailRow}>
              <Text style={styles.ticketDetailLabel}>Time</Text>
              <Text style={styles.ticketDetailValue}>{selectedTime}</Text>
            </View>
            <View style={styles.ticketDetailRow}>
              <Text style={styles.ticketDetailLabel}>Nurse</Text>
              <Text style={styles.ticketDetailValue}>{lab.nurse}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.queueInfoCard, SHADOWS.small]}>
          <Activity size={20} color={COLORS.primary} />
          <View style={styles.queueTextSection}>
            <Text style={styles.queueMainText}>Queue Status: 18 People Ahead</Text>
            <Text style={styles.queueSubText}>Estimated Wait: 25 mins</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.actionBtnPrimary}
          onPress={() => navigation.navigate('PatientDashboard')}
        >
          <Text style={styles.actionBtnText}>Go to Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.extraActions}>
          <TouchableOpacity style={styles.extraBtn} onPress={handleAddToCalendar}>
            <Calendar size={18} color={COLORS.primary} />
            <Text style={styles.extraBtnText}>Add to Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.extraBtn} onPress={handleSetReminder}>
            <Bell size={18} color={COLORS.primary} />
            <Text style={styles.extraBtnText}>Set Reminder</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Reminder Modal */}
      <Modal
        visible={reminderModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reminderModalContent}>
            <Text style={styles.reminderModalTitle}>Set Reminder</Text>
            <Text style={styles.reminderModalSub}>Choose how you want to be notified</Text>
            
            <TouchableOpacity 
              style={[styles.reminderOption, reminderOptions.email && styles.reminderOptionActive]}
              onPress={() => setReminderOptions({...reminderOptions, email: !reminderOptions.email})}
            >
              <View style={[styles.radio, reminderOptions.email && styles.radioActive]} />
              <Text style={styles.reminderOptionText}>Email Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.reminderOption, reminderOptions.phone && styles.reminderOptionActive]}
              onPress={() => setReminderOptions({...reminderOptions, phone: !reminderOptions.phone})}
            >
              <View style={[styles.radio, reminderOptions.phone && styles.radioActive]} />
              <Text style={styles.reminderOptionText}>Phone (SMS) Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveReminderBtn} onPress={saveReminder}>
              <Text style={styles.saveReminderBtnText}>Save Reminder</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelReminderBtn} onPress={() => setReminderModalVisible(false)}>
              <Text style={styles.cancelReminderBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {currentStep < 6 && (
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.textHeader} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Lab Test</Text>
          <View style={{ width: 44 }} />
        </View>
      )}

      {currentStep < 6 && renderStepIndicator()}

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep3()}
        {currentStep === 3 && renderStep4()}
        {currentStep === 4 && renderStep5()}
        {currentStep === 5 && renderStep6()}
        {currentStep === 6 && renderSuccess()}
      </ScrollView>

      {currentStep < 6 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.nextBtn}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {currentStep === 5 ? 'Pay & Confirm' : 'Continue'}
            </Text>
            <ArrowRight size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30, // Move title down
    paddingBottom: 15,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotCompleted: {
    backgroundColor: '#10B981',
  },
  stepDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
  },
  stepDotTextActive: {
    color: '#FFF',
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 4,
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  stepLine: {
    width: 20,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
    marginTop: -10,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stepContent: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  testImageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  testInfoSection: {
    padding: 16, // More compact card
  },
  testNameLarge: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  testLabSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  testTags: {
    marginTop: 15,
    gap: 8,
  },
  testTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testTagText: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  priceSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceValueLarge: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    marginRight: 8, // Added margin right
  },
  nurseInfoSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    backgroundColor: '#F3F0FF',
    padding: 12,
    borderRadius: 16,
  },
  nurseAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  nurseNameLabel: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  nurseNameValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  // Step 2 Styles
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  todayBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  dateList: {
    paddingBottom: 5,
  },
  dateBtn: {
    width: 54,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateBtnDay: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  dateBtnDayActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  dateBtnNum: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginTop: 4,
  },
  dateBtnNumActive: {
    color: '#FFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlotBtn: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeSlotBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F3F0FF',
  },
  timeSlotFull: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  timeSlotText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  timeSlotTextActive: {
    color: COLORS.primary,
  },
  timeStatusText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  statusAvailable: { color: '#10B981' },
  statusFew: { color: '#F59E0B' },
  statusFull: { color: '#6B7280' },
  // Step 3 Styles
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textHeader,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textHeader,
  },
  row: {
    flexDirection: 'row',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  genderBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F3F0FF',
  },
  genderBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  genderBtnTextActive: {
    color: COLORS.primary,
  },
  // Step 4 Styles
  methodRow: {
    flexDirection: 'row',
    gap: 15,
  },
  methodCard: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  methodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F3F0FF',
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginTop: 12,
  },
  methodTitleActive: {
    color: COLORS.primary,
  },
  methodDesc: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  homeDetails: {
    marginTop: 20,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  uploadBtn: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadedPreview: {
    width: '100%',
    height: 150,
    borderRadius: 16,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 10,
  },
  uploadSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  // Step 5 Review Styles
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  reviewIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTestName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  reviewLabName: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },
  reviewItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  totalSection: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textHeader,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  // Step 6 Payment Styles
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },
  payOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F3F0FF',
  },
  cardDetailsForm: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 15,
  },
  cashInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F0FF',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  cashInfoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 18,
  },
  payInfo: {
    flex: 1,
    marginLeft: 15,
  },
  payName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
  },
  paySub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioActive: {
    borderColor: COLORS.primary,
    borderWidth: 6,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  securityText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  // Success Screen Styles
  successContent: {
    flex: 1,
    minHeight: SCREEN_HEIGHT - 100,
  },
  successBg: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 100, // Increased for better centering
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#10B981', // Green color vibe
    textAlign: 'center',
  },
  successSub: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ticketLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  ticketID: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginTop: 4,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  ticketItem: {
    alignItems: 'center',
  },
  tokenValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4,
  },
  roomValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginTop: 4,
  },
  ticketDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
    marginVertical: 20,
  },
  ticketDetails: {
    gap: 12,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  ticketDetailValue: {
    fontSize: 14,
    color: COLORS.textHeader,
    fontWeight: '700',
  },
  queueInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F0FF',
    padding: 16,
    borderRadius: 20,
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  queueTextSection: {
    flex: 1,
  },
  queueMainText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  queueSubText: {
    fontSize: 12,
    color: COLORS.textMain,
    marginTop: 2,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  extraActions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  extraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  extraBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 38 : 28,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 30,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
    ...SHADOWS.medium,
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  // Reminder Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  reminderModalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
  },
  reminderModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textHeader,
    marginBottom: 8,
  },
  reminderModalSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
    gap: 12,
  },
  reminderOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F3F0FF',
  },
  reminderOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textHeader,
  },
  saveReminderBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveReminderBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelReminderBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelReminderBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  }
});

export default LabBookingFlowScreen;
