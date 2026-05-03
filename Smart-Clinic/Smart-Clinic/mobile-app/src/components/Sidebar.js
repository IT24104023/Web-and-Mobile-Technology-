import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { theme } from '../theme';

export default function Sidebar(props) {
  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.brand}>
          <Text style={styles.label}>CLINICAL PORTAL</Text>
          <Text style={styles.title}>Smart Clinic</Text>
        </View>
        <View style={styles.divider} />

        <DrawerItemList {...props} />

      </DrawerContentScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.emergencyBtn}>
          <Text style={styles.emergencyText}>Emergency Override</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingTop: 40,
  },
  brand: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#164e63',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(189,200,203,0.4)',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(189,200,203,0.3)',
  },
  emergencyBtn: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: 'rgba(186,26,26,0.25)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyText: {
    color: theme.colors.error,
    fontWeight: '600',
  }
});
