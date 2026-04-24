import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import IssueListScreen from './screens/IssueListScreen';
import PRReviewScreen from './screens/PRReviewScreen';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="IssueList">
        <Stack.Screen name="IssueList" component={IssueListScreen} />
        <Stack.Screen name="PRReview" component={PRReviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
