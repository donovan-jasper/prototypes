import { getSensorReadings } from '@/lib/storage/database';
import { useStore } from '@/store';
import { resampleIrregular } from '@/lib/dsp/resampler';
import { compensateDrift } from '@/lib/dsp/drift';
import { movingAverage } from '@/lib/dsp/filter';

interface DailyPattern {
  timeOfDay: string;
  averageValue: number;
  standardDeviation: number;
}

interface Anomaly {
  timestamp: number;
  value: number;
  severity: number;
  description: string;
}

interface Correlation {
  sensorId: string;
  correlationCoefficient: number;
  significance: number;
}

interface AnalyticsReport {
  sensorId: string;
  generatedAt: number;
  dailyPatterns: DailyPattern[];
  anomalies: Anomaly[];
  correlations: Correlation[];
  summary: string;
}

export class AnalyticsEngine {
  private static instance: AnalyticsEngine;

  private constructor() {}

  public static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  public async generateDailyPatterns(sensorId: string, days: number = 7): Promise<DailyPattern[]> {
    const now = Date.now();
    const startTime = now - (days * 24 * 60 * 60 * 1000);

    const readings = await getSensorReadings(sensorId, 10000, startTime, now);

    if (readings.length === 0) {
      return [];
    }

    // Group readings by hour of day
    const hourlyGroups: Record<string, number[]> = {};

    readings.forEach((reading: any) => {
      const date = new Date(reading.timestamp);
      const hour = date.getHours();

      if (!hourlyGroups[hour]) {
        hourlyGroups[hour] = [];
      }

      hourlyGroups[hour].push(reading.value);
    });

    // Calculate statistics for each hour
    const patterns: DailyPattern[] = [];

    for (const hour in hourlyGroups) {
      const values = hourlyGroups[hour];
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      patterns.push({
        timeOfDay: `${hour}:00`,
        averageValue: parseFloat(avg.toFixed(2)),
        standardDeviation: parseFloat(stdDev.toFixed(2))
      });
    }

    // Sort by time of day
    patterns.sort((a, b) => {
      const hourA = parseInt(a.timeOfDay.split(':')[0]);
      const hourB = parseInt(b.timeOfDay.split(':')[0]);
      return hourA - hourB;
    });

    return patterns;
  }

  public async detectAnomalies(sensorId: string, days: number = 1): Promise<Anomaly[]> {
    const now = Date.now();
    const startTime = now - (days * 24 * 60 * 60 * 1000);

    const readings = await getSensorReadings(sensorId, 10000, startTime, now);

    if (readings.length < 24) {
      return [];
    }

    // Resample and smooth the data
    const resampled = resampleIrregular(readings, 300000); // 5-minute intervals
    const smoothed = movingAverage(resampled.map(r => r.value), 5);

    // Calculate z-scores for anomaly detection
    const mean = smoothed.reduce((sum, val) => sum + val, 0) / smoothed.length;
    const variance = smoothed.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / smoothed.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: Anomaly[] = [];

    smoothed.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);

      if (zScore > 3) { // 3 standard deviations from mean
        const timestamp = resampled[index].timestamp;
        const severity = Math.min(zScore / 5, 1); // Cap at 1

        anomalies.push({
          timestamp,
          value,
          severity,
          description: `Unusual reading detected - ${severity > 0.8 ? 'high' : 'moderate'} anomaly`
        });
      }
    });

    return anomalies;
  }

  public async findCorrelations(sensorId: string, days: number = 7): Promise<Correlation[]> {
    const { sensors } = useStore.getState();
    const now = Date.now();
    const startTime = now - (days * 24 * 60 * 60 * 1000);

    // Get readings for the target sensor
    const targetReadings = await getSensorReadings(sensorId, 10000, startTime, now);

    if (targetReadings.length === 0) {
      return [];
    }

    // Resample target sensor data to hourly intervals
    const targetResampled = resampleIrregular(targetReadings, 3600000); // 1-hour intervals
    const targetValues = targetResampled.map(r => r.value);

    const correlations: Correlation[] = [];

    // Compare with other sensors
    for (const sensor of sensors) {
      if (sensor.id === sensorId) continue;

      const otherReadings = await getSensorReadings(sensor.id, 10000, startTime, now);

      if (otherReadings.length === 0) continue;

      const otherResampled = resampleIrregular(otherReadings, 3600000);
      const otherValues = otherResampled.map(r => r.value);

      // Find common time periods
      const commonTimestamps = targetResampled
        .map(r => r.timestamp)
        .filter(t => otherResampled.some(r => r.timestamp === t));

      if (commonTimestamps.length < 24) continue; // Need at least 24 hours of common data

      // Calculate Pearson correlation coefficient
      const n = commonTimestamps.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

      commonTimestamps.forEach(timestamp => {
        const x = targetResampled.find(r => r.timestamp === timestamp)!.value;
        const y = otherResampled.find(r => r.timestamp === timestamp)!.value;

        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
      });

      const numerator = sumXY - (sumX * sumY) / n;
      const denominator = Math.sqrt((sumX2 - (sumX * sumX) / n) * (sumY2 - (sumY * sumY) / n));

      if (denominator === 0) continue;

      const correlation = numerator / denominator;
      const significance = Math.min(Math.abs(correlation) * 10, 1); // Scale to 0-1

      if (Math.abs(correlation) > 0.5) { // Only include significant correlations
        correlations.push({
          sensorId: sensor.id,
          correlationCoefficient: parseFloat(correlation.toFixed(2)),
          significance: parseFloat(significance.toFixed(2))
        });
      }
    }

    // Sort by absolute correlation strength
    correlations.sort((a, b) => Math.abs(b.correlationCoefficient) - Math.abs(a.correlationCoefficient));

    return correlations;
  }

  public async generateFullReport(sensorId: string): Promise<AnalyticsReport> {
    const { subscriptionStatus } = useStore.getState();

    if (subscriptionStatus !== 'premium') {
      throw new Error('Analytics reports require a premium subscription');
    }

    const [dailyPatterns, anomalies, correlations] = await Promise.all([
      this.generateDailyPatterns(sensorId),
      this.detectAnomalies(sensorId),
      this.findCorrelations(sensorId)
    ]);

    // Generate summary
    let summary = `Analytics report for sensor ${sensorId} generated at ${new Date().toLocaleString()}\n\n`;

    if (dailyPatterns.length > 0) {
      const peakHour = dailyPatterns.reduce((prev, current) =>
        current.averageValue > prev.averageValue ? current : prev
      );
      summary += `Your sensor shows a daily peak around ${peakHour.timeOfDay} with an average value of ${peakHour.averageValue}.\n\n`;
    }

    if (anomalies.length > 0) {
      summary += `Detected ${anomalies.length} anomalies in the last 24 hours. `;
      const severeAnomalies = anomalies.filter(a => a.severity > 0.7);
      if (severeAnomalies.length > 0) {
        summary += `Please investigate the ${severeAnomalies.length} high-severity anomalies. `;
      }
      summary += `Consider reviewing your alert settings.\n\n`;
    }

    if (correlations.length > 0) {
      const strongestCorrelation = correlations[0];
      summary += `Your sensor shows a strong correlation with sensor ${strongestCorrelation.sensorId} `;
      summary += `(r = ${strongestCorrelation.correlationCoefficient}). `;
      summary += `This suggests a relationship between the two measurements.\n\n`;
    }

    summary += 'Recommendations:\n';
    summary += '- Review daily patterns for expected behavior\n';
    summary += '- Investigate any anomalies detected\n';
    summary += '- Consider creating alerts for unusual patterns\n';
    summary += '- Explore correlations with other sensors in your system';

    return {
      sensorId,
      generatedAt: Date.now(),
      dailyPatterns,
      anomalies,
      correlations,
      summary
    };
  }
}
