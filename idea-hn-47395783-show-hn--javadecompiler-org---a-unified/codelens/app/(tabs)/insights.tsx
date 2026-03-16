import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSecurityScan } from '../../hooks/useSecurityScan';
import { SecurityBadge } from '../../components/SecurityBadge';

const InsightsScreen = () => {
  const { securityFindings } = useSecurityScan();

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Security Insights</Text>
      <FlatList
        data={securityFindings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text style={{ fontSize: 18 }}>{item.type}</Text>
            <Text style={{ color: '#666' }}>{item.description}</Text>
            <SecurityBadge severity={item.severity} />
          </View>
        )}
      />
    </View>
  );
};

export default InsightsScreen;
