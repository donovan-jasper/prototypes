import { getInspections } from '@/services/api';

interface SafetyScoreResult {
  grade: string;
  score: number;
  criticalViolations: number;
  nonCriticalViolations: number;
  lastInspectionDate: string;
}

export const calculateSafetyScore = async (establishmentId: string): Promise<SafetyScoreResult> => {
  try {
    const inspections = await getInspections(establishmentId);

    if (inspections.length === 0) {
      return {
        grade: 'A',
        score: 100,
        criticalViolations: 0,
        nonCriticalViolations: 0,
        lastInspectionDate: 'Never inspected'
      };
    }

    // Get the most recent inspection
    const latestInspection = inspections.reduce((latest, current) =>
      new Date(current.inspectionDate) > new Date(latest.inspectionDate) ? current : latest
    );

    // Calculate score based on violations
    const criticalViolations = latestInspection.criticalViolations || 0;
    const nonCriticalViolations = latestInspection.nonCriticalViolations || 0;

    // Base score is 100
    let score = 100;

    // Deduct points for critical violations (10 points each)
    score -= criticalViolations * 10;

    // Deduct points for non-critical violations (2 points each)
    score -= nonCriticalViolations * 2;

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Determine grade
    let grade = 'A';
    if (score >= 90) {
      grade = 'A';
    } else if (score >= 70) {
      grade = 'B';
    } else if (score >= 50) {
      grade = 'C';
    } else {
      grade = 'F';
    }

    return {
      grade,
      score,
      criticalViolations,
      nonCriticalViolations,
      lastInspectionDate: latestInspection.inspectionDate
    };
  } catch (error) {
    console.error('Error calculating safety score:', error);
    return {
      grade: 'A',
      score: 100,
      criticalViolations: 0,
      nonCriticalViolations: 0,
      lastInspectionDate: 'Error calculating'
    };
  }
};
