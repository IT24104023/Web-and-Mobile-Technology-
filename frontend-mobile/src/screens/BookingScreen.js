import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { authAPI, patientAPI } from '../services/api';
import { TIME_SLOTS } from '../utils/constants';

export default function BookingScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await authAPI.getDoctors();
      const doctorsData = res.data;
      setDoctors(doctorsData);
      if (doctorsData.length > 0) {
        setSelectedDoctor(doctorsData[0]);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      Alert.alert('Error', 'Failed to load doctors list. Please try again later.');
    } finally {
      setFetchingDoctors(false);
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot || !selectedDoctor) {
      Alert.alert('Selection Required', 'Please select a date, time slot, and doctor.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        doctorId: selectedDoctor._id,
        doctorName: selectedDoctor.full_name,
        date: selectedDate,
        time: selectedSlot,
        reason: reason.trim() || 'Routine Checkup'
      };

      await patientAPI.bookAppointment(payload);
      Alert.alert('Success', 'Your appointment has been booked successfully!', [
        { text: 'Great!', onPress: () => navigation.navigate('Appointments') }
      ]);
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Booking Failed', error.response?.data?.message || 'Unable to book appointment at this time.');
    } finally {
      setLoading(false);
    }
  };

  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    return days;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Select Doctor</Text>
          {fetchingDoctors ? (
            <ActivityIndicator color="#6366f1" />
          ) : (
            doctors.map((doctor) => (
              <TouchableOpacity
                key={doctor._id}
                style={[styles.doctorCard, selectedDoctor?._id === doctor._id && styles.doctorCardActive]}
                onPress={() => setSelectedDoctor(doctor)}
              >
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{doctor.full_name}</Text>
                  <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
                </View>
                {selectedDoctor?._id === doctor._id && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.datesContainer}>
              {getNext7Days().map((day) => (
                <TouchableOpacity
                  key={day.date}
                  style={[styles.dateCard, selectedDate === day.date && styles.dateCardActive]}
                  onPress={() => setSelectedDate(day.date)}
                >
                  <Text style={[styles.dateText, selectedDate === day.date && styles.dateTextActive]}>
                    {day.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Select Time Slot</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.slotsContainer}>
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotCard, selectedSlot === slot && styles.slotCardActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Reason for Visit</Text>
          <TextInput
            style={styles.textArea}
            value={reason}
            onChangeText={setReason}
            placeholder="Describe your dental concern..."
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity 
          style={[styles.bookButton, (!selectedDate || !selectedSlot || loading) && styles.bookButtonDisabled]}
          onPress={handleBook}
          disabled={!selectedDate || !selectedSlot || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  doctorCardActive: {
    borderColor: '#6366f1',
    backgroundColor: '#f5f3ff',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  checkmark: {
    fontSize: 24,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dateCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minWidth: 100,
  },
  dateCardActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  dateText: {
    fontSize: 12,
    color: '#1e293b',
    textAlign: 'center',
  },
  dateTextActive: {
    color: '#ffffff',
  },
  slotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  slotCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  slotCardActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  slotText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  slotTextActive: {
    color: '#ffffff',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#1e293b',
  },
  bookButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  bookButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

