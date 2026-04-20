import { getSensorReadings } from '@/lib/storage/readings';
import { Sensor } from '@/types/sensor';
import { Reading } from '@/types/reading';

class AnalyticsEngine {
  private static instance: AnalyticsEngine;

  private constructor() {}

  public static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }

  public async generateFullReport(sensorId: string): Promise<any> {
    const readings = await getSensorReadings(sensorId, '7d');

    if (!readings || readings.length === 0) {
      throw new Error('No data available for analytics');
    }

    const dailyPatterns = this.analyzeDailyPatterns(readings);
    const anomalies = this.detectAnomalies(readings);
    const correlations = await this.analyzeCorrelations(sensorId, readings);

    return {
      sensorId,
      generatedAt: Date.now(),
      dailyPatterns,
      anomalies,
      correlations,
      summary: this.generateSummary(dailyPatterns, anomalies, correlations)
    };
  }

  private analyzeDailyPatterns(readings: Reading[]): any[] {
    // Group readings by hour of day
    const hourlyGroups: { [key: string]: number[] } = {};

    readings.forEach(reading => {
      const date = new Date(reading.timestamp);
      const hour = date.getHours();

      if (!hourlyGroups[hour]) {
        hourlyGroups[hour] = [];
      }

      hourlyGroups[hour].push(reading.value);
    });

    // Calculate average for each hour
    const patterns = Object.entries(hourlyGroups).map(([hour, values]) => {
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const timeOfDay = `${hour}:00`;

      return {
        timeOfDay,
        averageValue: parseFloat(average.toFixed(2)),
        sampleCount: values.length
      };
    });

    // Sort by time of day
    return patterns.sort((a, b) => {
      const hourA = parseInt(a.timeOfDay.split(':')[0]);
      const hourB = parseInt(b.timeOfDay.split(':')[0]);
      return hourA - hourB;
    });
  }

  private detectAnomalies(readings: Reading[]): any[] {
    const anomalies: any[] = [];
    const windowSize = 5; // Number of points to consider for moving average

    if (readings.length < windowSize * 2) {
      return anomalies;
    }

    // Calculate moving average and standard deviation
    const movingAverages: number[] = [];
    const movingStdDevs: number[] = [];

    for (let i = 0; i <= readings.length - windowSize; i++) {
      const window = readings.slice(i, i + windowSize);
      const avg = window.reduce((sum, r) => sum + r.value, 0) / windowSize;
      const variance = window.reduce((sum, r) => sum + Math.pow(r.value - avg, 2), 0) / windowSize;
      const stdDev = Math.sqrt(variance);

      movingAverages.push(avg);
      movingStdDevs.push(stdDev);
    }

    // Detect anomalies (values outside 3 standard deviations)
    for (let i = windowSize; i < readings.length - windowSize; i++) {
      const currentValue = readings[i].value;
      const avg = movingAverages[i - windowSize];
      const stdDev = movingStdDevs[i - windowSize];

      if (Math.abs(currentValue - avg) > 3 * stdDev) {
        const direction = currentValue > avg ? 'above' : 'below';
        const confidence = Math.min(1, Math.abs(currentValue - avg) / (3 * stdDev));

        anomalies.push({
          type: 'Spike',
          description: `Unusual ${direction} reading detected`,
          timestamp: readings[i].timestamp,
          value: currentValue,
          confidence: confidence
        });
      }
    }

    // Detect trends (3 consecutive increasing or decreasing values)
    for (let i = 0; i < readings.length - 2; i++) {
      const v1 = readings[i].value;
      const v2 = readings[i + 1].value;
      const v3 = readings[i + 2].value;

      if (v1 < v2 && v2 < v3) {
        anomalies.push({
          type: 'Rising Trend',
          description: 'Consistent increasing trend detected',
          timestamp: readings[i].timestamp,
          value: v1,
          confidence: 0.8
        });
        i += 2; // Skip next two points
      } else if (v1 > v2 && v2 > v3) {
        anomalies.push({
          type: 'Falling Trend',
          description: 'Consistent decreasing trend detected',
          timestamp: readings[i].timestamp,
          value: v1,
          confidence: 0.8
        });
        i += 2; // Skip next two points
      }
    }

    return anomalies;
  }

  private async analyzeCorrelations(sensorId: string, readings: Reading[]): Promise<any[]> {
    // In a real implementation, this would query other sensors and calculate correlations
    // For this prototype, we'll return mock data

    // Get all other sensors
    const allSensors = await getAllSensors();
    const otherSensors = allSensors.filter(s => s.id !== sensorId);

    // Generate mock correlations
    const correlations = otherSensors.map(sensor => {
      // Generate a random correlation coefficient between -1 and 1
      const correlationCoefficient = (Math.random() * 2) - 1;

      return {
        sensorId: sensor.id,
        sensorName: sensor.name,
        correlationCoefficient: parseFloat(correlationCoefficient.toFixed(2)),
        significance: Math.abs(correlationCoefficient) > 0.5 ? 'High' : 'Moderate'
      };
    });

    // Sort by absolute correlation value (strongest first)
    return correlations.sort((a, b) => Math.abs(b.correlationCoefficient) - Math.abs(a.correlationCoefficient));
  }

  private generateSummary(dailyPatterns: any[], anomalies: any[], correlations: any[]): string {
    let summary = '';

    if (dailyPatterns.length > 0) {
      const highestPattern = dailyPatterns.reduce((prev, current) =>
        current.averageValue > prev.averageValue ? current : prev
      );
      summary += `Your sensor shows a strong pattern with the highest average value at ${highestPattern.timeOfDay} (${highestPattern.averageValue}). `;
    }

    if (anomalies.length > 0) {
      const mostConfidentAnomaly = anomalies.reduce((prev, current) =>
        current.confidence > prev.confidence ? current : prev
      );
      summary += `We detected ${anomalies.length} anomalies, with the most significant being a ${mostConfidentAnomaly.type} at ${new Date(mostConfidentAnomaly.timestamp).toLocaleString()}. `;
    }

    if (correlations.length > 0) {
      const strongestCorrelation = correlations.reduce((prev, current) =>
        Math.abs(current.correlationCoefficient) > Math.abs(prev.correlationCoefficient) ? current : prev
      );
      summary += `Your sensor shows a ${strongestCorrelation.significance.toLowerCase()} correlation with ${strongestCorrelation.sensorName} (r = ${strongestCorrelation.correlationCoefficient}).`;
    }

    return summary || 'No significant patterns or anomalies detected in your sensor data.';
  }
}

export { AnalyticsEngine };
