import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SubmissionStatusBadgeProps {
  status: 'not_started' | 'submitted' | 'approved' | 'rejected';
}

export default function SubmissionStatusBadge({ status }: SubmissionStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'not_started':
        return { label: 'Not Started', color: '#999', backgroundColor: '#F5F5F5' };
      case 'submitted':
        return { label: 'Submitted', color: '#007AFF', backgroundColor: '#E3F2FD' };
      case 'approved':
        return { label: 'Approved', color: '#4CAF50', backgroundColor: '#E8F5E9' };
      case 'rejected':
        return { label: 'Rejected', color: '#F44336', backgroundColor: '#FFEBEE' };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
