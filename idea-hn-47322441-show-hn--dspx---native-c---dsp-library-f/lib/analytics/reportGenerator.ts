import { AnalyticsEngine } from './engine';
import { getSensorById } from '@/lib/storage/sensors';
import { generateCSV } from '@/lib/export/csv';

interface ReportOptions {
  format: 'json' | 'csv' | 'pdf';
  includePatterns: boolean;
  includeAnomalies: boolean;
  includeCorrelations: boolean;
  timeRange: '24h' | '7d' | '30d';
}

export class ReportGenerator {
  private analyticsEngine: AnalyticsEngine;

  constructor() {
    this.analyticsEngine = AnalyticsEngine.getInstance();
  }

  public async generateReport(sensorId: string, options: ReportOptions): Promise<string> {
    const sensor = await getSensorById(sensorId);
    if (!sensor) {
      throw new Error('Sensor not found');
    }

    const days = options.timeRange === '24h' ? 1 :
                options.timeRange === '7d' ? 7 : 30;

    const reportData = {
      sensorId: sensor.id,
      sensorName: sensor.name,
      sensorType: sensor.type,
      generatedAt: new Date().toISOString(),
      timeRange: options.timeRange,
      patterns: options.includePatterns ? await this.analyticsEngine.generateDailyPatterns(sensorId, days) : [],
      anomalies: options.includeAnomalies ? await this.analyticsEngine.detectAnomalies(sensorId, days) : [],
      correlations: options.includeCorrelations ? await this.analyticsEngine.findCorrelations(sensorId, days) : []
    };

    if (options.format === 'json') {
      return JSON.stringify(reportData, null, 2);
    } else if (options.format === 'csv') {
      return this.generateCSVReport(reportData);
    } else {
      // In a real app, this would generate a PDF
      // For this prototype, we'll return a text representation
      return this.generateTextReport(reportData);
    }
  }

  private generateCSVReport(reportData: any): string {
    let csvContent = '';

    // Add sensor info
    csvContent += `Sensor ID,${reportData.sensorId}\n`;
    csvContent += `Sensor Name,${reportData.sensorName}\n`;
    csvContent += `Sensor Type,${reportData.sensorType}\n`;
    csvContent += `Generated At,${reportData.generatedAt}\n`;
    csvContent += `Time Range,${reportData.timeRange}\n\n`;

    // Add patterns
    if (reportData.patterns.length > 0) {
      csvContent += 'Daily Patterns\n';
      csvContent += 'Time of Day,Average Value,Standard Deviation\n';
      reportData.patterns.forEach((pattern: any) => {
        csvContent += `${pattern.timeOfDay},${pattern.averageValue},${pattern.standardDeviation}\n`;
      });
      csvContent += '\n';
    }

    // Add anomalies
    if (reportData.anomalies.length > 0) {
      csvContent += 'Anomalies\n';
      csvContent += 'Timestamp,Value,Severity,Description\n';
      reportData.anomalies.forEach((anomaly: any) => {
        csvContent += `${new Date(anomaly.timestamp).toISOString()},${anomaly.value},${anomaly.severity},${anomaly.description}\n`;
      });
      csvContent += '\n';
    }

    // Add correlations
    if (reportData.correlations.length > 0) {
      csvContent += 'Correlations\n';
      csvContent += 'Sensor ID,Correlation Coefficient,Significance\n';
      reportData.correlations.forEach((correlation: any) => {
        csvContent += `${correlation.sensorId},${correlation.correlationCoefficient},${correlation.significance}\n`;
      });
    }

    return csvContent;
  }

  private generateTextReport(reportData: any): string {
    let textContent = `SensorSync Analytics Report\n`;
    textContent += `Generated: ${new Date(reportData.generatedAt).toLocaleString()}\n\n`;

    textContent += `Sensor Information\n`;
    textContent += `------------------\n`;
    textContent += `ID: ${reportData.sensorId}\n`;
    textContent += `Name: ${reportData.sensorName}\n`;
    textContent += `Type: ${reportData.sensorType}\n`;
    textContent += `Time Range: ${reportData.timeRange}\n\n`;

    if (reportData.patterns.length > 0) {
      textContent += `Daily Patterns\n`;
      textContent += `--------------\n`;
      reportData.patterns.forEach((pattern: any) => {
        textContent += `${pattern.timeOfDay}: Avg ${pattern.averageValue} (±${pattern.standardDeviation})\n`;
      });
      textContent += '\n';
    }

    if (reportData.anomalies.length > 0) {
      textContent += `Anomalies Detected\n`;
      textContent += `------------------\n`;
      reportData.anomalies.forEach((anomaly: any) => {
        const severity = anomaly.severity > 0.8 ? 'HIGH' :
                        anomaly.severity > 0.5 ? 'MEDIUM' : 'LOW';
        textContent += `${new Date(anomaly.timestamp).toLocaleString()}: `;
        textContent += `${anomaly.value} (${severity} severity)\n`;
        textContent += `  ${anomaly.description}\n`;
      });
      textContent += '\n';
    }

    if (reportData.correlations.length > 0) {
      textContent += `Correlations with Other Sensors\n`;
      textContent += `-------------------------------\n`;
      reportData.correlations.forEach((correlation: any) => {
        const strength = Math.abs(correlation.correlationCoefficient) > 0.8 ? 'STRONG' :
                        Math.abs(correlation.correlationCoefficient) > 0.5 ? 'MODERATE' : 'WEAK';
        textContent += `With ${correlation.sensorId}: ${strength} (r = ${correlation.correlationCoefficient})\n`;
      });
    }

    return textContent;
  }
}
