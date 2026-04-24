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
        <Stack.Screen
          name="RepositorySelection"
          component={RepositorySelectionScreen}
          options={{
            title: 'Select Repository',
            headerStyle: {
              backgroundColor: '#6200ee',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="IssueList"
          component={IssueListScreen}
          options={({ route }) => ({
            title: route.params?.repo ? `${route.params.repo.split('/')[1]} Issues` : 'Issues',
            headerStyle: {
              backgroundColor: '#6200ee',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        />
        <Stack.Screen
          name="PRReview"
          component={PRReviewScreen}
          options={{
            title: 'Pull Request Review',
            headerStyle: {
              backgroundColor: '#6200ee',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
