import React, { useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { OrderContext } from '../../contexts/OrderContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateOrderScreen() {
  const router = useRouter();
  const { createOrder } = useContext(OrderContext);
  const [restaurant, setRestaurant] = useState('');
  const [menuLink, setMenuLink] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCreateOrder = async () => {
    const newOrder = await createOrder({
      restaurant,
      menuLink,
      deadline: deadline.toISOString(),
      status: 'pending',
    });
    router.push(`/order/${newOrder.id}`);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Create New Order</Text>
      <TextInput
        label="Restaurant Name"
        value={restaurant}
        onChangeText={setRestaurant}
        style={styles.input}
      />
      <TextInput
        label="Menu Link"
        value={menuLink}
        onChangeText={setMenuLink}
        style={styles.input}
      />
      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.input}
      >
        Set Order Deadline: {deadline.toLocaleString()}
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={deadline}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDeadline(selectedDate);
            }
          }}
        />
      )}
      <Button
        mode="contained"
        onPress={handleCreateOrder}
        disabled={!restaurant || !menuLink}
        style={styles.button}
      >
        Create Order
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
