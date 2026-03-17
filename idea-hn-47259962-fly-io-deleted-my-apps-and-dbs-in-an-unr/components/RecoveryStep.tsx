import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import { FlyioClient } from '@/lib/cloudProviders/flyio';
import { useStore } from '@/lib/store';

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
}

export default function RecoveryStep({ step, stepNumber, totalSteps }: RecoveryStepProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const services = useStore((state) => state.services);

  async function executeAction() {
    if (!step.action || isExecuting || isComplete) return;

    setIsExecuting(true);
    setError(null);

    try {
      if (step.action.type === 'api') {
        // Get the first service that needs recovery
        const service = services.find(s => s.status !== 'healthy');
        if (!service) throw new Error('No service needs recovery');

        // Execute API call based on provider
        switch (service.provider) {
          case 'flyio':
            const flyioClient = new FlyioClient('YOUR_ACCESS_TOKEN'); // In production, get from secure storage
            if (step.action.endpoint === 'restart') {
              await flyioClient.restartApp(service.id);
            } else if (step.action.endpoint === 'rollback') {
              await flyioClient.rollbackDeployment(service.id);
            }
            break;
          case 'aws':
            // AWS API calls
            break;
          default:
            throw new Error('Unsupported provider');
        }
      }

      setIsComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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

      {error && <Text style={styles.errorText}>{error}</Text>}
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
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
  },
});
