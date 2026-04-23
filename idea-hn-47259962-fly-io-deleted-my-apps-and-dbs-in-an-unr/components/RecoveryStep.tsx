import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import { FlyioClient } from '@/lib/cloudProviders/flyio';
import { useStore } from '@/lib/store';
import * as SecureStore from 'expo-secure-store';
import { openDatabase, saveAlert } from '@/lib/db';
import { sendLocalNotification } from '@/lib/notifications';

interface RecoveryStepProps {
  step: {
    id: string;
    title: string;
    description: string;
    action?: {
      type: 'api' | 'manual';
      endpoint?: string;
      method?: 'GET' | 'POST' | 'PUT';
      body?: any;
    };
  };
  stepNumber: number;
  totalSteps: number;
  serviceId: string;
}

export default function RecoveryStep({ step, stepNumber, totalSteps, serviceId }: RecoveryStepProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const services = useStore((state) => state.services);
  const updateServiceStatus = useStore((state) => state.updateServiceStatus);
  const addAlert = useStore((state) => state.addAlert);

  async function getAuthToken(provider: string): Promise<string> {
    try {
      const token = await SecureStore.getItemAsync(`auth_token_${provider}`);
      if (!token) throw new Error('No authentication token found');
      return token;
    } catch (err) {
      throw new Error('Failed to retrieve authentication token');
    }
  }

  async function refreshToken(provider: string): Promise<string> {
    // In a real implementation, this would call the provider's token refresh endpoint
    // For this example, we'll just get the existing token
    return getAuthToken(provider);
  }

  async function executeAction() {
    if (!step.action || isExecuting || isComplete) return;

    setIsExecuting(true);
    setError(null);

    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) throw new Error('Service not found');

      if (step.action.type === 'api') {
        let token: string;

        try {
          token = await getAuthToken(service.provider);
        } catch (err) {
          // If token retrieval fails, try to refresh
          token = await refreshToken(service.provider);
        }

        switch (service.provider) {
          case 'flyio':
            const flyioClient = new FlyioClient(token);
            if (step.action.endpoint === 'restart') {
              await flyioClient.restartApp(service.id);
              // Update service status after restart
              updateServiceStatus(service.id, 'healthy');

              // Save alert
              const db = await openDatabase();
              await saveAlert(db, {
                serviceId: service.id,
                severity: 'info',
                message: 'Service restarted successfully'
              });

              addAlert({
                id: Date.now(),
                serviceId: service.id,
                severity: 'info',
                message: 'Service restarted successfully',
                timestamp: Date.now()
              });

              await sendLocalNotification(
                'Service Restarted',
                `Your ${service.name} service has been restarted`,
                'info'
              );
            } else if (step.action.endpoint === 'rollback') {
              await flyioClient.rollbackDeployment(service.id);
              updateServiceStatus(service.id, 'healthy');

              // Save alert
              const db = await openDatabase();
              await saveAlert(db, {
                serviceId: service.id,
                severity: 'info',
                message: 'Deployment rolled back successfully'
              });

              addAlert({
                id: Date.now(),
                serviceId: service.id,
                severity: 'info',
                message: 'Deployment rolled back successfully',
                timestamp: Date.now()
              });

              await sendLocalNotification(
                'Rollback Complete',
                `Your ${service.name} service has been rolled back`,
                'info'
              );
            } else if (step.action.endpoint === 'status') {
              const status = await flyioClient.getAppStatus(service.id);
              updateServiceStatus(service.id, status);

              // Save alert
              const db = await openDatabase();
              await saveAlert(db, {
                serviceId: service.id,
                severity: 'info',
                message: `Service status updated to ${status}`
              });

              addAlert({
                id: Date.now(),
                serviceId: service.id,
                severity: 'info',
                message: `Service status updated to ${status}`,
                timestamp: Date.now()
              });
            }
            break;
          case 'aws':
            // AWS API calls would go here
            break;
          default:
            throw new Error('Unsupported provider');
        }
      }

      setIsComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Recovery action failed:', err);

      // Save error alert
      const db = await openDatabase();
      await saveAlert(db, {
        serviceId: serviceId,
        severity: 'critical',
        message: `Recovery action failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      });

      addAlert({
        id: Date.now(),
        serviceId: serviceId,
        severity: 'critical',
        message: `Recovery action failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: Date.now()
      });

      await sendLocalNotification(
        'Recovery Action Failed',
        `Failed to execute recovery action for ${services.find(s => s.id === serviceId)?.name || 'service'}`,
        'critical'
      );
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumberContainer}>
          <Text style={styles.stepNumber}>{stepNumber}</Text>
        </View>
        <Text style={styles.stepTitle}>{step.title}</Text>
      </View>
      <Text style={styles.stepDescription}>{step.description}</Text>

      {step.action && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            isComplete && styles.completedButton,
            isExecuting && styles.executingButton
          ]}
          onPress={executeAction}
          disabled={isExecuting || isComplete}
        >
          {isExecuting ? (
            <ActivityIndicator color="#fff" />
          ) : isComplete ? (
            <Text style={styles.buttonText}>✓ Completed</Text>
          ) : (
            <Text style={styles.buttonText}>
              {step.action.type === 'api' ? 'Execute' : 'Mark as Complete'}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          {error.includes('token') && (
            <TouchableOpacity
              style={styles.reauthButton}
              onPress={() => {
                // In a real app, this would trigger the OAuth flow again
                alert('Please reconnect your service in the Settings tab');
              }}
            >
              <Text style={styles.reauthText}>Reconnect Service</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#374151',
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#10B981',
  },
  executingButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  reauthButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    alignItems: 'center',
  },
  reauthText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
});
