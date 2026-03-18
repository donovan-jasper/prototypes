import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, TextInput, Button, Text } from 'react-native-paper';

interface AddShelfDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  editShelf?: { id: number; name: string; description: string | null };
}

export const AddShelfDialog: React.FC<AddShelfDialogProps> = ({
  visible,
  onDismiss,
  onSave,
  editShelf,
}) => {
  const [name, setName] = useState(editShelf?.name || '');
  const [description, setDescription] = useState(editShelf?.description || '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setName(editShelf?.name || '');
      setDescription(editShelf?.description || '');
    }
  }, [visible, editShelf]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave(name.trim(), description.trim());
      setName('');
      setDescription('');
      onDismiss();
    } catch (err) {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{editShelf ? 'Edit Shelf' : 'Create Shelf'}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Shelf Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            autoFocus
          />
          <TextInput
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={saving}>
            Cancel
          </Button>
          <Button onPress={handleSave} disabled={!name.trim() || saving} loading={saving}>
            {editShelf ? 'Save' : 'Create'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
});
