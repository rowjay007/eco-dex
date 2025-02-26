import axios from 'axios';

const API_URL = 'http://localhost:3005/api/payments';

async function testPaymentFlow() {
  try {
    // 1. Initiate payment with Paystack
    console.log('\n1. Testing Paystack Payment Initiation...');
    const initiateResponse = await axios.post(`${API_URL}/initiate`, {
      amount: 5000, // Amount in kobo (50 NGN)
      email: 'test@example.com',
      provider: 'paystack',
      currency: 'NGN',
      callbackUrl: 'http://localhost:3000/payment/callback',
      metadata: {
        orderId: '12345',
        customerId: '67890'
      }
    });

    console.log('Payment Initiated:', {
      status: initiateResponse.data.status,
      message: initiateResponse.data.message,
      authorizationUrl: initiateResponse.data.data.authorization_url,
      reference: initiateResponse.data.data.reference
    });

    // Store the reference for verification
    const reference = initiateResponse.data.data.reference;

    // 2. Verify payment
    console.log('\n2. Testing Payment Verification...');
    const verifyResponse = await axios.post(`${API_URL}/verify`, {
      reference,
      provider: 'paystack'
    });

    console.log('Payment Verification Result:', {
      status: verifyResponse.data.status,
      message: verifyResponse.data.message,
      data: verifyResponse.data.data
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      });
    } else {
      console.error('Error:', error);
    }
  }
}

// Run the test
console.log('Starting Payment Service Test...');
testPaymentFlow().then(() => {
  console.log('\nTest completed!');
});
