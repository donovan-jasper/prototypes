import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  const [isLoading, setIsLoading] = useState(true);
  const services = useStore((state) => state.services);

  useEffect(() => {
    loadWorkflows();
  }, []);

  async function loadWorkflows() {
    setIsLoading(true);
    try {
      const db = await openDatabase();
      const dbWorkflows = await db.getAllAsync('SELECT * FROM recovery_workflows');
      const parsedWorkflows = dbWorkflows.map((w: any) => ({
        ...w,
        steps: JSON.parse(w.steps)
      }));
      setWorkflows(parsedWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading recovery workflows...</Text>
      </View>
    );
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
                {getWorkflowsForService(item.id).length > 0 ? (
                  getWorkflowsForService(item.id).map((workflow) => (
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
                  ))
                ) : (
                  <View style={styles.noWorkflows}>
                    <Text style={styles.noWorkflowsText}>No recovery workflows available for this service</Text>
                  </View>
                )}
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
            ListFooterComponent={
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {selectedWorkflow.steps.length} steps to complete this workflow
                </Text>
              </View>
            }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
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
  noWorkflows: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  noWorkflowsText: {
    color: '#6B7280',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#10B981',
    marginBottom: 8,
  },
  emptySubtext: {
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
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
  workflowHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1F2937',
  },
  serviceInfo: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
});
