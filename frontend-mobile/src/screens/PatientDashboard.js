import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getMyFeedbacks } from '../services/feedbackService';

export default function PatientDashboard({ navigation }) {
  const { user } = useAuth();
  const [recentFeedback, setRecentFeedback] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const res = await getMyFeedbacks();
      if (res.success) setRecentFeedback(res.data.slice(0, 2));
    })();
  }, []);

  const StatCard = ({ icon, title, value }) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeText}>+0</Text>
        </View>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const FeedbackItem = ({ title, status, statusColor }) => (
    <View style={styles.feedbackItem}>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <View style={styles.feedbackContent}>
        <Text style={styles.feedbackTitle}>{title}</Text>
        <Text style={[styles.feedbackStatus, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
            <Text style={styles.welcomeTitle}>Hello, {user?.full_name?.split(' ')[0] || 'User'}.</Text>
            <Text style={styles.welcomeSubtitle}>
              Your smile is looking healthy. We've updated your clinical dashboard with the latest AI analysis.
            </Text>
          </View>
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileEmoji}>👤</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="📊" title="Total Analyses" value="0" />
          <StatCard icon="⚠️" title="Caries Found" value="0%" />
        </View>
        <View style={styles.statsGrid}>
          <StatCard icon="🔍" title="Wounds" value="0" />
          <StatCard icon="🔗" title="Calculus" value="0" />
        </View>

        <View style={styles.upcomingCard}>
          <View style={styles.upcomingHeader}>
            <Text style={styles.upcomingLabel}>UPCOMING VISITS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.upcomingTitle}>Next Appointment</Text>
          <View style={styles.appointmentInfo}>
            <View style={styles.appointmentDetail}>
              <Text style={styles.detailIcon}>📋</Text>
              <Text style={styles.detailText}>No upcoming appointments</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.bookAppointmentButton} 
            onPress={() => navigation.navigate('Booking')}
          >
            <Text style={styles.bookAppointmentText}>Book appointment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.healthScanCard}>
          <Text style={styles.healthScanLabel}>AI HEALTH SCAN</Text>
          <Text style={styles.healthScanTitle}>Oral Status:</Text>
          <Text style={styles.healthScanStatus}>Excellent</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '92%' }]} />
            </View>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreText}>Score: 92/100</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.viewHistoryLink}>View History →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.feedbackCard} onPress={() => navigation.navigate('Feedback')}>
          <Text style={styles.feedbackTitleMain}>Recent Feedback</Text>
          {recentFeedback.length === 0 ? (
            <Text style={styles.detailText}>No recent feedback.</Text>
          ) : (
            recentFeedback.map((f) => (
              <FeedbackItem 
                key={f._id}
                title={f.overallComments.substring(0, 20) + "..."} 
                status="SUBMITTED" 
                statusColor="#10b981" 
              />
            ))
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  welcomeLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  profileEmoji: {
    fontSize: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 18,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statBadgeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
  },
  upcomingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  upcomingLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 1,
  },
  calendarIcon: {
    fontSize: 18,
    color: '#0d9488',
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  appointmentInfo: {
    marginBottom: 16,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    fontSize: 14,
    color: '#64748b',
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
  },
  bookAppointmentButton: {
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookAppointmentText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  healthScanCard: {
    backgroundColor: '#0d9488',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  healthScanLabel: {
    fontSize: 10,
    color: '#ccfbf1',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  healthScanTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  healthScanStatus: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5eead4',
    borderRadius: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
  viewHistoryLink: {
    color: '#5eead4',
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  feedbackTitleMain: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  feedbackStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
});
