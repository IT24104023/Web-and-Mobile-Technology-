import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { doctorAPI } from '../services/api';

export default function DoctorDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await doctorAPI.getAppointments();
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'confirm') {
        await doctorAPI.confirmAppointment(id);
      } else if (action === 'complete') {
        await doctorAPI.completeAppointment(id);
      }
      fetchAppointments();
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} appointment`);
    }
  };

  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => new Date(a.date).toISOString().split('T')[0] === today);
    const pending = appointments.filter(a => a.status === 'pending');
    
    return {
      today: todayAppointments.length,
      week: appointments.length, // Simplified
      pending: pending.length
    };
  };

  const stats = getStats();

  const StatCard = ({ title, value, color }) => (
    <View style={[styles.statCard, { backgroundColor: color + '20' }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.full_name || 'Doctor'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              {stats.today === 0 ? "No appointments scheduled for today" : `You have ${stats.today} appointments today`}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <StatCard title="Today" value={stats.today} color="#6366f1" />
            <StatCard title="This Week" value={stats.week} color="#10b981" />
            <StatCard title="Pending" value={stats.pending} color="#f59e0b" />
          </View>

          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          {appointments.length === 0 ? (
            <Text style={styles.emptyText}>No appointments found.</Text>
          ) : (
            appointments.map((item) => (
              <View key={item._id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentTitle}>{item.patientName}</Text>
                  <Text style={[styles.appointmentStatus, { 
                    color: item.status === 'confirmed' ? '#10b981' : item.status === 'pending' ? '#f59e0b' : '#64748b' 
                  }]}>
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.appointmentDetail}>{item.reason || 'General Consultation'}</Text>
                <Text style={styles.appointmentDetail}>📅 {new Date(item.date).toLocaleDateString()} at {item.time}</Text>
                
                {item.status === 'pending' && (
                  <TouchableOpacity 
                    style={styles.confirmButton} 
                    onPress={() => handleAction(item._id, 'confirm')}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                )}
                
                {item.status === 'confirmed' && (
                  <TouchableOpacity 
                    style={styles.completeButton} 
                    onPress={() => handleAction(item._id, 'complete')}
                  >
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  banner: {
    backgroundColor: '#0d9488',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  appointmentStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appointmentDetail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  completeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 20,
    fontSize: 14,
  },
});
