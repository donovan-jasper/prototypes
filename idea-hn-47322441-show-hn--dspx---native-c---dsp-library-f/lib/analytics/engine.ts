import { getSensorReadings } from '@/lib/storage/readings';
import { getAllSensors } from '@/lib/storage/sensors';
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
    // Get all other sensors
    const allSensors = await getAllSensors();
    const otherSensors = allSensors.filter(s => s.id !== sensorId);

    // Generate correlations with other sensors
    const correlations = [];

    for (const sensor of otherSensors) {
      const otherReadings = await getSensorReadings(sensor.id, '7d');

      if (otherReadings.length > 0) {
        // Find matching timestamps
        const matchedPairs = readings
          .filter(r1 => otherReadings.some(r2 => Math.abs(r1.timestamp - r2.timestamp) < 60000))
          .map(r1 => {
            const closest = otherReadings.reduce((prev, curr) =>
              Math.abs(curr.timestamp - r1.timestamp) < Math.abs(prev.timestamp - r1.timestamp) ? curr : prev
            );
            return { x: r1.value, y: closest.value };
          });

        if (matchedPairs.length > 10) {
          // Calculate Pearson correlation coefficient
          const n = matchedPairs.length;
          const sumX = matchedPairs.reduce((sum, p) => sum + p.x, 0);
          const sumY = matchedPairs.reduce((sum, p) => sum + p.y, 0);
          const sumXY = matchedPairs.reduce((sum, p) => sum + p.x * p.y, 0);
          const sumX2 = matchedPairs.reduce((sum, p) => sum + p.x * p.x, 0);
          const sumY2 = matchedPairs.reduce((sum, p) => sum + p.y * p.y, 0);

          const numerator = sumXY - (sumX * sumY) / n;
          const denominatorX = Math.sqrt(sumX2 - (sumX * sumX) / n);
          const denominatorY = Math.sqrt(sumY2 - (sumY * sumY) / n);

          if (denominatorX > 0 && denominatorY > 0) {
            const r = numerator / (denominatorX * denominatorY);
            const confidence = Math.min(1, Math.abs(r) * (matchedPairs.length / 100));

            correlations.push({
              sensorId: sensor.id,
              sensorName: sensor.name,
              correlationCoefficient: parseFloat(r.toFixed(3)),
              confidence: parseFloat(confidence.toFixed(2)),
              strength: this.getCorrelationStrength(r)
            });
          }
        }
      }
    }

    // Sort by strongest correlation
    return correlations.sort((a, b) => Math.abs(b.correlationCoefficient) - Math.abs(a.correlationCoefficient));
  }

  private getCorrelationStrength(r: number): string {
    const absR = Math.abs(r);

    if (absR >= 0.8) return 'Very Strong';
    if (absR >= 0.6) return 'Strong';
    if (absR >= 0.4) return 'Moderate';
    if (absR >= 0.2) return 'Weak';
    return 'Negligible';
  }

  private generateSummary(dailyPatterns: any[], anomalies: any[], correlations: any[]): string {
    let summary = '';

    // Daily patterns summary
    if (dailyPatterns.length > 0) {
      const highest = dailyPatterns.reduce((prev, curr) =>
        curr.averageValue > prev.averageValue ? curr : prev
      );
      const lowest = dailyPatterns.reduce((prev, curr) =>
        curr.averageValue < prev.averageValue ? curr : prev
      );

      summary += `Your sensor shows consistent daily patterns with peaks around ${highest.timeOfDay} and troughs around ${lowest.timeOfDay}. `;
    }

    // Anomalies summary
    if (anomalies.length > 0) {
      const spikeCount = anomalies.filter(a => a.type === 'Spike').length;
      const trendCount = anomalies.filter(a => a.type.includes('Trend')).length;

      if (spikeCount > 0) {
        summary += `We detected ${spikeCount} unusual spikes in your data that may indicate sensor issues or external factors. `;
      }

      if (trendCount > 0) {
        summary += `Your data shows ${trendCount} significant trends that may indicate changing conditions. `;
      }
    }

    // Correlations summary
    if (correlations.length > 0) {
      const strongCorrelations = correlations.filter(c => c.strength === 'Strong' || c.strength === 'Very Strong');

      if (strongCorrelations.length > 0) {
        const firstCorrelation = strongCorrelations[0];
        summary += `Your sensor shows a ${firstCorrelation.strength.toLowerCase()} correlation with ${firstCorrelation.sensorName} (r=${firstCorrelation.correlationCoefficient}). `;
      }
    }

    if (summary === '') {
      summary = 'No significant patterns or anomalies detected in your sensor data.';
    }

    return summary;
  }
}

export { AnalyticsEngine };
