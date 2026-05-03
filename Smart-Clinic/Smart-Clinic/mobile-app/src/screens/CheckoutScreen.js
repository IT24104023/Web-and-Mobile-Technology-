import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../api';
import { theme } from '../theme';

function formatCard(val) {
  return val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

export default function CheckoutScreen({ route, navigation }) {
  const { orderId, amount } = route.params;
  const [method, setMethod] = useState('CARD');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handlePay = () => {
    if (method === 'CARD') {
      if (!card.number || card.number.replace(/\s/g, '').length !== 16) return Alert.alert('Error', 'Invalid card number');
      if (!card.name || card.name.trim().length < 3) return Alert.alert('Error', 'Invalid name');
      
      if (!card.expiry || !/^\d{2}\/\d{2}$/.test(card.expiry)) {
        return Alert.alert('Error', 'Invalid expiry (MM/YY)');
      } else {
        const parts = card.expiry.split('/');
        const mm = parseInt(parts[0], 10);
        const yy = parseInt(parts[1], 10);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        
        if (mm < 1 || mm > 12) return Alert.alert('Error', 'Invalid expiry month');
        if (yy < currentYear || (yy === currentYear && mm < currentMonth)) return Alert.alert('Error', 'Card has expired');
        if (yy > currentYear + 6) return Alert.alert('Error', 'Expiry date cannot exceed 6 years from now');
      }

      if (!card.cvv || card.cvv.length < 3) return Alert.alert('Error', 'Invalid CVV');
    }

    setLoading(true);
    axios.post(`${API_URL}/payments`, {
      orderId,
      cardNumber: card.number,
      cardHolderName: card.name,
      cardExpiry: card.expiry,
      cvv: card.cvv,
      paymentMethod: method
    })
    .then(res => {
      setSuccess(res.data);
      setLoading(false);
    })
    .catch(err => {
      setLoading(false);
      Alert.alert('Payment Failed', err.response?.data?.error || 'Please try again.');
    });
  };

  if (success) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>✅</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981', marginBottom: 10 }}>Payment Successful!</Text>
        <Text style={{ color: '#64748b', marginBottom: 20 }}>Your medication order has been confirmed.</Text>
        
        <View style={styles.successBlock}>
          <Text style={{ color: '#64748b' }}>Transaction ID</Text>
          <Text style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{success.transactionId}</Text>
        </View>
        <View style={[styles.successBlock, { marginBottom: 30 }]}>
          <Text style={{ color: '#64748b' }}>Amount Paid</Text>
          <Text style={{ fontWeight: 'bold' }}>Rs. {amount.toFixed(2)}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.payBtn, { width: '100%' }]} 
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.payBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Order #{orderId.slice(-6).toUpperCase()} · Total Due</Text>
        <Text style={styles.heroAmount}>Rs. {amount.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Payment Method</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity 
            style={[styles.methodBtn, method === 'CARD' && styles.methodBtnActive]}
            onPress={() => setMethod('CARD')}
          >
            <Text>💳 Card</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.methodBtn, method === 'BANK_TRANSFER' && styles.methodBtnActive]}
            onPress={() => setMethod('BANK_TRANSFER')}
          >
            <Text>🏦 Bank Transfer</Text>
          </TouchableOpacity>
        </View>

        {method === 'CARD' && (
          <View>
            <Text style={styles.label}>Card Number</Text>
            <TextInput 
              style={styles.input} 
              placeholder="4242 4242 4242 4242"
              keyboardType="numeric"
              maxLength={19}
              value={card.number}
              onChangeText={(val) => setCard({ ...card, number: formatCard(val) })}
            />

            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Sarah Johnson"
              value={card.name}
              onChangeText={(val) => setCard({ ...card, name: val })}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Expiry (MM/YY)</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="12/27"
                  maxLength={5}
                  value={card.expiry}
                  onChangeText={(val) => {
                    let v = val.replace(/\D/g, '');
                    if (v.length > 2) v = v.substring(0,2) + '/' + v.substring(2,4);
                    setCard({ ...card, expiry: v });
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CVV</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="123"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  value={card.cvv}
                  onChangeText={(val) => setCard({ ...card, cvv: val.replace(/\D/g, '') })}
                />
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>🔒 Pay Rs. {amount.toFixed(2)}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  hero: { backgroundColor: theme.colors.primaryContainer, padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  heroLabel: { color: theme.colors.surface, fontWeight: 'bold' },
  heroAmount: { fontSize: 32, fontWeight: 'bold', color: theme.colors.surface, marginVertical: 10 },
  card: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 12, marginBottom: 40, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: theme.colors.text },
  methodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  methodBtn: { flex: 1, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.outline, alignItems: 'center', marginHorizontal: 5 },
  methodBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.secondaryFixed },
  label: { fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: theme.colors.outline, padding: 12, borderRadius: 8, marginBottom: 15, color: theme.colors.text },
  payBtn: { backgroundColor: theme.colors.success, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  payBtnText: { color: theme.colors.surface, fontWeight: 'bold', fontSize: 16 },
  successBlock: { width: '100%', backgroundColor: theme.colors.surfaceVariant, padding: 15, borderRadius: 8, marginBottom: 10 }
});
