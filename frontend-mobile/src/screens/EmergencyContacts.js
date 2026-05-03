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
      <View style={styles.topBar}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No emergency contacts yet.</Text>
          <Text style={styles.emptySubtitle}>Add a trusted contact so your care team can reach them quickly.</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item._id}
          renderItem={renderContact}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={() => fetchContacts()}
        />
      )}

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{editingContact ? 'Edit Contact' : 'Add Contact'}</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Contact name"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Relationship</Text>
                <TextInput
                  style={styles.input}
                  value={relationship}
                  onChangeText={setRelationship}
                  placeholder="Relationship"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Primary phone"
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
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Primary contact</Text>
                <Switch value={!!isPrimary} onValueChange={setIsPrimary} thumbColor={isPrimary ? '#007AFF' : '#f4f3f4'} />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeModal} disabled={submitting}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={submitContact} disabled={submitting}>
                  <Text style={styles.saveText}>{submitting ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F4F6FA',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryContact: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  primaryBadge: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '700',
  },
  contactText: {
    fontSize: 15,
    color: '#374151',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
    marginTop: 8,
  },
  deleteButton: {
    backgroundColor: '#FECACA',
  },
  primaryButton: {
    backgroundColor: '#D1FAE5',
  },
  actionLabel: {
    color: '#111827',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: '#374151',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#111827',
    fontWeight: '700',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default EmergencyContacts;
