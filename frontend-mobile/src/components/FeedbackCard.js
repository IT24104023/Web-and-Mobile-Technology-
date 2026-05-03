import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StarRating from './StarRating';
import ReplySection from './ReplySection';

export default function FeedbackCard({ feedback, onEdit, onDelete }) {
  const {
    appUsabilityRating,
    consultationRating,
    doctorServiceRating,
    overallComments,
    doctorReply,
    adminReply,
    createdAt,
    doctorId,
    patientId
  } = feedback;

  const dateStr = new Date(createdAt).toLocaleDateString();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.doctorName}>Dr. {doctorId?.full_name || 'Doctor'}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={() => onEdit(feedback)} style={styles.actionBtn}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(feedback)} style={styles.actionBtn}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.ratingRow}>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>App</Text>
          <StarRating rating={appUsabilityRating} size={14} editable={false} />
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Consult</Text>
          <StarRating rating={consultationRating} size={14} editable={false} />
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Service</Text>
          <StarRating rating={doctorServiceRating} size={14} editable={false} />
        </View>
      </View>

      {overallComments ? (
        <Text style={styles.comment} numberOfLines={3}>{overallComments}</Text>
      ) : null}

      <View style={styles.replies}>
        {doctorReply?.text && (
          <ReplySection 
            authorName={doctorId?.full_name || 'Doctor'} 
            authorType="doctor" 
            replyText={doctorReply.text} 
            repliedAt={doctorReply.repliedAt} 
          />
        )}
        {adminReply?.text && (
          <ReplySection 
            authorName="Admin" 
            authorType="admin" 
            replyText={adminReply.text} 
            repliedAt={adminReply.repliedAt} 
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    marginLeft: 12,
  },
  editText: {
    color: '#2D7D9A',
    fontWeight: '600',
  },
  deleteText: {
    color: '#FF4D4D',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  ratingItem: {
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  comment: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  replies: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 8,
  }
});
