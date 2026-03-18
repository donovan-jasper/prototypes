import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddFriendModal = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (phone && !/^\d{10,}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim(), avatar: '' });
      setName('');
      setPhone('');
      setEmail('');
      setErrors({});
    }
  };

  const handleCancel = () => {
    setName('');
    setPhone('');
    setEmail('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New Friend</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close" size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={setName}
                placeholder="Enter friend's name"
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});

export default AddFriendModal;
