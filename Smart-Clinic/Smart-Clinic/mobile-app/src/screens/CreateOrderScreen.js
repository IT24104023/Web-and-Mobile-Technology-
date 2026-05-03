import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../api';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../theme';
const PATIENTS = [
  { name: 'yohani dhanushika', phone: '0771234567', prescriptionId: 'PRES-2026-001' },
  { name: 'ranga perera', phone: '0712345678', prescriptionId: 'PRES-2026-002' },
  { name: 'amani jayaweera', phone: '0756789012', prescriptionId: 'PRES-2026-003' },
  { name: 'kushani nimesha', phone: '0765432198', prescriptionId: 'PRES-2026-004' },
  { name: 'senu sehansa', phone: '0787654321', prescriptionId: 'PRES-2026-005' },
  { name: 'awishka nuwan', phone: '0798765432', prescriptionId: 'PRES-2026-006' },
  { name: 'Amara Silva', phone: '0711223344', prescriptionId: 'PRES-2026-007' },
  { name: 'Lucas Perera', phone: '0722334455', prescriptionId: 'PRES-2024-008' },
];

const MEDICATIONS = [
  { name: 'Amoxicillin 500mg', dosage: '1 tablet 3× daily', price: 10.00 },
  { name: 'Ibuprofen 400mg', dosage: '1 tablet on pain', price: 8.00 },
  { name: 'Metronidazole 200mg', dosage: '1 tablet 2× daily', price: 12.00 },
  { name: 'Chlorhexidine Mouthwash', dosage: 'Rinse 2× daily', price: 15.00 },
  { name: 'Paracetamol 500mg', dosage: '1–2 tablets on pain', price: 5.00 },
  { name: 'Clindamycin 150mg', dosage: '1 capsule 4× daily', price: 18.00 },
];

export default function CreateOrderScreen({ navigation }) {
  const [form, setForm] = useState({ patientName: '', patientPhone: '', prescriptionId: '' });
  const [items, setItems] = useState(
    MEDICATIONS.map(m => ({ ...m, selected: false, quantity: 1 }))
  );
  const [saving, setSaving] = useState(false);

  const toggleItem = (index) => {
    const newItems = [...items];
    newItems[index].selected = !newItems[index].selected;
    setItems(newItems);
  };

  const updateQty = (index, qty) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, parseInt(qty) || 1);
    setItems(newItems);
  };

  const selectedItems = items.filter(i => i.selected);
  const total = selectedItems.reduce((s, i) => s + (i.price * i.quantity), 0);

  const handleSave = () => {
    if (!form.patientName) return Alert.alert('Error', 'Please select a patient.');
    if (selectedItems.length === 0) return Alert.alert('Error', 'Select at least one medication.');

    setSaving(true);
    const payload = {
      patientName: form.patientName,
      patientPhone: form.patientPhone,
      prescriptionId: form.prescriptionId,
      items: selectedItems.map(i => ({
        medicationName: i.name,
        dosage: i.dosage,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.price * i.quantity
      }))
    };

    axios.post(`${API_URL}/orders`, payload)
      .then(() => {
        setSaving(false);
        navigation.goBack();
      })
      .catch(err => {
        setSaving(false);
        Alert.alert('Error', err.response?.data?.error || 'Failed to create order');
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Patient Information</Text>
        <Picker
          selectedValue={form.patientName}
          onValueChange={(val) => {
            const p = PATIENTS.find(x => x.name === val);
            if (p) setForm({ patientName: p.name, patientPhone: p.phone, prescriptionId: p.prescriptionId });
            else setForm({ patientName: '', patientPhone: '', prescriptionId: '' });
          }}
        >
          <Picker.Item label="-- Select a patient --" value="" />
          {PATIENTS.map(p => <Picker.Item key={p.name} label={p.name} value={p.name} />)}
        </Picker>

        {form.patientName ? (
          <View style={styles.preview}>
            <Text style={styles.previewText}>Phone: {form.patientPhone}</Text>
            <Text style={styles.previewText}>Prescription ID: {form.prescriptionId}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Select Medications</Text>
        {items.map((med, i) => (
          <View key={i} style={[styles.medItem, med.selected && styles.medSelected]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleItem(i)}>
              <Text style={styles.medName}>{med.selected ? '✅ ' : '⬜ '}{med.name}</Text>
              <Text style={styles.medDosage}>{med.dosage}</Text>
            </TouchableOpacity>
            {med.selected && (
              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                value={String(med.quantity)}
                onChangeText={(val) => updateQty(i, val)}
              />
            )}
            <Text style={styles.medPrice}>Rs. {med.price.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.title}>Order Summary</Text>
        <Text style={styles.totalText}>Total: Rs. {total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Create Order</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  card: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  summaryCard: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12, marginBottom: 40, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: theme.colors.text },
  preview: { marginTop: 10, padding: 10, backgroundColor: theme.colors.surfaceVariant, borderRadius: 8 },
  previewText: { color: theme.colors.textSecondary },
  medItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceVariant },
  medSelected: { backgroundColor: '#f0fdf4' }, // Can keep this green or use theme.colors.secondaryFixed
  medName: { fontWeight: 'bold', color: theme.colors.text },
  medDosage: { color: theme.colors.textSecondary, fontSize: 12, marginLeft: 22 },
  qtyInput: { borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 6, width: 40, textAlign: 'center', marginRight: 10, color: theme.colors.text },
  medPrice: { fontWeight: 'bold', color: theme.colors.text },
  totalText: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary, marginVertical: 12 },
  saveBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: theme.colors.surface, fontWeight: 'bold', fontSize: 16 }
});
