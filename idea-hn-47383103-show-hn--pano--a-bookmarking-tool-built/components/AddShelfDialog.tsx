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

  
