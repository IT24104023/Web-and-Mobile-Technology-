import React from 'react';
import { ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
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
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { logout, user } = useAuth();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ padding: 20, backgroundColor: '#0d9488', marginBottom: 10 }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0d9488' }}>{user?.full_name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{user?.full_name || 'User'}</Text>
        <Text style={{ color: '#ccfbf1', fontSize: 14 }}>{user?.role?.toUpperCase()}</Text>
      </View>
      
      <DrawerItemList {...props} />
      
      <View style={{ marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#e2e8f0', padding: 10 }}>
        <DrawerItem
          label="Sign Out"
          onPress={logout}
          labelStyle={{ color: '#dc2626', fontWeight: 'bold' }}
          icon={({ color, size }) => <Text style={{ fontSize: size }}>→</Text>}
        />
      </View>
    </DrawerContentScrollView>
  );
}

function PatientDrawer() {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
        headerTintColor: '#0d9488',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        headerTitleAlign: 'center', // Centers title on Android too
        drawerActiveTintColor: '#0d9488',
        drawerInactiveTintColor: '#64748b',
        drawerStyle: { width: 280 },
      }}
    >
      <Drawer.Screen name="Dashboard" component={PatientDashboard} options={{ title: 'DentAI Dashboard', drawerIcon: () => <Text>🏠</Text> }} />
      <Drawer.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Appointment', drawerIcon: () => <Text>📅</Text> }} />
      <Drawer.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'My Appointments', drawerIcon: () => <Text>📋</Text> }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile', drawerIcon: () => <Text>👤</Text> }} />
      <Drawer.Screen name="EmergencyContacts" component={EmergencyContacts} options={{ title: 'Emergency Contacts', drawerIcon: () => <Text>🚨</Text> }} />
      <Drawer.Screen name="Feedback" component={FeedbackListScreen} options={{ title: 'Feedback', drawerIcon: () => <Text>⭐</Text> }} />
    </Drawer.Navigator>
  );
}

function DoctorDrawer() {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
        headerTintColor: '#0d9488',
        headerTitleStyle: { fontWeight: 'bold' },
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen name="Dashboard" component={DoctorDashboard} options={{ title: 'Doctor Portal' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    </Drawer.Navigator>
  );
}

function AdminDrawer() {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
        headerTintColor: '#0d9488',
        headerTitleStyle: { fontWeight: 'bold' },
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen name="Dashboard" component={AdminDashboard} options={{ title: 'Admin Panel' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={
          user.role === 'admin' ? AdminDrawer : 
          user.role === 'doctor' ? DoctorDrawer : 
          PatientDrawer
        } />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
