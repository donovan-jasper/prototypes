import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { FlyioClient } from '@/lib/cloudProviders/flyio';
import { useStore } from '@/lib/store';
import * as SecureStore from 'expo-secure-store';
import { openDatabase, saveAlert } from '@/lib/db';
import { sendLocalNotification } from '@/lib/notifications';

interface RecoveryActionModalProps {
  serviceId: string;
  workflowId: string;
  onClose: () => void;
}

export default function RecoveryActionModal({ serviceId, workflowId, onClose }: RecoveryActionModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [workflow, setWorkflow] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const services = useStore((state) => state.services);
  const updateServiceStatus = useStore((state) => state.updateServiceStatus);
  const addAlert = useStore((state) => state.addAlert);

  useEffect(() => {
    loadWorkflow();
  }, []);

  async function loadWorkflow() {
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
        `Your ${service.name} service has been recovered using ${workflow.name}`,
        'info'
      );

      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Recovery workflow failed:', err);

      // Save error alert
      const db = await openDatabase();
      await saveAlert(db, {
        serviceId: serviceId,
        severity: 'critical',
        message: `Recovery workflow failed: ${errorMessage}`
      });

      addAlert({
        id: Date.now(),
        serviceId: serviceId,
        severity: 'critical',
        message: `Recovery workflow failed: ${errorMessage}`,
        timestamp: Date.now()
      });

      await sendLocalNotification(
        'Recovery Failed',
        `Failed to recover ${services.find(s => s.id === serviceId)?.name || 'service'}`,
        'critical'
      );
    } finally {
      setIsExecuting(false);
    }
  }

  if (!workflow) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading workflow...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Execute Recovery Workflow</Text>
      <Text style={styles.workflowName}>{workflow.name}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {
            width: `${((currentStep + 1) / workflow.steps.length) * 100}%`
          }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {workflow.steps.length}
        </Text>
      </View>

      <ScrollView style={styles.stepsContainer}>
        {workflow.steps.map((step: any, index: number) => (
          <View key={step.id} style={styles.stepItem}>
            <View style={styles.stepHeader}>
              <View style={[
                styles.stepNumber,
                stepStatus[step.id] === 'success' && styles.stepSuccess,
                stepStatus[step.id] === 'error' && styles.stepError
              ]}>
                <Text style={styles.stepNumberText}>
                  {stepStatus[step.id] === 'success' ? '✓' : index + 1}
                </Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        ))}
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✓ Workflow completed successfully!</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
          disabled={isExecuting}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.executeButton]}
          onPress={executeWorkflow}
          disabled={isExecuting || success}
        >
          {isExecuting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, styles.executeButtonText]}>
              {success ? 'Done' : 'Execute Workflow'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1F2937',
  },
  workflowName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  stepsContainer: {
    flex: 1,
  },
  stepItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepSuccess: {
    backgroundColor: '#10B981',
  },
  stepError: {
    backgroundColor: '#EF4444',
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 36,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  successContainer: {
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  executeButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  executeButtonText: {
    color: '#fff',
  },
});
