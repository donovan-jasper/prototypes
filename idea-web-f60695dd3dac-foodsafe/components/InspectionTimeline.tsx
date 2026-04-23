import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Inspection } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface InspectionTimelineProps {
  inspections: Inspection[];
}

const InspectionTimeline: React.FC<InspectionTimelineProps> = ({ inspections }) => {
  if (inspections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No inspection history available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {inspections.map((inspection, index) => (
        <View key={inspection.id} style={styles.inspectionItem}>
          <View style={styles.timelineDotContainer}>
            <View style={styles.timelineDot} />
            {index < inspections.length - 1 && <View style={styles.timelineLine} />}
          </View>

          <View style={styles.inspectionContent}>
            <View style={styles.header}>
              <Text style={styles.date}>{new Date(inspection.date).toLocaleDateString()}</Text>
              <View style={styles.scoreContainer}>
                <Ionicons
                  name="star"
                  size={16}
                  color={inspection.score >= 90 ? '#4CAF50' : inspection.score >= 70 ? '#FFC107' : '#F44336'}
                />
                <Text style={styles.score}>{inspection.score}</Text>
              </View>
            </View>

            <Text style={styles.violationCount}>
              {inspection.violations.length} violation{inspection.violations.length !== 1 ? 's' : ''}
            </Text>

            {inspection.violations.length > 0 && (
              <View style={styles.violationsContainer}>
                {inspection.violations.map((violation) => (
                  <View key={violation.id} style={styles.violationItem}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color={
                        violation.severity === 'high' ? '#F44336' :
                        violation.severity === 'medium' ? '#FFC107' : '#4CAF50'
                      }
                    />
                    <Text style={styles.violationText}>{violation.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  inspectionItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDotContainer: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#eee',
  },
  inspectionContent: {
    flex: 1,
    marginLeft: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  violationCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  violationsContainer: {
    marginTop: 5,
  },
  violationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  violationText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#444',
    flex: 1,
  },
});

export default InspectionTimeline;
