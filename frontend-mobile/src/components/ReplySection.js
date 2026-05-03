import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReplySection({ authorName, authorType, replyText, repliedAt }) {
  const isDoctor = authorType === 'doctor';
  const badgeStyle = isDoctor ? styles.doctorBadge : styles.adminBadge;
  const date = repliedAt ? new Date(repliedAt) : null;
  const dateStr = date ? `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}` : '';

  return (
    <View style={styles.container}>
      <View style={[styles.badge, badgeStyle]}>
        <Text style={styles.badgeText}>{isDoctor ? `Dr. ${authorName}` : 'Admin'}</Text>
      </View>
      <View style={styles.bubble}>
        <Text style={styles.text}>{replyText}</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  doctorBadge: { backgroundColor: '#6C5CE7' },
  adminBadge: { backgroundColor: '#BDBDBD' },
  badgeText: { color: '#fff', fontWeight: '600' },
  bubble: { backgroundColor: '#F8F9FA', padding: 10, borderRadius: 8, flex: 1 },
  text: { color: '#1A1A2E' },
  date: { color: '#666', fontSize: 12, marginTop: 6 }
});
