import { View, StyleSheet } from 'react-native';
import { Banner, Text } from 'react-native-paper';
import { useSystemStore } from '../../lib/store/systemStore';
import { checkCompatibility } from '../../lib/compatibility/checker';

export function CompatibilityAlert() {
  const { components } = useSystemStore();
  const issues = checkCompatibility(components);

  if (issues.length === 0) {
    return null;
  }

  return (
    <Banner
      visible={true}
      actions={[
        {
          label: 'Fix Issues',
          onPress: () => console.log('Fix issues'),
        },
      ]}
      style={styles.banner}
    >
      <Text>Found {issues.length} compatibility issues</Text>
    </Banner>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: 16,
  },
});
