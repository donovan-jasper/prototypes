import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Inspection } from '@/types';
import { Ionicons } from '@expo/vector-icons';

interface InspectionTimelineProps {
  inspections: Inspection[];
}

const InspectionTimeline: React.FC<InspectionTimelineProps> = ({ inspections }) => {
  // Sort inspections by date (newest first)
  const sortedInspections = [...inspections].sort((a, b) =>
    new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
  );

  return (
    <View style={styles.container}>
      {sortedInspections.map((inspection, index) => (
        <View key={inspection.id} style={styles.inspectionItem}>
          <View style={styles.timelineDot} />
          {index !== sortedInspections.length - 1 && (
            <View style={styles.timelineLine} />
          )}
          <View style={styles.inspectionContent}>
            <Text style={styles.inspectionDate}>
              {new Date(inspection.inspectionDate).toLocaleDateString()}
            </Text>
            <View style={styles.violationsSummary}>
              <View style={styles.violationCount}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={inspection.criticalViolations > 0 ? '#ff3b30' : '#ff9500'}
                />
                <Text style={[
                  styles.violationText,
                  inspection.criticalViolations > 0 ? styles.criticalText : styles.nonCriticalText
                ]}>
                  {inspection.criticalViolations} critical
                </Text>
              </View>
              <View style={styles.violationCount}>
                <Ionicons
                  name="alert-circle-outline"
                  size={16}
                  color="#ff9500"
                />
                <Text style={[styles.violationText, styles.nonCriticalText]}>
                  {inspection.nonCriticalViolations} non-critical
                </Text>
              </View>
            </View>
            {inspection.violations.length > 0 && (
              <View style={styles.violationsList}>
                {inspection.violations.map((violation, vIndex) => (
                  <View key={vIndex} style={styles.violationItem}>
                    <Ionicons
                      name="ellipse"
                      size={8}
                      color={violation.type === 'critical' ? '#ff3b30' : '#ff9500'}
                    />
                    <Text style={[
                      styles.violationDescription,
                      violation.type === 'critical' ? styles.criticalText : styles.nonCriticalText
                    ]}>
                      {violation.description}
                    </Text>
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
    paddingLeft: 16,
  },
  inspectionItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginRight: 12,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: -20,
    width: 2,
    backgroundColor: '#e0e0e0',
  },
  inspectionContent: {
    flex: 1,
  },
  inspectionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  violationsSummary: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  violationCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  violationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  criticalText: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  nonCriticalText: {
    color: '#ff9500',
  },
  violationsList: {
    marginTop: 8,
  },
  violationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  violationDescription: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default InspectionTimeline;
