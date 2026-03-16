import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext';
import { OrderProvider } from '../contexts/OrderContext';
import { PaymentProvider } from '../contexts/PaymentProvider';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <OrderProvider>
          <PaymentProvider>
            <SubscriptionProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="order/[id]" options={{ title: 'Order Details' }} />
                <Stack.Screen name="order/create" options={{ title: 'Create Order' }} />
                <Stack.Screen name="order/join" options={{ title: 'Join Order' }} />
                <Stack.Screen name="payment/setup" options={{ title: 'Add Payment Method' }} />
                <Stack.Screen name="payment/split" options={{ title: 'Payment Split' }} />
              </Stack>
            </SubscriptionProvider>
          </PaymentProvider>
        </OrderProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
