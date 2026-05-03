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
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  banner: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  bannerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  appointmentStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  confirmButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  completeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
