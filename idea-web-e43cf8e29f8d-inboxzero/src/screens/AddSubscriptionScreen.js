import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { addSubscription } from '../services/SubscriptionService';

const AddSubscriptionScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('email');
  const [cost, setCost] = useState('');
  const [unsubscribeUrl, setUnsubscribeUrl] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [renewalDate, setRenewalDate] = useState('');

  const categories = ['email', 'social', 'newsletter'];
  const billingCycles = ['monthly', 'yearly'];

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a subscription name');
      return;
    }

    let parsedRenewalDate = null;
    if (renewalDate.trim()) {
      const date = new Date(renewalDate.trim());
      if (isNaN(date.getTime())) {
        Alert.alert('Error', 'Invalid renewal date format. Use YYYY-MM-DD');
        return;
      }
      parsedRenewalDate = date.toISOString();
    }

    const subscription = {
      name: name.trim(),
      source: source.trim(),
      category,
      cost: cost ? parseFloat(cost) : 0,
      unsubscribe_url: unsubscribeUrl.trim(),
      billing_cycle: cost && parseFloat(cost) > 0 ? billingCycle : null,
      renewal_date: parsedRenewalDate,
    };

    await addSubscription(subscription);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Subscription Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Netflix, NY Times"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Email/Source</Text>
        <TextInput
          style={styles.input}
          value={source}
          onChangeText={setSource}
          placeholder="e.g., newsletter@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Monthly Cost ($)</Text>
        <TextInput
          style={styles.input}
          value={cost}
          onChangeText={setCost}
          placeholder="0.00"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
        />

        {cost && parseFloat(cost) > 0 && (
          <>
            <Text style={styles.label}>Billing Cycle</Text>
            <View style={styles.categoryContainer}>
              {billingCycles.map((cycle) => (
                <TouchableOpacity
                  key={cycle}
                  style={[
                    styles.categoryButton,
                    billingCycle === cycle && styles.categoryButtonActive,
                  ]}
                  onPress={() => setBillingCycle(cycle)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      billingCycle === cycle && styles.categoryTextActive,
                    ]}
                  >
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Next Renewal Date</Text>
            <Text style={styles.hint}>Format: YYYY-MM-DD (e.g., 2026-04-15)</Text>
            <TextInput
              style={styles.input}
              value={renewalDate}
              onChangeText={setRenewalDate}
              placeholder="2026-04-15"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </>
        )}

        <Text style={styles.label}>Unsubscribe URL (Optional)</Text>
        <Text style={styles.hint}>Paste the unsubscribe link from your email</Text>
        <TextInput
          style={[styles.input, styles.urlInput]}
          value={unsubscribeUrl}
          onChangeText={setUnsubscribeUrl}
          placeholder="https://example.com/unsubscribe"
          placeholderTextColor="#999"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Subscription</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  urlInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddSubscriptionScreen;
