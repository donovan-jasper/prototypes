import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
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
  serviceId: string;
}

export default function RecoveryStep({ step, stepNumber, totalSteps, serviceId }: RecoveryStepProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const services = useStore((state) => state.services);

  const service = services.find(s => s.id === serviceId);
  const isManualStep = !step.action || step.action.type === 'manual';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.stepNumberContainer}>
          <Text style={styles.stepNumber}>{stepNumber}</Text>
          <Text style={styles.totalSteps}>/{totalSteps}</Text>
        </View>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <Text style={styles.description}>{step.description}</Text>

          {isManualStep && (
            <View style={styles.manualStep}>
              <Text style={styles.manualStepText}>This step requires manual action:</Text>
              <Text style={styles.manualStepInstructions}>
                Please follow the instructions above to complete this step manually.
              </Text>
            </View>
          )}

          {step.action?.type === 'api' && (
            <View style={styles.apiStep}>
              <Text style={styles.apiStepText}>API Action:</Text>
              <Text style={styles.apiStepDetail}>Endpoint: {step.action.endpoint}</Text>
              <Text style={styles.apiStepDetail}>Method: {step.action.method}</Text>
              {service && (
                <Text style={styles.apiStepDetail}>Service: {service.name}</Text>
              )}
            </View>
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
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  stepNumberContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  totalSteps: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  chevron: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  manualStep: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  manualStepText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  manualStepInstructions: {
    fontSize: 14,
    color: '#6B7280',
  },
  apiStep: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  apiStepText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  apiStepDetail: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 2,
  },
});
