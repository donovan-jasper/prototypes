import { View, StyleSheet } from 'react-native';
import { ComponentCard } from './ComponentCard';
import { useSystemStore } from '../../lib/store/systemStore';

export function SignalChain({ components }) {
  const { removeComponent } = useSystemStore();

  return (
    <View style={styles.container}>
      {components.map((component) => (
        <ComponentCard
          key={component.id}
          component={component}
          onPress={() => console.log('Component pressed')}
          onLongPress={() => removeComponent(component.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
