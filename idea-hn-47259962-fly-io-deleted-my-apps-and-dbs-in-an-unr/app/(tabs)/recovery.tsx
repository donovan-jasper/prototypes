import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { openDatabase } from '@/lib/db';
import { useStore } from '@/lib/store';
import RecoveryStep from '@/components/RecoveryStep';

type RecoveryWorkflow = {
  id: string;
  name: string;
  provider: string;
  steps: {
    id: string;
    title: string;
    description: string;
    action?: {
      type: 'api' | 'manual';
      endpoint?: string;
      method?: 'GET' | 'POST' | 'PUT';
      body?: any;
    };
  }[];
};

export default function RecoveryScreen() {
  const [workflows, setWorkflows] = useState<RecoveryWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<RecoveryWorkflow | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const services = useStore((state) => state.services);

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    const db = await openDatabase();
    const dbWorkflows = await db.getAllAsync('SELECT * FROM recovery_workflows');
    const parsedWorkflows = dbWorkflows.map((w: any) => ({
      ...w,
      steps: JSON.parse(w.steps)
    }));
    setWorkflows(parsedWorkflows);
  }

  function getWorkflowsForService(serviceId: string) {
    const service = services.find(s => s.id === serviceId);
    if (!service) return [];

    return workflows.filter(w =>
      w.provider === service.provider &&
      (service.status === 'unhealthy' || service.status === 'deleted')
    );
  }

  function getServiceName(serviceId: string) {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  }

  return (
    <View style={styles.container}>
      {!selectedWorkflow ? (
        <View style={styles.workflowList}>
          <Text style={styles.header}>Recovery Workflows</Text>
          <FlatList
            data={services.filter(s => s.status !== 'healthy')}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.serviceSection}>
                <Text style={styles.serviceName}>{item.name}</Text>
                {getWorkflowsForService(item.id).map((workflow) => (
                  <TouchableOpacity
                    key={workflow.id}
                    style={styles.workflowItem}
                    onPress={() => {
                      setSelectedWorkflow(workflow);
                      setSelectedServiceId(item.id);
                    }}
                  >
                    <Text style={styles.workflowTitle}>{workflow.name}</Text>
                    <Text style={styles.workflowSteps}>{workflow.steps.length} steps</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>All services are healthy!</Text>
                <Text style={styles.emptySubtext}>No recovery workflows needed at this time.</Text>
              </View>
            }
          />
        </View>
      ) : (
        <View style={styles.workflowDetail}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedWorkflow(null);
              setSelectedServiceId(null);
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.workflowHeader}>{selectedWorkflow.name}</Text>
          <Text style={styles.serviceInfo}>For: {getServiceName(selectedServiceId || '')}</Text>
          <FlatList
            data={selectedWorkflow.steps}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <RecoveryStep
                step={item}
                stepNumber={index + 1}
                totalSteps={selectedWorkflow.steps.length}
                serviceId={selectedServiceId || ''}
              />
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  workflowList: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1F2937',
  },
  serviceSection: {
    marginBottom: 24,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  workflowItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workflowTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  workflowSteps: {
    fontSize: 14,
    color: '#6B7280',
  },
  workflowDetail: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  workflowHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  serviceInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
