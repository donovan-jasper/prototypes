import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, ProgressBar, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { generateQuestions } from '@/lib/ai/questionGenerator';
import { useEditorStore } from '@/store/editorStore';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'multiple-choice' | 'boolean';
  options?: string[];
}

interface QuestionFlowProps {
  projectId: string;
}

export default function QuestionFlow({ projectId }: QuestionFlowProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { currentProject, loadProjectData } = useEditorStore();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!currentProject) {
          await loadProjectData(projectId);
        }

        if (currentProject) {
          const generatedQuestions = await generateQuestions(currentProject);
          setQuestions(generatedQuestions);
        }
      } catch (error) {
        console.error('Failed to generate questions:', error);
        Alert.alert('Error', 'Failed to generate questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [projectId, currentProject, loadProjectData]);

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered, submit answers
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    setSubmitting(true);
    try {
      // In a real app, you would save answers to the project
      // For this prototype, we'll just navigate to the project editor
      Alert.alert('Success', 'Your answers have been recorded!', [
        {
          text: 'OK',
          onPress: () => router.replace(`/project/${projectId}`),
        },
      ]);
    } catch (error) {
      console.error('Failed to submit answers:', error);
      Alert.alert('Error', 'Failed to submit answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Generating questions...</Text>
        <ProgressBar indeterminate style={styles.progressBar} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No questions available for this project.</Text>
        <Button mode="contained" onPress={() => router.replace(`/project/${projectId}`)}>
          Go to Project
        </Button>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / questions.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          {currentProject?.name || 'Project'}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Answer these questions to refine your prototype
        </Text>
      </View>

      <ProgressBar progress={progress} style={styles.progressBar} />

      <View style={styles.questionContainer}>
        <Text variant="titleMedium" style={styles.questionText}>
          {currentQuestion.text}
        </Text>

        {currentQuestion.type === 'text' && (
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={4}
            value={answers[currentQuestion.id] || ''}
            onChangeText={(text) => handleAnswer(text)}
            style={styles.textInput}
            placeholder="Type your answer here..."
          />
        )}

        {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                mode={answers[currentQuestion.id] === option ? 'contained' : 'outlined'}
                onPress={() => handleAnswer(option)}
                style={styles.optionButton}
              >
                {option}
              </Button>
            ))}
          </View>
        )}

        {currentQuestion.type === 'boolean' && (
          <View style={styles.booleanContainer}>
            <Button
              mode={answers[currentQuestion.id] === 'Yes' ? 'contained' : 'outlined'}
              onPress={() => handleAnswer('Yes')}
              style={styles.booleanButton}
            >
              Yes
            </Button>
            <Button
              mode={answers[currentQuestion.id] === 'No' ? 'contained' : 'outlined'}
              onPress={() => handleAnswer('No')}
              style={styles.booleanButton}
            >
              No
            </Button>
          </View>
        )}
      </View>

      <View style={styles.navigationButtons}>
        {currentQuestionIndex > 0 && (
          <Button
            mode="outlined"
            onPress={goBack}
            style={styles.backButton}
          >
            Back
          </Button>
        )}

        {currentQuestionIndex < questions.length - 1 && (
          <Button
            mode="contained"
            onPress={() => setCurrentQuestionIndex(prev => prev + 1)}
            style={styles.nextButton}
            disabled={!answers[currentQuestion.id]}
          >
            Next
          </Button>
        )}

        {currentQuestionIndex === questions.length - 1 && (
          <Button
            mode="contained"
            onPress={submitAnswers}
            style={styles.submitButton}
            loading={submitting}
            disabled={!answers[currentQuestion.id]}
          >
            Finish
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  progressBar: {
    marginBottom: 24,
    height: 4,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    marginBottom: 8,
  },
  booleanContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  booleanButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    flex: 1,
    marginLeft: 8,
  },
  submitButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
