import { View, StyleSheet } from 'react-native';
import { useSystemStore } from '../../lib/store/systemStore';
import { SignalChain } from '../../components/SystemBuilder/SignalChain';
import { CompatibilityAlert } from '../../components/SystemBuilder/CompatibilityAlert';
import { FAB, Portal } from 'react-native-paper';
import { useState } from 'react';

export default function SystemBuilderScreen() {
  const { components } = useSystemStore();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <CompatibilityAlert />
      <SignalChain components={components} />
      <Portal>
        <FAB.Group
          open={open}
          icon={open ? 'close' : 'plus'}
          actions={[
            {
              icon: 'speaker',
              label: 'Add Speaker',
              onPress: () => console.log('Add Speaker'),
            },
            {
              icon: 'audio-input-rca',
              label: 'Add Receiver',
              onPress: () => console.log('Add Receiver'),
            },
            {
              icon: 'subwoofer',
              label: 'Add Subwoofer',
              onPress: () => console.log('Add Subwoofer'),
            },
          ]}
          onStateChange={({ open }) => setOpen(open)}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
