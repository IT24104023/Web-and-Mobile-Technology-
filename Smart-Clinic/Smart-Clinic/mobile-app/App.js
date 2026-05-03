import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from './src/theme';

import DashboardScreen from './src/screens/DashboardScreen';
import CreateOrderScreen from './src/screens/CreateOrderScreen';
import EditOrderScreen from './src/screens/EditOrderScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import Sidebar from './src/components/Sidebar';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// We nest the stack navigator inside the drawer for screens that shouldn't show the drawer (like checkout, maybe edit order)
// Wait, the web app shows the sidebar on all screens! So we can just put all screens in the Drawer.
// But some screens shouldn't be in the Drawer menu list. We can hide them from the drawer list using drawerItemStyle: { display: 'none' }

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator 
        initialRouteName="Dashboard"
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary, elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '800' },
          drawerActiveBackgroundColor: '#ecfeff',
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: '#4b5563',
          drawerLabelStyle: { fontWeight: '600' },
        }}
      >
        <Drawer.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'Orders Dashboard', drawerLabel: 'Dashboard' }} 
        />
        <Drawer.Screen 
          name="CreateOrder" 
          component={CreateOrderScreen} 
          options={{ title: 'Create New Order', drawerLabel: 'New Order' }} 
        />
        <Drawer.Screen 
          name="EditOrder" 
          component={EditOrderScreen} 
          options={{ 
            title: 'Edit Order',
            drawerItemStyle: { display: 'none' }
          }} 
        />
        <Drawer.Screen 
          name="Checkout" 
          component={CheckoutScreen} 
          options={{ 
            title: 'Checkout',
            drawerItemStyle: { display: 'none' }
          }} 
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
