import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, FlatList } from 'react-native';
import { patientAPI } from '../services/api';

export default function AppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await patientAPI.getAppointments();
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'completed': return '#6366f1';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const handleCancel = async (id) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await patientAPI.cancelAppointment(id);
              fetchAppointments();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentTitle}>{item.reason || 'General Checkup'}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.detail}>👨‍⚕️ {item.doctorName}</Text>
      <Text style={styles.detail}>📅 {new Date(item.date).toLocaleDateString()} at {item.time}</Text>
      
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item._id)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'completed' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.feedbackButton} 
            onPress={() => navigation.navigate('FeedbackForm', { 
              appointmentId: item._id, 
              doctorId: item.doctorId, 
              doctorName: item.doctorName 
            })}
          >
            <Text style={styles.feedbackButtonText}>Give Feedback</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0d9488" />
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No appointments found.</Text>
          <TouchableOpacity 
            style={styles.bookFirstButton}
            onPress={() => navigation.navigate('Booking')}
          >
            <Text style={styles.bookFirstText}>Book your first visit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          renderItem={renderAppointment}
          contentContainerStyle={styles.content}
          refreshing={loading}
          onRefresh={fetchAppointments}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fef2f2',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 13,
  },
  feedbackButton: {
    flex: 1,
    backgroundColor: '#f0fdfa',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccfbf1',
  },
  feedbackButtonText: {
    color: '#0d9488',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
    marginBottom: 20,
  },
  bookFirstButton: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookFirstText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  }
});

