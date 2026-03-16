import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { getTemplates } from '../../lib/templates';
import TemplateCard from '../../components/TemplateCard';

const TemplatesScreen = () => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const loadTemplates = async () => {
      const templates = await getTemplates(false); // false for free tier
      setTemplates(templates);
    };
    loadTemplates();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TemplateCard template={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default TemplatesScreen;
