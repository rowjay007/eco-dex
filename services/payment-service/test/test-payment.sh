#!/bin/bash

API_URL="http://localhost:3005/api/payments"

echo "\n1. Testing Paystack Payment Initiation..."
INITIATE_RESPONSE=$(curl -s -X POST "${API_URL}/initiate" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "email": "test@example.com",
    "provider": "paystack",
    "currency": "NGN",
    "callbackUrl": "http://localhost:3000/payment/callback",
    "metadata": {
      "orderId": "12345",
      "customerId": "67890"
    }
  }')

echo "Payment Initiated Response:"
echo "$INITIATE_RESPONSE" | jq '.' || echo "$INITIATE_RESPONSE"

# Extract reference from the response
REFERENCE=$(echo "$INITIATE_RESPONSE" | jq -r '.data.reference')

if [ -n "$REFERENCE" ] && [ "$REFERENCE" != "null" ]; then
  echo "\n2. Testing Payment Verification..."
  VERIFY_RESPONSE=$(curl -s -X POST "${API_URL}/verify" \
    -H "Content-Type: application/json" \
    -d "{
      \"reference\": \"$REFERENCE\",
      \"provider\": \"paystack\"
    }")

  echo "Payment Verification Response:"
  echo "$VERIFY_RESPONSE" | jq '.' || echo "$VERIFY_RESPONSE"
else
  echo "\nError: Could not extract payment reference from initiation response"
fi

echo "\n3. Testing Flutterwave Payment Initiation..."
FW_INITIATE_RESPONSE=$(curl -s -X POST "${API_URL}/initiate" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "email": "test@example.com",
    "provider": "flutterwave",
    "currency": "NGN",
    "callbackUrl": "http://localhost:3000/payment/callback",
    "metadata": {
      "orderId": "12345",
      "customerId": "67890"
    }
  }')

echo "Flutterwave Payment Initiated Response:"
echo "$FW_INITIATE_RESPONSE" | jq '.' || echo "$FW_INITIATE_RESPONSE"

# Extract reference from Flutterwave response
FW_REFERENCE=$(echo "$FW_INITIATE_RESPONSE" | jq -r '.data.tx_ref')

if [ -n "$FW_REFERENCE" ] && [ "$FW_REFERENCE" != "null" ]; then
  echo "\n4. Testing Flutterwave Payment Verification..."
  FW_VERIFY_RESPONSE=$(curl -s -X POST "${API_URL}/verify" \
    -H "Content-Type: application/json" \
    -d "{
      \"reference\": \"$FW_REFERENCE\",
      \"provider\": \"flutterwave\"
    }")

  echo "Flutterwave Payment Verification Response:"
  echo "$FW_VERIFY_RESPONSE" | jq '.' || echo "$FW_VERIFY_RESPONSE"
else
  echo "\nError: Could not extract payment reference from Flutterwave initiation response"
fi