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
        `Your ${service.name} service has been recovered using ${workflow.name}`,
        'info'
      );

      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message :
        'An unknown error occurred during recovery';
      setError(errorMessage);
      console.error('Recovery failed:', err);
    } finally {
      setIsExecuting(false);
    }
  }

  function getStepStatusIcon(status: 'pending' | 'success' | 'error') {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return '•';
    }
  }

  function getStepStatusColor(status: 'pending' | 'success' | 'error') {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }

  if (!workflowId || !serviceId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid workflow or service ID</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
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
        <Text style={styles.header}>Executing Workflow</Text>
        <Text style={styles.workflowName}>{workflow.name}</Text>

        {workflow.steps.map((step: any, index: number) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>
                {getStepStatusIcon(stepStatus[step.id])}
              </Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.stepStatus}>
              <Text style={[
                styles.stepStatusText,
                { color: getStepStatusColor(stepStatus[step.id]) }
              ]}>
                {stepStatus[step.id] === 'pending' ? 'Pending' :
                 stepStatus[step.id] === 'success' ? 'Completed' : 'Failed'}
              </Text>
            </View>
          </View>
        ))}

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
      </ScrollView>

      <View style={styles.footer}>
        {!success && !error && (
          <TouchableOpacity
            style={styles.executeButton}
            onPress={executeWorkflow}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.executeButtonText}>Execute Workflow</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          disabled={isExecuting}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 8,
    color: '#1F2937',
  },
  workflowName: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
  },
  stepContainer: {
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
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#3B82F6',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  stepStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  stepStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  executeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  executeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#374151',
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
