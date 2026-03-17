import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useContactStore } from '../../store/contactStore';
import { Picker } from '@react-native-picker/picker';

export default function NewContactScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [frequency, setFrequency] = useState(7);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; frequency?: string }>({});

  const { addContact } = useContactStore();
  const router = useRouter();
  const theme = useTheme();

  const validate = () => {
    const newErrors: { name?: string; frequency?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!frequency || frequency <= 0) {
      newErrors.frequency = 'Check-in frequency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      await addContact({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        relationship: relationship.trim() || undefined,
        frequency,
        lastContact: new Date(),
        notes: notes.trim() || undefined,
        createdAt: new Date(),
      });

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save contact');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        New Contact
      </Text>

      <View style={styles.form}>
        <TextInput
          label="Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          error={!!errors.name}
        />
        {errors.name && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.name}
          </Text>
        )}

        <TextInput
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          style={styles.input}
          keyboardType="phone-pad"
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Relationship Type"
          value={relationship}
          onChangeText={setRelationship}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Friend, Family, Colleague"
        />

        <View style={styles.pickerContainer}>
          <Text variant="bodyLarge" style={styles.pickerLabel}>
            Check-in Frequency (days) *
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={frequency}
              onValueChange={(itemValue) => setFrequency(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Weekly (7 days)" value={7} />
              <Picker.Item label="Bi-weekly (14 days)" value={14} />
              <Picker.Item label="Monthly (30 days)" value={30} />
              <Picker.Item label="Quarterly (90 days)" value={90} />
            </Picker>
          </View>
          {errors.frequency && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.frequency}
            </Text>
          )}
        </View>

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Add any notes about this contact..."
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
          >
            Save Contact
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.button}
          >
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  errorText: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    marginBottom: 8,
  },
});
