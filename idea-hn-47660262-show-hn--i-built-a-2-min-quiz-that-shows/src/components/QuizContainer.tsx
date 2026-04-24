import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Quiz from './Quiz';

const QuizContainer: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 5; // Example: 5 questions in the quiz

  const handleComplete = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Quiz completed - navigate to results or dashboard
      console.log('Quiz completed!');
    }
  };

  return (
    <View style={styles.container}>
      <Quiz
        onComplete={handleComplete}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default QuizContainer;
