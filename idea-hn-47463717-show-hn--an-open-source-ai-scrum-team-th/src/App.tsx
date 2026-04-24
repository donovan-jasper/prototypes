import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RepositorySelectionScreen from './screens/RepositorySelectionScreen';
import IssueListScreen from './screens/IssueListScreen';
import PRReviewScreen from './screens/PRReviewScreen';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RepositorySelection" component={RepositorySelectionScreen} options={{ title: 'Select Repository' }} />
        <Stack.Screen name="IssueList" component={IssueListScreen} options={{ title: 'Issues' }} />
        <Stack.Screen name="PRReview" component={PRReviewScreen} options={{ title: 'Pull Request Review' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
