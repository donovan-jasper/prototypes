import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
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
  const services = useStore((state) => state.services);
  const updateServiceStatus = useStore((state) => state.updateServiceStatus);
  const addAlert = useStore((state) => state.addAlert);

  useEffect(() => {
    loadWorkflow();
  }, []);

  async function loadWorkflow() {
    const db = await openDatabase();
    const workflowData = await db.getFirstAsync(
      'SELECT * FROM recovery_workflows WHERE id = ?',
      [workflowId]
    );

    if (workflowData) {
      setWorkflow({
        ...workflowData,
        steps: JSON.parse(workflowData.steps)
      });
    }
  }

  async function executeWorkflow() {
    if (!workflow || isExecuting) return;

    setIsExecuting(true);
    setError(null);

    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) throw new Error('Service not found');

      const token = await SecureStore.getItemAsync(`auth_token_${service.provider}`);
      if (!token) throw new Error('No authentication token found');

      const db = await openDatabase();

      // Execute each step in sequence
      for (const step of workflow.steps) {
        if (step.action?.type === 'api') {
          switch (service.provider) {
            case 'flyio':
              const flyioClient = new FlyioClient(token);
              if (step.action.endpoint === 'restart') {
                await flyioClient.restartApp(service.id);
                // Update service status in Zustand
                updateServiceStatus(service.id, 'healthy');
                // Update in database
                await db.runAsync(
                  'UPDATE services SET status = ?, last_check = ? WHERE id = ?',
                  ['healthy', Date.now(), service.id]
                );
              } else if (step.action.endpoint === 'rollback') {
                await flyioClient.rollbackDeployment(service.id);
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
        }
      }

      // Save alert to database
      await saveAlert(db, {
        serviceId: service.id,
        severity: 'info',
        message: `Successfully executed recovery workflow: ${workflow.name}`
      });

      // Add to Zustand store
      addAlert({
        id: Date.now(),
        serviceId: service.id,
        severity: 'info',
        message: `Successfully executed recovery workflow: ${workflow.name}`,
        timestamp: Date.now()
      });

      // Send notification
      await sendLocalNotification(
        'Recovery Successful',
        `Your ${service.name} service has been recovered using ${workflow.name}`,
        'info'
      );

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Recovery workflow failed:', err);

      // Save error alert
      const db = await openDatabase();
      await saveAlert(db, {
        serviceId: serviceId,
        severity: 'critical',
        message: `Recovery workflow failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      });

      addAlert({
        id: Date.now(),
        serviceId: serviceId,
        severity: 'critical',
        message: `Recovery workflow failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Execute Recovery Workflow</Text>
      <Text style={styles.workflowName}>{workflow.name}</Text>

      <View style={styles.stepsContainer}>
        <Text style={styles.stepsHeader}>Steps:</Text>
        {workflow.steps.map((step: any, index: number) => (
          <View key={step.id} style={styles.stepItem}>
            <Text style={styles.stepNumber}>{index + 1}.</Text>
            <Text style={styles.stepText}>{step.title}</Text>
          </View>
        ))}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {success ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✓ Workflow completed successfully!</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.executeButton, isExecuting && styles.disabledButton]}
            onPress={executeWorkflow}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Execute Workflow</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  workflowName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    fontWeight: 'bold',
    marginRight: 8,
    color: '#3B82F6',
  },
  stepText: {
    flex: 1,
    color: '#4B5563',
  },
  buttonContainer: {
    marginTop: 20,
  },
  executeButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
  },
  successContainer: {
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    color: '#059669',
    fontWeight: '600',
    marginBottom: 12,
  },
  closeButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
