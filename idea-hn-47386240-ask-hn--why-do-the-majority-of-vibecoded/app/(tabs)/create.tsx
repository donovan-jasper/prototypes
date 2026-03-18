import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useRouter } from 'expo-router';
import { parseIntent } from '@/lib/ai/intentParser';
import { suggestComponents } from '@/lib/ai/componentSuggester';
import { createScreen as dbCreateScreen, createComponent as dbCreateComponent } from '@/lib/db/queries';

export default function CreateScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { addProject } = useProjectStore();
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a project description');
      return;
    }

    setLoading(true);
    try {
      // 1. Call parseIntent
      const intentResult = await parseIntent(description.trim());
      console.log('Parsed Intent:', intentResult);

      // 2. Use results from parseIntent to call suggestComponents
      const suggestedScreens = suggestComponents(intentResult);
      console.log('Suggested Screens & Components:', suggestedScreens);

      // 3. Orchestrate the creation of the new project
      const newProject = await addProject({
        name: name.trim(),
        description: description.trim(),
        appType: intentResult.appType, // Use AI-determined app type
      });

      // Create screens and components for the new project
      for (let i = 0; i < suggestedScreens.length; i++) {
        const suggestedScreen = suggestedScreens[i];
        const createdScreen = await dbCreateScreen({
          projectId: newProject.id,
          name: suggestedScreen.name,
          order: i,
          layout: {}, // Layout can be empty for now, or filled with AI suggestions later
        });

        for (let j = 0; j < suggestedScreen.components.length; j++) {
          const suggestedComponent = suggestedScreen.components[j];
          await dbCreateComponent({
            screenId: createdScreen.id,
            type: suggestedComponent.type,
            props: suggestedComponent.props,
            position: suggestedComponent.position,
            order: j,
          });
        }
      }

      // 4. Upon successful creation, navigate the user directly to the new project's editor
      Alert.alert('Success', 'Project created successfully with AI suggestions!', [
        {
          text: 'OK',
          onPress: () => {
            setName('');
            setDescription('');
            router.replace(`/project/${newProject.id}`); // Use replace to prevent going back to create screen
          },
        },
      ]);
    } catch (error) {
      console.error('Project creation failed:', error);
      Alert.alert('Error', `Failed to create project: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Create New Project
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Describe your app idea and we'll help you build it
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Project Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Fitness Tracker"
          disabled={loading}
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={[styles.input, styles.textArea]}
          placeholder="Describe your app idea in detail. What problem does it solve? Who is it for? What are the key features?"
          disabled={loading}
        />

        <Button
          mode="contained"
          onPress={handleCreate}
          style={styles.button}
          disabled={loading}
          loading={loading}
        >
          {loading ? 'Generating Prototype...' : 'Create Project'}
        </Button>
      </View>

      <View style={styles.tips}>
        <Text variant="titleSmall" style={styles.tipsTitle}>
          Tips for a great description:
        </Text>
        <Text variant="bodySmall" style={styles.tip}>
          • Explain the problem you're solving
        </Text>
        <Text variant="bodySmall" style={styles.tip}>
          • Describe your target users
        </Text>
        <Text variant="bodySmall" style={styles.tip}>
          • List the main features you envision
        </Text>
        <Text variant="bodySmall" style={styles.tip}>
          • Mention any similar apps for reference
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  form: {
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    minHeight: 150,
  },
  button: {
    marginTop: 8,
  },
  tips: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  tipsTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tip: {
    color: '#666',
    marginBottom: 8,
    paddingLeft: 8,
  },
});
