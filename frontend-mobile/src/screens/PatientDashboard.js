import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function PatientDashboard({ navigation }) {
  const { user, logout } = useAuth();

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

  const MenuItem = ({ icon, title, active, onPress }) => (
    <TouchableOpacity 
      style={[styles.menuItem, active && styles.menuItemActive]} 
      onPress={onPress}
    >
      <Text style={[styles.menuIcon, active && styles.menuIconActive]}>{icon}</Text>
      <Text style={[styles.menuText, active && styles.menuTextActive]}>{title}</Text>
    </TouchableOpacity>
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
        <View style={styles.headerSection}>
          <View style={styles.branding}>
            <Text style={styles.brandTitle}>Dent AI</Text>
            <Text style={styles.brandSubtitle}>CLINICAL PRECISION</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.sidebar}>
            <View style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userInitials}>{(user?.full_name || 'John Doe').charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{user?.full_name || 'John Doe'}</Text>
                <Text style={styles.userRole}>Patient</Text>
              </View>
            </View>

            <Text style={styles.menuSectionTitle}>Dashboard</Text>
            
            <MenuItem icon="🧠" title="AI Diagnostics" onPress={() => {}} />
            <MenuItem icon="📋" title="Appointments" onPress={() => navigation.navigate('Appointments')} />
            <MenuItem icon="📅" title="Book Appointment" active onPress={() => navigation.navigate('Booking')} />
            <MenuItem icon="💊" title="Prescriptions" onPress={() => {}} />
            <MenuItem icon="💉" title="Medications" onPress={() => {}} />

            <TouchableOpacity style={styles.emergencyButton} onPress={() => navigation.navigate('EmergencyContacts')}>
              <Text style={styles.emergencyIcon}>🚨</Text>
              <Text style={styles.emergencyText}>Emergency Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bookNowButton} onPress={() => navigation.navigate('Booking')}>
              <Text style={styles.bookNowIcon}>+</Text>
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signOutButton} onPress={logout}>
              <Text style={styles.signOutIcon}>→</Text>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dashboardContent}>
            <View style={styles.welcomeSection}>
              <View>
                <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
                <Text style={styles.welcomeTitle}>Hello, {user?.full_name || 'John Doe'}.</Text>
                <Text style={styles.welcomeSubtitle}>
                  Your smile is looking healthy. We've updated your clinical dashboard with the latest AI analysis and your upcoming schedule.
                </Text>
              </View>
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileEmoji}>👤</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <StatCard icon="📊" title="Total Analyses" value="0" />
              <StatCard icon="⚠️" title="Caries Found" value="0%" />
              <StatCard icon="🔍" title="Wounds Detected" value="0" />
              <StatCard icon="🔗" title="Calculus Cases" value="0" />
            </View>

            <View style={styles.bottomRow}>
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
                    <Text style={styles.detailText}>Book to see your time</Text>
                  </View>
                  <View style={styles.appointmentDetail}>
                    <Text style={styles.detailIcon}>🔧</Text>
                    <Text style={styles.detailText}>Routine Cleaning & Checkup</Text>
                  </View>
                </View>
                <View style={styles.doctorInfo}>
                  <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorEmoji}>👨‍⚕️</Text>
                  </View>
                  <View>
                    <Text style={styles.doctorLabel}>Doctor</Text>
                    <Text style={styles.doctorText}>Your assigned dentist</Text>
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

              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackTitleMain}>Recent Feedback</Text>
                <FeedbackItem 
                  title="Treatment Review" 
                  status="PENDING" 
                  statusColor="#f59e0b" 
                />
                <FeedbackItem 
                  title="Clinic Experience" 
                  status="COMPLETED" 
                  statusColor="#10b981" 
                />
              </View>
            </View>
          </View>
        </View>
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
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: 0.5,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainContent: {
    flexDirection: 'row',
    flex: 1,
    padding: 20,
    gap: 20,
  },
  sidebar: {
    width: 240,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  userRole: {
    fontSize: 12,
    color: '#64748b',
  },
  menuSectionTitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#e0f2fe',
    borderLeftWidth: 3,
    borderLeftColor: '#0d9488',
  },
  menuIcon: {
    fontSize: 16,
    color: '#64748b',
  },
  menuIconActive: {
    color: '#0d9488',
  },
  menuText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  menuTextActive: {
    color: '#0d9488',
    fontWeight: '600',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyIcon: {
    fontSize: 16,
  },
  emergencyText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '600',
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  bookNowIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookNowText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  signOutIcon: {
    color: '#dc2626',
    fontSize: 14,
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  dashboardContent: {
    flex: 1,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  welcomeLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    maxWidth: 400,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    fontSize: 20,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statBadgeText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  statTitle: {
    fontSize: 13,
    color: '#64748b',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 16,
  },
  upcomingCard: {
    flex: 1.2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  upcomingLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  calendarIcon: {
    fontSize: 20,
    color: '#0d9488',
  },
  upcomingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  appointmentInfo: {
    marginBottom: 16,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 14,
    color: '#64748b',
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorEmoji: {
    fontSize: 20,
  },
  doctorLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  doctorText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
  },
  bookAppointmentButton: {
    backgroundColor: '#0d9488',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookAppointmentText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  healthScanCard: {
    flex: 1,
    backgroundColor: '#0d9488',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  healthScanLabel: {
    fontSize: 11,
    color: '#ccfbf1',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  healthScanTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  healthScanStatus: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5eead4',
    borderRadius: 3,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  viewHistoryLink: {
    color: '#5eead4',
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackCard: {
    flex: 0.8,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
  },
  feedbackTitleMain: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
    marginBottom: 2,
  },
  feedbackStatus: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
