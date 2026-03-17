import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import { FlyioClient } from '@/lib/cloudProviders/flyio';
import { useStore } from '@/lib/store';
import * as SecureStore from 'expo-secure-store';

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
            } else if (step.action.endpoint === 'rollback') {
              await flyioClient.rollbackDeployment(service.id);
              updateServiceStatus(service.id, 'healthy');
            } else if (step.action.endpoint === 'status') {
              const status = await flyioClient.getAppStatus(service.id);
              updateServiceStatus(service.id, status);
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
      // Log the error for debugging
      console.error('Recovery action failed:', err);
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  completedButton: {
    backgroundColor: '#10B981',
  },
  executingButton: {
    backgroundColor: '#6B7280',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 8,
  },
  reauthButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  reauthText: {
    color: '#fff',
    fontSize: 14,
  },
});
