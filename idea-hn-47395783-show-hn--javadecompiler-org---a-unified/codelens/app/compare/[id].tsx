import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useDecompilation } from '../../hooks/useDecompilation';
import { ComparisonView } from '../../components/ComparisonView';

const CompareScreen = ({ route }) => {
  const { id } = route.params;
  const { getDecompilation, getComparison } = useDecompilation();
  const [decompilation, setDecompilation] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      const data = await getDecompilation(id);
      const comparisonData = await getComparison(data);
      setDecompilation(data);
      setComparison(comparisonData);
      setLoading(false);
    };
    fetchComparison();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 16 }}>Comparison: {decompilation.fileName}</Text>
      <ComparisonView comparison={comparison} />
    </View>
  );
};

export default CompareScreen;
