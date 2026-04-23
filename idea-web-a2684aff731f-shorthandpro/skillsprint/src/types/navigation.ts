import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Home: undefined;
  Challenges: undefined;
  Profile: undefined;
  Challenge: {
    id: string;
    title: string;
    description: string;
  };
};

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList>;
  Modal: undefined;
  NotFound: undefined;
};
