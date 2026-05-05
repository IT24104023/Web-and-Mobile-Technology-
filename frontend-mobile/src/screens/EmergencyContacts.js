import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { emergencyAPI } from '../services/api';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleError = (message) => {
    Alert.alert('Error', message || 'Something went wrong.');
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await emergencyAPI.getContacts();
      setContacts(response.data || []);
    } catch (error) {
      console.error('fetchContacts error', error);
      handleError(error.response?.data?.message || 'Unable to load emergency contacts.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setName(contact.name);
      setRelationship(contact.relationship);
      setPhone(contact.phone);
      setAlternatePhone(contact.alternatePhone || '');
      setEmail(contact.email || '');
      setIsPrimary(Boolean(contact.isPrimary));
    } else {
      setEditingContact(null);
      setName('');
      setRelationship('');
      setPhone('');
      setAlternatePhone('');
      setEmail('');
      setIsPrimary(false);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSubmitting(false);
  };

  const submitContact = async () => {
    if (!name.trim() || !relationship.trim() || !phone.trim()) {
      handleError('Please complete the required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        relationship: relationship.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone.trim(),
        email: email.trim(),
        isPrimary,
      };

      let response;
      if (editingContact) {
        response = await emergencyAPI.updateContact(editingContact._id, payload);
      } else {
        response = await emergencyAPI.addContact(payload);
      }

      if (editingContact) {
        setContacts((current) => current.map((item) => (item._id === response.data._id ? response.data : item)));
      } else {
        setContacts((current) => [response.data, ...current]);
      }

      closeModal();
    } catch (error) {
      console.error('submitContact error', error);
      handleError(error.response?.data?.message || 'Unable to save emergency contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (contactId) => {
    Alert.alert(
      'Delete contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteContact(contactId) },
      ]
    );
  };

  const deleteContact = async (contactId) => {
    setSubmitting(true);
    try {
      await emergencyAPI.deleteContact(contactId);
      setContacts((current) => current.filter((item) => item._id !== contactId));
    } catch (error) {
      console.error('deleteContact error', error);
      handleError(error.response?.data?.message || 'Unable to delete emergency contact.');
    } finally {
      setSubmitting(false);
    }
  };

  const setPrimaryContact = async (contactId) => {
    setSubmitting(true);
    try {
      const response = await emergencyAPI.setPrimary(contactId);
      setContacts((current) =>
        current.map((item) => ({
          ...item,
          isPrimary: item._id === response.data._id,
        }))
      );
    } catch (error) {
      console.error('setPrimaryContact error', error);
      handleError(error.response?.data?.message || 'Unable to update primary contact.');
    } finally {
      setSubmitting(false);
    }
  };


  const renderContact = ({ item }) => {
    return (
      <View style={[styles.contactCard, !!item.isPrimary && styles.primaryContact]}>
        <View style={styles.headerRow}>
          <Text style={styles.contactName}>{item.name}</Text>
          {!!item.isPrimary ? <Text style={styles.primaryBadge}>Primary</Text> : null}
        </View>
        <Text style={styles.contactText}>{item.relationship}</Text>
        <Text style={styles.contactText}>Phone: {item.phone}</Text>
        {item.alternatePhone ? <Text style={styles.contactText}>Alt: {item.alternatePhone}</Text> : null}
        {item.email ? <Text style={styles.contactText}>Email: {item.email}</Text> : null}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => openModal(item)}>
            <Text style={styles.actionLabel}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => confirmDelete(item._id)}>
            <Text style={styles.actionLabel}>Delete</Text>
          </TouchableOpacity>
          {!item.isPrimary ? (
            <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={() => setPrimaryContact(item._id)}>
              <Text style={styles.actionLabel}>Set Primary</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No emergency contacts yet.</Text>
          <Text style={styles.emptySubtitle}>Add a trusted contact so your care team can reach them quickly.</Text>
          <TouchableOpacity style={styles.bookFirstButton} onPress={() => openModal()}>
            <Text style={styles.bookFirstText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={contacts}
            keyExtractor={(item) => item._id}
            renderItem={renderContact}
            contentContainerStyle={styles.listContainer}
            refreshing={loading}
            onRefresh={() => fetchContacts()}
          />
          <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingContact ? 'Edit Contact' : 'Add Contact'}</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.closeModalText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Contact name"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Relationship</Text>
                <TextInput
                  style={styles.input}
                  value={relationship}
                  onChangeText={setRelationship}
                  placeholder="Relationship"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Primary phone"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alternate Phone</Text>
                <TextInput
                  style={styles.input}
                  value={alternatePhone}
                  onChangeText={setAlternatePhone}
                  placeholder="Alternate phone"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Primary contact</Text>
                <Switch 
                  value={!!isPrimary} 
                  onValueChange={setIsPrimary} 
                  trackColor={{ false: '#e2e8f0', true: '#0d9488' }}
                  thumbColor="#fff"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={submitContact} disabled={submitting}>
                <Text style={styles.saveText}>{submitting ? 'Saving...' : 'Save Contact'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  bookFirstButton: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookFirstText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  primaryContact: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
    borderWidth: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  primaryBadge: {
    fontSize: 11,
    color: '#0d9488',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  primaryButton: {
    backgroundColor: '#f0fdfa',
  },
  actionLabel: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0d9488',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeModalText: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#475569',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1e293b',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
  },
  saveButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EmergencyContacts;
