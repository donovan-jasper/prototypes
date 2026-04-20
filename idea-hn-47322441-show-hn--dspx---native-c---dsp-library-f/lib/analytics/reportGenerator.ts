import { getSensorReadings } from '@/lib/storage/readings';
import { getSensorById } from '@/lib/storage/sensors';
import { AnalyticsEngine } from './engine';

interface ReportOptions {
  format: 'csv' | 'json' | 'html';
  includePatterns?: boolean;
  includeAnomalies?: boolean;
  includeCorrelations?: boolean;
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
}

class ReportGenerator {
  private analyticsEngine: AnalyticsEngine;

  constructor() {
    this.analyticsEngine = AnalyticsEngine.getInstance();
  }

  public async generateReport(sensorId: string, options: ReportOptions): Promise<string> {
    const sensor = await getSensorById(sensorId);
    if (!sensor) {
      throw new Error('Sensor not found');
    }

    const reportData = await this.analyticsEngine.generateFullReport(sensorId);

    switch (options.format) {
      case 'csv':
        return this.generateCSV(sensor, reportData, options);
      case 'json':
        return JSON.stringify(reportData, null, 2);
      case 'html':
        return this.generateHTML(sensor, reportData, options);
      default:
        throw new Error('Unsupported format');
    }
  }

  private async generateCSV(sensor: any, reportData: any, options: ReportOptions): Promise<string> {
    let csvContent = `SensorSync Analytics Report\n`;
    csvContent += `Sensor: ${sensor.name}, Type: ${sensor.type}\n`;
    csvContent += `Generated: ${new Date(reportData.generatedAt).toLocaleString()}\n\n`;

    if (options.includePatterns && reportData.dailyPatterns) {
      csvContent += `Daily Patterns\n`;
      csvContent += `Time of Day,Average Value,Sample Count\n`;
      reportData.dailyPatterns.forEach((pattern: any) => {
        csvContent += `${pattern.timeOfDay},${pattern.averageValue},${pattern.sampleCount}\n`;
      });
      csvContent += `\n`;
    }

    if (options.includeAnomalies && reportData.anomalies) {
      csvContent += `Anomalies\n`;
      csvContent += `Type,Description,Timestamp,Value,Confidence\n`;
      reportData.anomalies.forEach((anomaly: any) => {
        csvContent += `${anomaly.type},"${anomaly.description}",${new Date(anomaly.timestamp).toISOString()},${anomaly.value},${anomaly.confidence}\n`;
      });
      csvContent += `\n`;
    }

    if (options.includeCorrelations && reportData.correlations) {
      csvContent += `Correlations\n`;
      csvContent += `Sensor Name,Correlation Coefficient,Significance\n`;
      reportData.correlations.forEach((correlation: any) => {
        csvContent += `${correlation.sensorName},${correlation.correlationCoefficient},${correlation.significance}\n`;
      });
      csvContent += `\n`;
    }

    csvContent += `Summary\n`;
    csvContent += `"${reportData.summary}"\n`;

    return csvContent;
  }

  private async generateHTML(sensor: any, reportData: any, options: ReportOptions): Promise<string> {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SensorSync Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #007AFF; }
          h2 { color: #444; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .metadata { color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SensorSync Analytics Report</h1>
          <div class="metadata">
            Generated: ${new Date(reportData.generatedAt).toLocaleString()}<br>
            Sensor: ${sensor.name}<br>
            Type: ${sensor.type}
          </div>
        </div>
    `;

    if (options.includePatterns && reportData.dailyPatterns) {
      htmlContent += `
        <h2>Daily Patterns</h2>
        <table>
          <thead>
            <tr>
              <th>Time of Day</th>
              <th>Average Value</th>
              <th>Sample Count</th>
            </tr>
          </thead>
          <tbody>
      `;

      reportData.dailyPatterns.forEach((pattern: any) => {
        htmlContent += `
          <tr>
            <td>${pattern.timeOfDay}</td>
            <td>${pattern.averageValue}</td>
            <td>${pattern.sampleCount}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    }

    if (options.includeAnomalies && reportData.anomalies) {
      htmlContent += `
        <h2>Anomalies</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Timestamp</th>
              <th>Value</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
      `;

      reportData.anomalies.forEach((anomaly: any) => {
        htmlContent += `
          <tr>
            <td>${anomaly.type}</td>
            <td>${anomaly.description}</td>
            <td>${new Date(anomaly.timestamp).toLocaleString()}</td>
            <td>${anomaly.value}</td>
            <td>${Math.round(anomaly.confidence * 100)}%</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    }

    if (options.includeCorrelations && reportData.correlations) {
      htmlContent += `
        <h2>Correlations</h2>
        <table>
          <thead>
            <tr>
              <th>Sensor Name</th>
              <th>Correlation Coefficient</th>
              <th>Significance</th>
            </tr>
          </thead>
          <tbody>
      `;

      reportData.correlations.forEach((correlation: any) => {
        htmlContent += `
          <tr>
            <td>${correlation.sensorName}</td>
            <td>${correlation.correlationCoefficient}</td>
            <td>${correlation.significance}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    }

    htmlContent += `
      <h2>Summary</h2>
      <div class="summary">
        <p>${reportData.summary}</p>
      </div>
    `;

    htmlContent += `
      </body>
      </html>
    `;

    return htmlContent;
  }
}

export { ReportGenerator };
