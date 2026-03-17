// Mock Stripe service for simulating payment flows
export interface MockPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
}

export interface MockPaymentMethod {
  id: string;
  type: 'card';
  card: {
    last4: string;
    brand: string;
  };
}

let paymentIntentCounter = 1000;
let paymentMethodCounter = 2000;

export const createMockPaymentIntent = (amount: number, currency: string = 'usd'): MockPaymentIntent => {
  const id = `pi_mock_${paymentIntentCounter++}`;
  return {
    id,
    amount,
    currency,
    status: 'requires_payment_method',
    clientSecret: `${id}_secret_${Math.random().toString(36).substring(7)}`,
  };
};

export const confirmMockPaymentIntent = async (clientSecret: string): Promise<MockPaymentIntent> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const id = clientSecret.split('_secret_')[0];
  return {
    id,
    amount: 0, // Amount not needed for confirmation
    currency: 'usd',
    status: 'succeeded',
    clientSecret,
  };
};

export const createMockPaymentMethod = (): MockPaymentMethod => {
  const id = `pm_mock_${paymentMethodCounter++}`;
  return {
    id,
    type: 'card',
    card: {
      last4: '4242',
      brand: 'visa',
    },
  };
};

export const saveMockPaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};
