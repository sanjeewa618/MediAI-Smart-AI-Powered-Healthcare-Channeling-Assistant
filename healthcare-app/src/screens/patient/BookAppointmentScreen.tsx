import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, SafeAreaView, Dimensions, Alert, StatusBar, KeyboardAvoidingView } from 'react-native';
import { ChevronLeft, CheckCircle2, User, Calendar, CreditCard, Download, FileText, Upload, Stethoscope, FilePlus2, Receipt } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, SHADOWS } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.32.136.102:4000';

const { width } = Dimensions.get('window');

type NavProp = StackNavigationProp<RootStackParamList, 'BookAppointment'>;
type BookAppRouteProp = RouteProp<RootStackParamList, 'BookAppointment'>;

const STEPS = ['Patient Info', 'Medical Details', 'Review & Pay', 'Receipt'];

const BookAppointmentScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<BookAppRouteProp>();
  const { doctorId, doctorName = 'Dr. Emma Watson', specialty = 'Cardiology', date = 'May 20, 2024', time = '10:00 AM', queueNumber: initialQueueNumber = null } = (route.params as any) || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [assignedQueueNumber, setAssignedQueueNumber] = useState<number | null>(initialQueueNumber);
  const { token } = useAuth();

  // Form States
  const [patientInfo, setPatientInfo] = useState({ name: '', nic: '', dob: '', gender: 'Male', mobile: '', email: '', address: '', emContact: '' });

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const user = await response.json();
        if (response.ok && user) {
          setPatientInfo(prev => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
            mobile: user.phone || prev.mobile,
            nic: user.nic || prev.nic,
            dob: user.dob || prev.dob,
            gender: user.gender || prev.gender,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch patient data:', err);
      }
    };
    if (token) {
      fetchPatientData();
    }
  }, [token]);
  const [medicalInfo, setMedicalInfo] = useState({ visitType: 'New Patient', consultation: 'Physical Visit', symptoms: '', conditions: '', medications: '', allergies: '' });
  const [paymentInfo, setPaymentInfo] = useState({ method: 'Card', insuranceProvider: '', promo: '', notes: '' });
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const CHANNELING_FEE = 1500;
  const HOSPITAL_FEE = 500;
  const TOTAL_AMOUNT = CHANNELING_FEE + HOSPITAL_FEE;

  const nextStep = () => {
    if (currentStep === 0) {
      if (!patientInfo.name.trim()) {
        Alert.alert('Validation Error', 'Please enter your Full Name.');
        return;
      }
      if (!patientInfo.nic.trim()) {
        Alert.alert('Validation Error', 'Please enter your NIC or Passport.');
        return;
      }
      if (!patientInfo.dob.trim()) {
        Alert.alert('Validation Error', 'Please enter your Date of Birth.');
        return;
      }
      if (!patientInfo.mobile.trim()) {
        Alert.alert('Validation Error', 'Please enter your Mobile Number.');
        return;
      }
    } else if (currentStep === 1) {
      if (!medicalInfo.symptoms.trim()) {
        Alert.alert('Validation Error', 'Please describe your Symptoms or Reason for Visit.');
        return;
      }
    } else if (currentStep === 2) {
      if (paymentInfo.method === 'Card') {
        if (!cardInfo.name.trim()) {
          Alert.alert('Validation Error', 'Please enter the Cardholder Name.');
          return;
        }
        if (!cardInfo.number.trim()) {
          Alert.alert('Validation Error', 'Please enter the Card Number.');
          return;
        }
        if (!cardInfo.expiry.trim()) {
          Alert.alert('Validation Error', 'Please enter the Expiry Date (MM/YY).');
          return;
        }
        if (!cardInfo.cvv.trim()) {
          Alert.alert('Validation Error', 'Please enter the Card CVV.');
          return;
        }
      } else if (paymentInfo.method === 'Insurance') {
        if (!paymentInfo.insuranceProvider.trim()) {
          Alert.alert('Validation Error', 'Please enter your Insurance Provider.');
          return;
        }
      }
    }

    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else navigation.goBack();
  };

  const handleConfirmBooking = async () => {
    if (paymentInfo.method === 'Card') {
      if (!cardInfo.name.trim() || !cardInfo.number.trim() || !cardInfo.expiry.trim() || !cardInfo.cvv.trim()) {
        Alert.alert('Validation Error', 'Please fill in all card details.');
        return;
      }
    } else if (paymentInfo.method === 'Insurance') {
      if (!paymentInfo.insuranceProvider.trim()) {
        Alert.alert('Validation Error', 'Please enter your Insurance Provider.');
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor: doctorId,
          date,
          timeSlot: time,
          symptoms: medicalInfo.symptoms,
          notes: medicalInfo.conditions
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (data.data && typeof data.data.queueNumber === 'number') {
          setAssignedQueueNumber(data.data.queueNumber);
        }
        setCurrentStep(3);
        Alert.alert('Success', 'Appointment booked successfully!');
      } else {
        Alert.alert('Booking Failed', data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to connect to the server.');
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 0 40px 40px 40px; color: #1F2937;">
            <!-- Top Teal Accent Line -->
            <div style="width: 100%; height: 6px; background-color: #00a896; margin-bottom: 25px;"></div>
            
            <!-- Title -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #3b7a9e; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 0.5px;">General Hospital Bill Receipt</h1>
            </div>
            
            <!-- Hospital Details -->
            <div style="margin-bottom: 30px; line-height: 1.6; font-size: 14px;">
              <strong style="font-size: 16px; color: #111827;">MediAI General Hospital</strong><br />
              No 120, Colombo Road, Colombo 03<br />
              +94 11 234 5678 / info@mediai.lk<br />
              www.mediai.lk
            </div>
            
            <!-- Issue & Receipt Meta -->
            <div style="margin-bottom: 30px; line-height: 1.6; font-size: 14px;">
              <strong>Date of Issue:</strong> ${moment().format('DD/MM/YYYY')}<br />
              <strong>Receipt No:</strong> BK-9824X
            </div>
            
            <!-- Patient Information -->
            <div style="margin-bottom: 30px;">
              <h3 style="border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; margin-bottom: 12px; font-size: 16px; color: #111827;">Patient Information</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.8;">
                <tr>
                  <td style="width: 30%; font-weight: bold; padding: 2px 0;">Patient Name:</td>
                  <td>${patientInfo.name || 'John Doe'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; padding: 2px 0;">Patient ID:</td>
                  <td>${patientInfo.nic || 'P-482098'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; padding: 2px 0;">Address:</td>
                  <td>${patientInfo.address || 'Colombo, Sri Lanka'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; padding: 2px 0;">Phone Number:</td>
                  <td>${patientInfo.mobile || '-'}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; padding: 2px 0;">Date of Admission:</td>
                  <td>${moment(date, 'YYYY-MM-DD').isValid() ? moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; padding: 2px 0;">Date of Discharge:</td>
                  <td>${moment(date, 'YYYY-MM-DD').isValid() ? moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')} (Same day outpatient)</td>
                </tr>
                <tr>
                  <td style="font-weight: bold; padding: 2px 0;">Doctor in Charge:</td>
                  <td>${doctorName}</td>
                </tr>
              </table>
            </div>
            
            <!-- Bill Details -->
            <div style="margin-bottom: 30px;">
              <h3 style="border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; margin-bottom: 15px; font-size: 16px; color: #111827;">Bill Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
                <thead>
                  <tr style="border: 1px solid #9CA3AF;">
                    <th style="padding: 12px; border: 1px solid #9CA3AF; text-align: center; width: 45%;">Description</th>
                    <th style="padding: 12px; border: 1px solid #9CA3AF; text-align: center; width: 15%;">Quantity</th>
                    <th style="padding: 12px; border: 1px solid #9CA3AF; text-align: center; width: 20%;">Unit Price</th>
                    <th style="padding: 12px; border: 1px solid #9CA3AF; text-align: center; width: 20%;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border: 1px solid #9CA3AF;">
                    <td style="padding: 12px; border: 1px solid #9CA3AF;">Hospital Charges (Facility Fee)</td>
                    <td style="padding: 12px; border: 1px solid #9CA3AF; text-align: center;">1 Day</td>
                    <td style="padding: 12px; border: 1px solid #9CA3AF; text-align: right;">LKR ${HOSPITAL_FEE.toFixed(2)}</td>
                    <td style="padding: 12px; border: 1px solid #9CA3AF; text-align: right; font-weight: bold;">LKR ${HOSPITAL_FEE.toFixed(2)}</td>
                  </tr>
                  <tr style="border: 1px solid #9CA3AF;">
                    <td style="padding: 12px; border: 1px solid #9CA3AF;">Doctor Consultation Fee</td>
                    <td style="padding: 12px; border: 1px solid #9CA3AF; text-align: center;">1 Visit</td>
                    <td style="padding: 12px; border: 1px solid #9CA3AF; text-align: right;">LKR ${CHANNELING_FEE.toFixed(2)}</td>
                    <td style="padding: 12px; border: 1px solid #9CA3AF; text-align: right; font-weight: bold;">LKR ${CHANNELING_FEE.toFixed(2)}</td>
                  </tr>
                  <tr style="border: 1px solid #9CA3AF; background-color: #F9FAFB;">
                    <td colspan="3" style="padding: 12px; border: 1px solid #9CA3AF; text-align: right; font-weight: bold;">Total Amount Paid</td>
                    <td style="padding: 12px; border: 1px solid #9CA3AF; text-align: right; font-weight: bold; color: #00a896; font-size: 16px;">LKR ${TOTAL_AMOUNT.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Footer Notes -->
            <div style="text-align: center; margin-top: 60px; color: #9CA3AF; font-size: 12px; border-top: 1px dashed #E5E7EB; padding-top: 15px;">
              <p>Thank you for choosing MediAI. Please produce this receipt/e-token at the channeling center.</p>
              <p style="margin-top: 5px;">MediAI Smart Healthcare Channeling Assistant &copy; 2026</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Saved', 'Receipt saved to your documents.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate receipt.');
    }
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
      
      <Text style={styles.inputLabel}>Email Address (Optional)</Text>
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
      <View style={[styles.summaryCard, SHADOWS.small]}>
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
          <Text style={styles.inputLabel}>Any Special Notes for Reception (Optional)</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={2} placeholder="Optional notes for hospital staff..." value={paymentInfo.notes} onChangeText={(t) => setPaymentInfo({...paymentInfo, notes: t})} />
        </View>
      )}

      {paymentInfo.method === 'Insurance' && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.inputLabel}>Insurance Provider</Text>
          <TextInput style={styles.input} placeholder="e.g. Ceylinco, AIA" value={paymentInfo.insuranceProvider} onChangeText={(t) => setPaymentInfo({...paymentInfo, insuranceProvider: t})} />
        </View>
      )}

      <Text style={[styles.inputLabel, { marginTop: 16 }]}>Promo / Discount Code (Optional)</Text>
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
          <View style={styles.receiptRow}><Text style={styles.rLabel}>Queue No</Text><Text style={[styles.rValue, { fontSize: 18, color: COLORS.primary, fontWeight: '800' }]}>{assignedQueueNumber ?? '-'}</Text></View>
          
          <View style={styles.divider} />
          <View style={styles.receiptRow}><Text style={styles.rLabel}>Amount Paid</Text><Text style={[styles.rValue, { fontWeight: '700' }]}>LKR {TOTAL_AMOUNT.toFixed(2)}</Text></View>
        </View>

        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadReceipt}>
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

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          {currentStep === 0 && renderPatientInfo()}
          {currentStep === 1 && renderMedicalDetails()}
          {currentStep === 2 && renderReviewAndPay()}
          {currentStep === 3 && renderReceipt()}
        </ScrollView>
      </KeyboardAvoidingView>

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
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 30 : 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    
    zIndex:20,  
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
  homeBtn: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  homeBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  }
});

export default BookAppointmentScreen;
