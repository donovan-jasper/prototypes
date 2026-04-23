import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Inspection } from '@/types';
import { Colors } from '@/constants/Colors';

interface InspectionTimelineProps {
  inspections: Inspection[];
}

export const InspectionTimeline: React.FC<InspectionTimelineProps> = ({ inspections }) => {
  if (inspections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No inspection history available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {inspections.map((inspection, index) => {
        // Determine color based on score
        let color = Colors.green;
        if (inspection.score < 80) color = Colors.yellow;
        if (inspection.score < 70) color = Colors.red;

        return (
          <View key={inspection.id} style={styles.inspectionItem}>
            <View style={styles.timelineDotContainer}>
              <View style={[styles.timelineDot, { backgroundColor: color }]} />
              {index < inspections.length - 1 && <View style={styles.timelineLine} />}
            </View>

            <View style={styles.inspectionContent}>
              <View style={styles.inspectionHeader}>
                <Text style={styles.inspectionDate}>{inspection.date}</Text>
                <View style={[styles.scoreBadge, { backgroundColor: color }]}>
                  <Text style={styles.scoreText}>{inspection.score}</Text>
                </View>
              </View>

              <Text style={styles.violationCount}>
                {inspection.violations.length} {inspection.violations.length === 1 ? 'violation' : 'violations'}
              </Text>

              {inspection.violations.length > 0 && (
                <View style={styles.violationsContainer}>
                  {inspection.violations.map((violation) => (
                    <View key={violation.id} style={styles.violationItem}>
                      <View style={[
                        styles.violationSeverity,
                        {
                          backgroundColor:
                            violation.severity === 'high' ? Colors.red :
                            violation.severity === 'medium' ? Colors.yellow :
                            Colors.green
                        }
                      ]} />
                      <Text style={styles.violationText}>{violation.description}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  inspectionItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDotContainer: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 2,
  },
  inspectionContent: {
    flex: 1,
    marginLeft: 12,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inspectionDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scoreText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  violationCount: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  violationsContainer: {
    marginTop: 8,
  },
  violationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  violationSeverity: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  violationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
});
