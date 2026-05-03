import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import StarRating from '../components/StarRating';
import { submitFeedback } from '../services/feedbackService';

export default function FeedbackFormScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const params = route.params || {};

  const [appUsabilityRating, setAppUsabilityRating] = useState(5);
  const [appUsabilityComment, setAppUsabilityComment] = useState('');
  const [consultationRating, setConsultationRating] = useState(5);
  const [consultationComment, setConsultationComment] = useState('');
  const [doctorServiceRating, setDoctorServiceRating] = useState(5);
  const [doctorServiceComment, setDoctorServiceComment] = useState('');
  const [overallComments, setOverallComments] = useState('');

  const validate = () => {
    if (![1,2,3,4,5].includes(appUsabilityRating)) return 'App rating required';
    if (![1,2,3,4,5].includes(consultationRating)) return 'Consultation rating required';
    if (![1,2,3,4,5].includes(doctorServiceRating)) return 'Doctor service rating required';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return Alert.alert('Validation', err);

    try {
      const payload = {
        appointmentId: params.appointmentId,
        doctorId: params.doctorId,
        appUsabilityRating,
        appUsabilityComment,
        consultationRating,
        consultationComment,
        doctorServiceRating,
        doctorServiceComment,
        overallComments
      };

      const res = await submitFeedback(payload);
      if (res.success) {
        Alert.alert('Success', 'Feedback submitted');
        nav.goBack();
      } else {
        Alert.alert('Error', res.message || 'Submit failed');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity onPress={() => nav.goBack()} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#2D7D9A' }}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Submit Feedback</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>Appointment: {params.appointmentId || '—'} — Dr. {params.doctorName || '—'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 APP USABILITY</Text>
        <StarRating rating={appUsabilityRating} onRate={setAppUsabilityRating} />
        <TextInput placeholder='Comment' style={styles.input} value={appUsabilityComment} onChangeText={setAppUsabilityComment} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎧 CONSULTATION EXPERIENCE</Text>
        <StarRating rating={consultationRating} onRate={setConsultationRating} />
        <TextInput placeholder='Comment' style={styles.input} value={consultationComment} onChangeText={setConsultationComment} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏥 DOCTOR SERVICE</Text>
        <StarRating rating={doctorServiceRating} onRate={setDoctorServiceRating} />
        <TextInput placeholder='Comment' style={styles.input} value={doctorServiceComment} onChangeText={setDoctorServiceComment} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 OVERALL COMMENTS</Text>
        <TextInput placeholder='Overall comments' style={[styles.input, { height: 100 }]} value={overallComments} onChangeText={setOverallComments} multiline={true} />
      </View>

      <View style={{ marginTop: 16 }}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}><Text style={styles.submitText}>Submit Feedback</Text></TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => nav.goBack()}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  banner: { backgroundColor: '#E6F7FB', padding: 12, borderRadius: 8, marginBottom: 12 },
  bannerText: { color: '#2D7D9A', fontWeight: '600' },
  section: { marginTop: 12 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FA', padding: 10, borderRadius: 8, marginTop: 8 },
  submitBtn: { backgroundColor: '#2D7D9A', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { marginTop: 8, padding: 12, borderRadius: 10, alignItems: 'center' },
  cancelText: { color: '#2D7D9A', fontWeight: '700' }
});
