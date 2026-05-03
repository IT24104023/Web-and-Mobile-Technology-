import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, TextInput, Alert 
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../api';
import { theme } from '../theme';

function fmt(amt) { return 'Rs. ' + parseFloat(amt || 0).toFixed(2); }

export default function DashboardScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadOrders();
    });
    return unsubscribe;
  }, [navigation]);

  function loadOrders() {
    setLoading(true);
    axios.get(`${API_URL}/orders`)
      .then(res => {
        setOrders(res.data);
        setFiltered(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(() => {
    let result = orders.slice();
    if (search) {
      result = result.filter(o => 
        o._id.includes(search) || 
        (o.patientName && o.patientName.toLowerCase().includes(search.toLowerCase()))
      );
    }
    setFiltered(result);
  }, [search, orders]);

  const handleEdit = (order) => {
    if (['DELIVERED', 'CANCELLED', 'DISPATCHED', 'PROCESSING'].includes(order.orderStatus) || order.paymentStatus === 'PAID') {
      Alert.alert('Cannot Edit', 'This order cannot be edited due to its current status.');
      return;
    }
    navigation.navigate('EditOrder', { orderId: order._id });
  };

  const handlePay = (order) => {
    if (['DELIVERED', 'CANCELLED'].includes(order.orderStatus) || order.paymentStatus === 'PAID') {
      Alert.alert('Cannot Pay', 'This order cannot be paid or has already been paid.');
      return;
    }
    navigation.navigate('Checkout', { orderId: order._id, amount: order.totalAmount });
  };

  const handleCancel = (order) => {
    if (['DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      Alert.alert('Cannot Cancel', 'This order cannot be cancelled.');
      return;
    }
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No, Keep It', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            axios.delete(`${API_URL}/orders/${order._id}`)
              .then(() => loadOrders())
              .catch(err => Alert.alert('Error', 'Failed to cancel order.'));
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
      <Text style={styles.patientName}>{item.patientName}</Text>
      <Text style={styles.patientPhone}>{item.patientPhone}</Text>
      
      <View style={styles.row}>
        <Text>Status: {item.orderStatus}</Text>
        <Text>Payment: {item.paymentStatus}</Text>
      </View>
      
      <Text style={styles.total}>{fmt(item.totalAmount)}</Text>
      
      <View style={styles.actionRow}>
        {['DELIVERED', 'DISPATCHED', 'CANCELLED'].includes(item.orderStatus) ? null : item.paymentStatus === 'PAID' ? (
          <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => handleCancel(item)}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={[styles.btn, styles.btnEdit]} onPress={() => handleEdit(item)}>
              <Text style={styles.btnTextSecondary}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPay]} onPress={() => handlePay(item)}>
              <Text style={styles.btnText}>Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => handleCancel(item)}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name or ID..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateOrder')}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0ea5e9" style={{ marginTop: 20 }} />
      ) : (
        <FlatList 
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  header: { flexDirection: 'row', marginBottom: 16 },
  searchInput: { 
    flex: 1, backgroundColor: theme.colors.surface, padding: 10, 
    borderRadius: 8, borderWidth: 1, borderColor: theme.colors.outline, marginRight: 10,
    color: theme.colors.text
  },
  addBtn: { 
    backgroundColor: theme.colors.primary, paddingHorizontal: 16, 
    justifyContent: 'center', borderRadius: 8 
  },
  addBtnText: { color: theme.colors.surface, fontWeight: 'bold' },
  card: {
    backgroundColor: theme.colors.surface, padding: 16, borderRadius: 12,
    marginBottom: 12, borderWidth: 1, borderColor: theme.colors.surfaceVariant,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2
  },
  orderId: { fontWeight: 'bold', color: theme.colors.primaryContainer, marginBottom: 4 },
  patientName: { fontWeight: 'bold', fontSize: 16, color: theme.colors.text },
  patientPhone: { color: theme.colors.textSecondary, fontSize: 12, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  total: { fontWeight: 'bold', fontSize: 16, marginBottom: 12, color: theme.colors.text },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, padding: 8, borderRadius: 6, alignItems: 'center', marginHorizontal: 4 },
  btnEdit: { backgroundColor: theme.colors.surfaceVariant },
  btnPay: { backgroundColor: theme.colors.success },
  btnCancel: { backgroundColor: theme.colors.error },
  btnText: { fontWeight: 'bold', color: '#ffffff' },
  btnTextSecondary: { fontWeight: 'bold', color: theme.colors.textSecondary },
  emptyText: { textAlign: 'center', color: theme.colors.textSecondary, marginTop: 20 }
});
