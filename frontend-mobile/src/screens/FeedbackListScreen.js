import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeedbackCard from '../components/FeedbackCard';
import { getMyFeedbacks, getClinicReviews, deleteFeedback } from '../services/feedbackService';

export default function FeedbackListScreen() {
  const nav = useNavigation();
  const [loading, setLoading] = useState(true);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [clinicReviews, setClinicReviews] = useState([]);
  const [tab, setTab] = useState('mine');

  const load = async () => {
    setLoading(true);
    const [mineRes, clinicRes] = await Promise.all([getMyFeedbacks(), getClinicReviews()]);
    if (mineRes.success) setMyFeedbacks(mineRes.data);
    if (clinicRes.success) setClinicReviews(clinicRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (feedback) => {
    Alert.alert('Confirm', 'Delete feedback?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const res = await deleteFeedback(feedback._id);
        if (res.success) { Alert.alert('Deleted'); load(); } else Alert.alert('Error', res.message || 'Delete failed');
      } }
    ]);
  };

  const renderItem = ({ item }) => <FeedbackCard feedback={item} onDelete={handleDelete} onEdit={(f) => nav.navigate('FeedbackForm', { appointmentId: f.appointmentId, doctorId: f.doctorId?._id, doctorName: f.doctorId?.full_name, feedback })} />;

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>My Feedback</Text>
          <Text style={styles.subtitle}>Rate your completed consultations</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={() => nav.navigate('FeedbackForm')}>
          <Text style={styles.newBtnText}>+ New Feedback</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'mine' && styles.tabActive]} onPress={() => setTab('mine')}>
          <Text style={styles.tabText}>My Feedbacks [{myFeedbacks.length}]</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'clinic' && styles.tabActive]} onPress={() => setTab('clinic')}>
          <Text style={styles.tabText}>Clinic Reviews [{clinicReviews.length}]</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size='large' color='#2D7D9A' /> : (
        <FlatList data={tab === 'mine' ? myFeedbacks : clinicReviews} keyExtractor={i => i._id} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: '#F8F9FA' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  subtitle: { color: '#666' },
  newBtn: { backgroundColor: '#2D7D9A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  newBtnText: { color: '#fff', fontWeight: '700' },
  tabs: { flexDirection: 'row', marginTop: 16 },
  tab: { marginRight: 12, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  tabActive: { backgroundColor: '#E6F3F6' },
  tabText: { color: '#1A1A2E' }
});
