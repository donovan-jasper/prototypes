import { FlyioClient } from './cloudProviders/flyio';
import { openDatabase, saveAlert, saveService } from './db';
import { useStore } from './store';
import { sendLocalNotification } from './notifications';
import * as SecureStore from 'expo-secure-store';

const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes
const HEALTH_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes

export async function performHealthCheck(service: any) {
  try {
    const token = await SecureStore.getItemAsync(`auth_token_${service.provider}`);
    if (!token) throw new Error('No authentication token found');

    let status: 'healthy' | 'unhealthy' | 'deleted' = 'healthy';
    let message = 'Service is healthy';

    switch (service.provider) {
      case 'flyio':
        const flyioClient = new FlyioClient(token);
        status = await flyioClient.getAppStatus(service.id);
        if (status === 'unhealthy') {
          message = 'Service is unhealthy - some allocations are not healthy';
        } else if (status === 'deleted') {
          message = 'Service has been deleted';
        }
        break;
      default:
        throw new Error('Unsupported provider');
    }

    // Update Zustand store
    useStore.getState().updateServiceStatus(service.id, status);

    // Update database
    const db = await openDatabase();
    await saveService(db, { ...service, status });

    // Check if we should trigger an alert
    const lastAlert = useStore.getState().alerts.find(
      a => a.serviceId === service.id && a.severity === 'critical'
    );

    if (status !== 'healthy' && (!lastAlert || shouldTriggerAlert('critical', lastAlert.timestamp))) {
      // Save alert to database
      await saveAlert(db, {
        serviceId: service.id,
        severity: 'critical',
        message: `Service ${service.name} is ${status}: ${message}`
      });

      // Add to Zustand store
      useStore.getState().addAlert({
        id: Date.now(),
        serviceId: service.id,
        severity: 'critical',
        message: `Service ${service.name} is ${status}: ${message}`,
        timestamp: Date.now()
      });

      // Send push notification
      await sendLocalNotification(
        'Service Alert',
        `Your ${service.name} service is ${status}`,
        'critical'
      );
    }

    return { success: true, status, message };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      success: false,
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function shouldTriggerAlert(severity: string, lastAlertTime: number): boolean {
  if (severity === 'critical') return true;
  return Date.now() - lastAlertTime > ALERT_COOLDOWN;
}

export async function scheduleHealthChecks() {
  const db = await openDatabase();
  const services = await db.getAllAsync('SELECT * FROM services');

  for (const service of services) {
    await performHealthCheck(service);
  }

  // Schedule next check
  setTimeout(scheduleHealthChecks, HEALTH_CHECK_INTERVAL);
}

export async function executeRecoveryAction(serviceId: string, workflowId: string) {
  try {
    const db = await openDatabase();
    const service = await db.getFirstAsync('SELECT * FROM services WHERE id = ?', [serviceId]);
    const workflow = await db.getFirstAsync('SELECT * FROM recovery_workflows WHERE id = ?', [workflowId]);

    if (!service || !workflow) {
      throw new Error('Service or workflow not found');
    }

    const token = await SecureStore.getItemAsync(`auth_token_${service.provider}`);
    if (!token) throw new Error('No authentication token found');

    const steps = JSON.parse(workflow.steps);
    let allStepsSuccessful = true;

    for (const step of steps) {
      if (step.action?.type === 'api') {
        switch (service.provider) {
          case 'flyio':
            const flyioClient = new FlyioClient(token);
            if (step.action.endpoint === 'restart') {
              await flyioClient.restartApp(service.id);
            } else if (step.action.endpoint === 'rollback') {
              await flyioClient.rollbackDeployment(service.id);
            }
            break;
          default:
            throw new Error('Unsupported provider');
        }
      }

      // For manual steps, we just log that they need to be completed
      if (step.action?.type === 'manual') {
        console.log(`Manual step requires action: ${step.title}`);
      }
    }

    if (allStepsSuccessful) {
      // Update service status to healthy
      await db.runAsync(
        'UPDATE services SET status = ?, last_check = ? WHERE id = ?',
        ['healthy', Date.now(), service.id]
      );

      // Save success alert
      await saveAlert(db, {
        serviceId: service.id,
        severity: 'info',
        message: `Successfully executed recovery workflow: ${workflow.name}`
      });

      // Send notification
      await sendLocalNotification(
        'Recovery Successful',
        `Your ${service.name} service has been successfully recovered`,
        'critical'
      );

      return { success: true, message: 'Recovery workflow completed successfully' };
    }
  } catch (error) {
    console.error('Recovery action failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to execute recovery action'
    };
  }
}
