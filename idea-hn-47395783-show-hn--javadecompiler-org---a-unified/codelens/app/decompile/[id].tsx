import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useDecompilation } from '../../hooks/useDecompilation';
import { CodeViewer } from '../../components/CodeViewer';
import { FileTree } from '../../components/FileTree';

const DecompileScreen = ({ route }) => {
  const { id } = route.params;
  const { getDecompilation } = useDecompilation();
  const [decompilation, setDecompilation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDecompilation = async () => {
      const data = await getDecompilation(id);
      setDecompilation(data);
      setLoading(false);
    };
    fetchDecompilation();
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
      <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 16 }}>{decompilation.fileName}</Text>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <FileTree files={decompilation.files} />
        <CodeViewer code={decompilation.code} />
      </View>
    </View>
  );
};

export default DecompileScreen;
