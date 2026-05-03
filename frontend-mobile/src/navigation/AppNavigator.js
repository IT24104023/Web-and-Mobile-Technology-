import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PatientDashboard from '../screens/PatientDashboard';
import DoctorDashboard from '../screens/DoctorDashboard';
import AdminDashboard from '../screens/AdminDashboard';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import BookingScreen from '../screens/BookingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EmergencyContacts from '../screens/EmergencyContacts';
import FeedbackFormScreen from '../screens/FeedbackFormScreen';
import FeedbackListScreen from '../screens/FeedbackListScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#fff' }, headerTitleStyle: { fontWeight: 'bold' } }}>
      {user ? (
        <>
          {/* Dynamic Dashboard based on user role */}
          {user.role === 'admin' ? (
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Admin Panel' }} />
          ) : user.role === 'doctor' ? (
            <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} options={{ title: 'Doctor Portal' }} />
          ) : (
            <Stack.Screen name="PatientDashboard" component={PatientDashboard} options={{ title: 'DentAI Patient' }} />
          )}

          {/* Shared screens */}
          <Stack.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'My Appointments' }} />
          <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Appointment' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
          <Stack.Screen name="EmergencyContacts" component={EmergencyContacts} options={{ title: 'Emergency Contacts' }} />
          <Stack.Screen name="FeedbackList" component={FeedbackListScreen} options={{ title: 'Feedback History' }} />
          <Stack.Screen name="FeedbackForm" component={FeedbackFormScreen} options={{ title: 'Submit Feedback' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
