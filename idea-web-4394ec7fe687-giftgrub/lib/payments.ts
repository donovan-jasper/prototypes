import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890'; // Replace with actual key
const API_BASE_URL = 'https://api.giftswift.com'; // Replace with actual backend

export interface PaymentIntentResponse {
  clientSecret: string;
  ephemeralKey: string;
  customer: string;
  publishableKey: string;
}

export async function createPaymentIntent(amount: number): Promise<PaymentIntentResponse> {
  // In production, this would call your backend API
  // For now, we'll simulate the response structure
  const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return response.json();
}

export async function initializePaymentSheet(
  amount: number,
  recipientName: string
): Promise<{ error?: string }> {
  try {
    const paymentIntent = await createPaymentIntent(amount);

    const { error } = await initPaymentSheet({
      merchantDisplayName: 'GiftSwift',
      customerId: paymentIntent.customer,
      customerEphemeralKeySecret: paymentIntent.ephemeralKey,
      paymentIntentClientSecret: paymentIntent.clientSecret,
      allowsDelayedPaymentMethods: false,
      defaultBillingDetails: {
        name: recipientName,
      },
      returnURL: 'giftswift://checkout',
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function processPayment(): Promise<{ error?: string; success?: boolean }> {
  try {
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code === 'Canceled') {
        return { error: 'Payment canceled' };
      }
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function calculateTotal(price: number, feePercentage: number = 0): number {
  return price + price * feePercentage;
}

export function validatePaymentAmount(amount: number): boolean {
  return amount >= 25 && amount <= 1000;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
