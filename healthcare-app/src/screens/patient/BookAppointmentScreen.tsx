import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, SafeAreaView, Dimensions, Alert, StatusBar } from 'react-native';
import { ChevronLeft, CheckCircle2, User, Calendar, CreditCard, Download, FileText, Upload, Stethoscope, FilePlus2, Receipt } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type NavProp = StackNavigationProp<RootStackParamList, 'BookAppointment'>;
type BookAppRouteProp = RouteProp<RootStackParamList, 'BookAppointment'>;

const STEPS = ['Patient Info', 'Medical Details', 'Review & Pay', 'Receipt'];

const BookAppointmentScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<BookAppRouteProp>();
  const { doctorName = 'Dr. Emma Watson', specialty = 'Cardiology', date = 'May 20, 2024', time = '10:00 AM' } = (route.params as any) || {};

  const [currentStep, setCurrentStep] = useState(0);

  // Form States
  const [patientInfo, setPatientInfo] = useState({ name: '', nic: '', dob: '', gender: 'Male', mobile: '', email: '', address: '', emContact: '' });
  const [medicalInfo, setMedicalInfo] = useState({ visitType: 'New Patient', consultation: 'Physical Visit', symptoms: '', conditions: '', medications: '', allergies: '' });
  const [paymentInfo, setPaymentInfo] = useState({ method: 'Card', insuranceProvider: '', promo: '', notes: '' });
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const CHANNELING_FEE = 1500;
  const HOSPITAL_FEE = 500;
  const TOTAL_AMOUNT = CHANNELING_FEE + HOSPITAL_FEE;

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else navigation.goBack();
  };

  const handleConfirmBooking = () => {
    // Navigate to receipt
    setCurrentStep(3);
    Alert.alert('Success', 'Appointment booked successfully! Notifications have been sent to your email and SMS.');
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {STEPS.map((step, index) => (
        <View key={index} style={styles.stepWrapper}>
          <View style={[styles.stepCircle, currentStep >= index ? styles.stepCircleActive : null]}>
            {currentStep > index ? <CheckCircle2 size={14} color="#FFF" /> : <Text style={[styles.stepNumber, currentStep >= index ? { color: '#FFF' } : null]}>{index + 1}</Text>}
          </View>
          <Text style={[styles.stepLabel, currentStep >= index ? styles.stepLabelActive : null]}>{step}</Text>
          {index < STEPS.length - 1 && <View style={[styles.stepLine, currentStep > index ? styles.stepLineActive : null]} />}
        </View>
      ))}
    </View>
  );

  const renderPatientInfo = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Identification Details</Text>
      
      <Text style={styles.inputLabel}>Full Name</Text>
      <TextInput style={styles.input} placeholder="John Doe" value={patientInfo.name} onChangeText={(t) => setPatientInfo({...patientInfo, name: t})} />
      
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>NIC / Passport</Text>
          <TextInput style={styles.input} placeholder="123456789V" value={patientInfo.nic} onChangeText={(t) => setPatientInfo({...patientInfo, nic: t})} />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={patientInfo.dob} onChangeText={(t) => setPatientInfo({...patientInfo, dob: t})} />
        </View>
      </View>

      <Text style={styles.inputLabel}>Gender</Text>
      <View style={styles.pillsRow}>
        {['Male', 'Female', 'Other'].map(g => (
          <TouchableOpacity key={g} style={[styles.pill, patientInfo.gender === g && styles.pillActive]} onPress={() => setPatientInfo({...patientInfo, gender: g})}>
            <Text style={[styles.pillText, patientInfo.gender === g && styles.pillTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>Mobile Number</Text>
      <TextInput style={styles.input} placeholder="+94 7X XXX XXXX" keyboardType="phone-pad" value={patientInfo.mobile} onChangeText={(t) => setPatientInfo({...patientInfo, mobile: t})} />
      
      <Text style={styles.inputLabel}>Email Address</Text>
      <TextInput style={styles.input} placeholder="email@example.com" keyboardType="email-address" value={patientInfo.email} onChangeText={(t) => setPatientInfo({...patientInfo, email: t})} />
    </View>
  );

  const renderMedicalDetails = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Visit & Medical Info</Text>
      
      <Text style={styles.inputLabel}>Visit Type</Text>
      <View style={styles.pillsRow}>
        {['New Patient', 'Follow-up', 'Review Visit'].map(v => (
          <TouchableOpacity key={v} style={[styles.pill, medicalInfo.visitType === v && styles.pillActive]} onPress={() => setMedicalInfo({...medicalInfo, visitType: v})}>
            <Text style={[styles.pillText, medicalInfo.visitType === v && styles.pillTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>Consultation Type</Text>
      <View style={styles.pillsRow}>
        {['Physical Visit', 'Online Consultation'].map(c => (
          <TouchableOpacity key={c} style={[styles.pill, medicalInfo.consultation === c && styles.pillActive]} onPress={() => setMedicalInfo({...medicalInfo, consultation: c})}>
            <Text style={[styles.pillText, medicalInfo.consultation === c && styles.pillTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>Main Symptoms / Reason for visit</Text>
      <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={3} placeholder="Describe your symptoms briefly" value={medicalInfo.symptoms} onChangeText={(t) => setMedicalInfo({...medicalInfo, symptoms: t})} />

      <Text style={styles.inputLabel}>Existing Medical Conditions (Optional)</Text>
      <TextInput style={styles.input} placeholder="e.g., Diabetes, Hypertension" value={medicalInfo.conditions} onChangeText={(t) => setMedicalInfo({...medicalInfo, conditions: t})} />
      
      <View style={styles.uploadBox}>
        <Upload size={24} color={COLORS.primary} />
        <Text style={styles.uploadText}>Upload Previous Reports (PDF/Images)</Text>
      </View>
    </View>
  );

  const renderReviewAndPay = () => (
    <View style={styles.formSection}>
      <View style={[styles.summaryCard, SHADOWS.sm]}>
        <Text style={styles.summaryTitle}>Appointment Summary</Text>
        <View style={styles.divider} />
        <View style={styles.sumRow}><Text style={styles.sumLabel}>Doctor:</Text><Text style={styles.sumValue}>{doctorName}</Text></View>
        <View style={styles.sumRow}><Text style={styles.sumLabel}>Specialty:</Text><Text style={styles.sumValue}>{specialty}</Text></View>
        <View style={styles.sumRow}><Text style={styles.sumLabel}>Hospital:</Text><Text style={styles.sumValue}>City Care Medical Center</Text></View>
        <View style={styles.sumRow}><Text style={styles.sumLabel}>Date & Time:</Text><Text style={styles.sumValue}>{date} • {time}</Text></View>
        <View style={styles.divider} />
        <View style={styles.sumRow}><Text style={styles.sumLabel}>Channeling Fee:</Text><Text style={styles.sumValue}>LKR {CHANNELING_FEE.toFixed(2)}</Text></View>
        <View style={styles.sumRow}><Text style={styles.sumLabel}>Hospital Fee:</Text><Text style={styles.sumValue}>LKR {HOSPITAL_FEE.toFixed(2)}</Text></View>
        <View style={[styles.sumRow, { marginTop: 8 }]}><Text style={styles.sumTotalLabel}>Total Amount:</Text><Text style={styles.sumTotalValue}>LKR {TOTAL_AMOUNT.toFixed(2)}</Text></View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Payment Method</Text>
      <View style={styles.pillsRow}>
        {['Card', 'Cash at Hospital', 'Insurance'].map(m => (
          <TouchableOpacity key={m} style={[styles.pill, paymentInfo.method === m && styles.pillActive]} onPress={() => setPaymentInfo({...paymentInfo, method: m})}>
            <Text style={[styles.pillText, paymentInfo.method === m && styles.pillTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {paymentInfo.method === 'Card' && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.inputLabel}>Cardholder Name</Text>
          <TextInput style={styles.input} placeholder="Name on card" value={cardInfo.name} onChangeText={(t) => setCardInfo({...cardInfo, name: t})} />
          
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput style={styles.input} placeholder="XXXX XXXX XXXX XXXX" keyboardType="numeric" maxLength={19} value={cardInfo.number} onChangeText={(t) => setCardInfo({...cardInfo, number: t})} />
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput style={styles.input} placeholder="MM/YY" maxLength={5} value={cardInfo.expiry} onChangeText={(t) => setCardInfo({...cardInfo, expiry: t})} />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput style={styles.input} placeholder="123" keyboardType="numeric" secureTextEntry maxLength={4} value={cardInfo.cvv} onChangeText={(t) => setCardInfo({...cardInfo, cvv: t})} />
            </View>
          </View>
        </View>
      )}

      {paymentInfo.method === 'Cash at Hospital' && (
        <View style={{ marginTop: 16 }}>
          <View style={{ backgroundColor: '#EEF2FF', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '500' }}>ℹ️ You can pay at the channeling center reception on the day of the appointment.</Text>
          </View>
          <Text style={styles.inputLabel}>Any Special Notes for Reception</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={2} placeholder="Optional notes for hospital staff..." value={paymentInfo.notes} onChangeText={(t) => setPaymentInfo({...paymentInfo, notes: t})} />
        </View>
      )}

      {paymentInfo.method === 'Insurance' && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.inputLabel}>Insurance Provider</Text>
          <TextInput style={styles.input} placeholder="e.g. Ceylinco, AIA" value={paymentInfo.insuranceProvider} onChangeText={(t) => setPaymentInfo({...paymentInfo, insuranceProvider: t})} />
        </View>
      )}

      <Text style={[styles.inputLabel, { marginTop: 16 }]}>Promo / Discount Code</Text>
      <TextInput style={styles.input} placeholder="Enter code here" value={paymentInfo.promo} onChangeText={(t) => setPaymentInfo({...paymentInfo, promo: t})} />
    </View>
  );

  const renderReceipt = () => (
    <View style={styles.receiptContainer}>
      <View style={[styles.receiptCard, SHADOWS.medium]}>
        <View style={styles.receiptHeader}>
          <CheckCircle2 size={50} color="#10B981" />
          <Text style={styles.receiptTitle}>Payment Successful!</Text>
          <Text style={styles.receiptSub}>Your appointment is confirmed</Text>
        </View>
        
        <View style={styles.receiptDetails}>
          <Text style={styles.receiptRef}>Ref No: BK-9824X</Text>
          <View style={styles.divider} />
          
          <View style={styles.receiptRow}><Text style={styles.rLabel}>Patient Name</Text><Text style={styles.rValue}>{patientInfo.name || 'John Doe'}</Text></View>
          <View style={styles.receiptRow}><Text style={styles.rLabel}>Doctor</Text><Text style={styles.rValue}>{doctorName}</Text></View>
          <View style={styles.receiptRow}><Text style={styles.rLabel}>Date & Time</Text><Text style={styles.rValue}>{date} | {time}</Text></View>
          <View style={styles.receiptRow}><Text style={styles.rLabel}>Queue No</Text><Text style={[styles.rValue, { fontSize: 18, color: COLORS.primary, fontWeight: '800' }]}>15</Text></View>
          
          <View style={styles.divider} />
          <View style={styles.receiptRow}><Text style={styles.rLabel}>Amount Paid</Text><Text style={[styles.rValue, { fontWeight: '700' }]}>LKR {TOTAL_AMOUNT.toFixed(2)}</Text></View>
        </View>

        <TouchableOpacity style={styles.downloadBtn}>
          <Download size={20} color="#FFF" />
          <Text style={styles.downloadText}>Download E-Receipt</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('PatientDashboard')}>
        <Text style={styles.homeBtnText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={COLORS.screenHeaderGradient} style={styles.header}>
        {currentStep < 3 && (
          <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{currentStep === 3 ? 'Booking Status' : 'Book Appointment'}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {currentStep < 3 && renderStepIndicator()}

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {currentStep === 0 && renderPatientInfo()}
        {currentStep === 1 && renderMedicalDetails()}
        {currentStep === 2 && renderReviewAndPay()}
        {currentStep === 3 && renderReceipt()}
      </ScrollView>

      {currentStep < 3 && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomOverview}>
            <Text style={styles.bottomDocText}>{doctorName}</Text>
            <Text style={styles.bottomTimeText}>{date} • {time}</Text>
          </View>
          <TouchableOpacity 
            style={styles.nextBtn} 
            onPress={currentStep === 2 ? handleConfirmBooking : nextStep}
          >
            <Text style={styles.nextBtnText}>{currentStep === 2 ? 'Confirm & Pay' : 'Next Step'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 14 : 36,
    paddingHorizontal: 20,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FAFAFA'
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
    position: 'relative'
  },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', zIndex: 2
  },
  stepCircleActive: { backgroundColor: COLORS.primary },
  stepNumber: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  stepLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 6, textAlign: 'center' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '600' },
  stepLine: {
    position: 'absolute', top: 14, left: '50%', right: '-50%', height: 2, backgroundColor: '#E5E7EB', zIndex: 1
  },
  stepLineActive: { backgroundColor: COLORS.primary },
  scrollContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  formSection: { padding: 20, backgroundColor: '#FFFFFF', marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#111827'
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFF'
  },
  pillActive: { backgroundColor: '#EEF2FF', borderColor: COLORS.primary },
  pillText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  pillTextActive: { color: COLORS.primary, fontWeight: '700' },
  uploadBox: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.primary, borderRadius: 16,
    padding: 20, alignItems: 'center', justifyContent: 'center', marginTop: 16, backgroundColor: '#F8FAFC'
  },
  uploadText: { marginTop: 8, fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  summaryCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLabel: { fontSize: 13, color: '#6B7280' },
  sumValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  sumTotalLabel: { fontSize: 15, fontWeight: '800', color: '#111827' },
  sumTotalValue: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', ...SHADOWS.medium
  },
  bottomOverview: { flex: 1 },
  bottomDocText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  bottomTimeText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  nextBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 18, borderRadius: 18, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  nextBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
  receiptContainer: { padding: 20, alignItems: 'center' },
  receiptCard: {
    backgroundColor: '#FFF', borderRadius: 24, width: '100%', padding: 24,
    alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#F3F4F6'
  },
  receiptHeader: { alignItems: 'center', marginBottom: 20 },
  receiptTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 12 },
  receiptSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  receiptDetails: { width: '100%', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16 },
  receiptRef: { textAlign: 'center', fontSize: 12, color: '#6B7280', fontWeight: '600' },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  rLabel: { fontSize: 13, color: '#4B5563' },
  rValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, gap: 8,
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, marginTop: 24, width: '100%', justifyContent: 'center'
  },
  downloadText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  homeBtn: { padding: 16 },
  homeBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 }
});

export default BookAppointmentScreen;
