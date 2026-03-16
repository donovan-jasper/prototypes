module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|react-native-paper|expo(nent)?|@expo(nent)?/.*|@react-native-community|@react-navigation/.*|expo-av|expo-location|expo-notifications|expo-sqlite|axios)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/*.test.(ts|tsx|js|jsx)'],
};
