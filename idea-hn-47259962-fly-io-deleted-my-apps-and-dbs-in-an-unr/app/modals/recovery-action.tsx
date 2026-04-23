import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { FlyioClient } from '@/lib/cloudProviders/flyio';
import { useStore } from '@/lib/store';
import * as SecureStore from 'expo-secure-store';
import { openDatabase, saveAlert } from '@/lib/db';
import { sendLocalNotification } from '@/lib/notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface RecoveryActionModalProps {
  serviceId: string;
  workflowId: string;
  onClose: () => void;
}

export default function RecoveryActionModal() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [workflow, setWorkflow] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const services = useStore((state) => state.services);
  const updateServiceStatus = useStore((state) => state.updateServiceStatus);
  const addAlert = useStore((state) => state.addAlert);
  const router = useRouter();
  const { workflowId, serviceId } = useLocalSearchParams();

  useEffect(() => {
    if (workflowId && serviceId) {
      loadWorkflow(workflowId as string);
    }
  }, [workflowId, serviceId]);

  async function loadWorkflow(workflowId: string) {
    try {
      const db = await openDatabase();
      const workflowData = await db.getFirstAsync(
        'SELECT * FROM recovery_workflows WHERE id = ?',
        [workflowId]
      );

      if (workflowData) {
        const parsedWorkflow = {
          ...workflowData,
          steps: JSON.parse(workflowData.steps)
        };
        setWorkflow(parsedWorkflow);

        // Initialize step status
        const initialStatus: Record<string, 'pending' | 'success' | 'error'> = {};
        parsedWorkflow.steps.forEach((step: any) => {
          initialStatus[step.id] = 'pending';
        });
        setStepStatus(initialStatus);
      }
    } catch (err) {
      console.error('Failed to load workflow:', err);
      setError('Failed to load recovery workflow');
    }
  }

  async function executeWorkflow() {
    if (!workflow || isExecuting) return;

    setIsExecuting(true);
    setError(null);
    setSuccess(false);

    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) throw new Error('Service not found');

      const token = await SecureStore.getItemAsync(`auth_token_${service.provider}`);
      if (!token) throw new Error('No authentication token found');

      const db = await openDatabase();

      // Execute each step in sequence
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        setCurrentStep(i);

        try {
          if (step.action?.type === 'api') {
            switch (service.provider) {
              case 'flyio':
                const flyioClient = new FlyioClient(token);
                if (step.action.endpoint === 'restart') {
                  await flyioClient.restartApp(service.id);
                } else if (step.action.endpoint === 'rollback') {
                  await flyioClient.rollbackDeployment(service.id);
                }

                // Update step status
                setStepStatus(prev => ({
                  ...prev,
                  [step.id]: 'success'
                }));

                // If this is the last step, update service status
                if (i === workflow.steps.length - 1) {
                  updateServiceStatus(service.id, 'healthy');
                  await db.runAsync(
                    'UPDATE services SET status = ?, last_check = ? WHERE id = ?',
                    ['healthy', Date.now(), service.id]
                  );
                }
                break;
              default:
                throw new Error('Unsupported provider');
            }
          } else {
            // For manual steps, just mark as complete
            setStepStatus(prev => ({
              ...prev,
              [step.id]: 'success'
            }));
          }
        } catch (stepError) {
          console.error(`Step ${i + 1} failed:`, stepError);
          setStepStatus(prev => ({
            ...prev,
            [step.id]: 'error'
          }));
          throw stepError; // Stop execution on error
        }
      }

      // Save success alert
      await saveAlert(db, {
        serviceId: service.id,
        severity: 'info',
        message: `Successfully executed recovery workflow: ${workflow.name}`
      });

      addAlert({
        id: Date.now(),
        serviceId: service.id,
        severity: 'info',
        message: `Successfully executed recovery workflow: ${workflow.name}`,
        timestamp: Date.now()
      });

      await sendLocalNotification(
        'Recovery Successful',
        `Your ${service.name} service has been successfully recovered`,
        'critical'
      );

      setSuccess(true);
    } catch (err) {
      console.error('Workflow execution failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute workflow');
    } finally {
      setIsExecuting(false);
    }
  }

  if (!workflow) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading workflow...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>{workflow.name}</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>Workflow completed successfully!</Text>
          </View>
        )}

        {workflow.steps.map((step: any, index: number) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={[
                styles.stepNumber,
                stepStatus[step.id] === 'success' && styles.stepSuccess,
                stepStatus[step.id] === 'error' && styles.stepError
              ]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepDescription}>{step.description}</Text>

            {step.action?.type === 'manual' && (
              <Text style={styles.manualStepText}>This step requires manual action</Text>
            )}

            {isExecuting && currentStep === index && (
              <View style={styles.executingContainer}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.executingText}>Executing...</Text>
              </View>
            )}

            {stepStatus[step.id] === 'success' && (
              <Text style={styles.stepStatusSuccess}>✓ Completed</Text>
            )}

            {stepStatus[step.id] === 'error' && (
              <Text style={styles.stepStatusError}>✗ Failed</Text>
            )}
          </View>
        ))}

        {!success && !error && (
          <TouchableOpacity
            style={styles.executeButton}
            onPress={executeWorkflow}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.executeButtonText}>Execute Workflow</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1F2937',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  successText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '500',
  },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepSuccess: {
    backgroundColor: '#D1FAE5',
  },
  stepError: {
    backgroundColor: '#FEE2E2',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  manualStepText: {
    fontSize: 14,
    color: '#3B82F6',
    fontStyle: 'italic',
    marginTop: 8,
  },
  executingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  executingText: {
    marginLeft: 8,
    color: '#3B82F6',
    fontSize: 14,
  },
  stepStatusSuccess: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  stepStatusError: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  executeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
  },
});
