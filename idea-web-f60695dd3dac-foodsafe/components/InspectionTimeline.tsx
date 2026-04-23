import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Inspection } from '@/types';

interface InspectionTimelineProps {
  inspections: Inspection[];
  isPremium: boolean;
}

const InspectionTimeline: React.FC<InspectionTimelineProps> = ({ inspections, isPremium }) => {
  // Sort inspections by date (newest first)
  const sortedInspections = [...inspections].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Show only the last 3 inspections for free users
  const visibleInspections = isPremium ? sortedInspections : sortedInspections.slice(0, 3);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get violation summary
  const getViolationSummary = (inspection: Inspection) => {
    if (inspection.violations.length === 0) {
      return 'No violations';
    }

    const criticalCount = inspection.violations.filter(v => v.severity === 'critical').length;
    const highCount = inspection.violations.filter(v => v.severity === 'high').length;
    const mediumCount = inspection.violations.filter(v => v.severity === 'medium').length;

    let summary = '';
    if (criticalCount > 0) summary += `${criticalCount} critical, `;
    if (highCount > 0) summary += `${highCount} high, `;
    if (mediumCount > 0) summary += `${mediumCount} medium, `;

    return summary.slice(0, -2); // Remove trailing comma and space
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };

  return (
    <View style={styles.container}>
      {visibleInspections.map((inspection, index) => (
        <View key={inspection.id} style={styles.inspectionItem}>
          <View style={styles.timelineDotContainer}>
            <View style={styles.timelineDot} />
            {index < visibleInspections.length - 1 && <View style={styles.timelineLine} />}
          </View>

          <View style={styles.inspectionContent}>
            <View style={styles.header}>
              <Text style={styles.date}>{formatDate(inspection.date)}</Text>
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(inspection.score) }]}>
                <Text style={styles.scoreText}>{inspection.score}</Text>
              </View>
            </View>

            <Text style={styles.violationSummary}>
              {getViolationSummary(inspection)}
            </Text>

            {inspection.violations.length > 0 && isPremium && (
              <View style={styles.violationsContainer}>
                {inspection.violations.map(violation => (
                  <View key={violation.id} style={styles.violationItem}>
                    <Text style={styles.violationText}>
                      {violation.description} ({violation.severity})
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      ))}

      {!isPremium && inspections.length > 3 && (
        <View style={styles.premiumPrompt}>
          <Text style={styles.premiumText}>
            See full inspection history with SafeBite Pro
          </Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
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
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e0e0e0',
  },
  inspectionContent: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  scoreBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
  },
  violationSummary: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  violationsContainer: {
    marginTop: 8,
  },
  violationItem: {
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  violationText: {
    fontSize: 12,
    color: '#333',
  },
  premiumPrompt: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default InspectionTimeline;
