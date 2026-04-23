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

          default:
            throw new Error('Unsupported provider');
        }
      }

      setIsComplete(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message :
        'An unknown error occurred';
      setError(errorMessage);

      // Save error alert
      const service = services.find(s => s.id === serviceId);
      if (service) {
        const db = await openDatabase();
        await saveAlert(db, {
          serviceId: service.id,
          severity: 'critical',
          message: `Step failed: ${errorMessage}`
        });

        addAlert({
          id: Date.now(),
          serviceId: service.id,
          severity: 'critical',
          message: `Step failed: ${errorMessage}`,
          timestamp: Date.now()
        });

        await sendLocalNotification(
          'Recovery Step Failed',
          `Failed to execute step: ${errorMessage}`,
          'critical'
        );
      }
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[
          styles.stepNumber,
          isComplete ? styles.completeStep :
          isExecuting ? styles.executingStep : styles.pendingStep
        ]}>
          <Text style={styles.stepNumberText}>{stepNumber}</Text>
        </View>
        <Text style={styles.title}>{step.title}</Text>
      </View>

      <Text style={styles.description}>{step.description}</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {step.action && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            isComplete ? styles.completeButton :
            isExecuting ? styles.executingButton : styles.pendingButton
          ]}
          onPress={executeAction}
          disabled={isExecuting || isComplete}
        >
          {isExecuting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isComplete ? '✓ Completed' : step.action.type === 'api' ? 'Execute API Action' : 'Manual Step'}
            </Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(stepNumber / totalSteps) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pendingStep: {
    backgroundColor: '#E5E7EB',
  },
  executingStep: {
    backgroundColor: '#3B82F6',
  },
  completeStep: {
    backgroundColor: '#10B981',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  actionButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  pendingButton: {
    backgroundColor: '#3B82F6',
  },
  executingButton: {
    backgroundColor: '#2563EB',
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
});
