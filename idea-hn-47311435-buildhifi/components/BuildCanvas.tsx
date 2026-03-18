import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Banner } from 'react-native-paper';
import ComponentCard from './ComponentCard';
import ConnectionLine from './ConnectionLine';
import { Build } from '@/lib/types';
import { validateSignalChain } from '@/lib/validation/chain';

interface BuildCanvasProps {
  build?: Build | null;
}

const BuildCanvas: React.FC<BuildCanvasProps> = ({ build }) => {
  if (!build) {
    return (
      <View style={styles.container}>
        <Text>No build selected</Text>
      </View>
    );
  }

  const validation = build.components.length > 0 ? validateSignalChain(build.components) : { isValid: true, suggestions: [], issues: [] };

  return (
    <ScrollView style={styles.container}>
      {validation.issues.length > 0 && (
        <Banner
          visible={true}
          icon="alert-circle"
          style={[styles.banner, validation.isValid ? styles.warningBanner : styles.errorBanner]}
        >
          <Text style={styles.bannerTitle}>
            {validation.isValid ? 'Warnings Found' : 'Compatibility Issues Found'}
          </Text>
          {validation.issues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>
              • {issue.message}
            </Text>
          ))}
        </Banner>
      )}
      
      <View style={styles.canvas}>
        {build.components.map((component, index) => {
          const nextComponent = build.components[index + 1];
          let connectionStatus: 'compatible' | 'warning' | 'incompatible' = 'compatible';
          
          if (nextComponent) {
            const pairValidation = validateSignalChain([component, nextComponent]);
            if (!pairValidation.isValid) {
              connectionStatus = 'incompatible';
            } else if (pairValidation.issues.some(issue => issue.severity === 'warning')) {
              connectionStatus = 'warning';
            }
          }

          return (
            <View key={component.id}>
              <ComponentCard 
                component={component} 
                validationStatus={connectionStatus}
              />
              {nextComponent && (
                <ConnectionLine
                  from={component}
                  to={nextComponent}
                  status={connectionStatus}
                />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    padding: 16,
  },
  banner: {
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: '#ffebee',
  },
  warningBanner: {
    backgroundColor: '#fff3e0',
  },
  bannerTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    marginVertical: 2,
  },
});

export default BuildCanvas;
