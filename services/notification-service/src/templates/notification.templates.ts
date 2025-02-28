import { NotificationTemplate } from '../types';

export const notificationTemplates: Record<string, NotificationTemplate> = {
  orderConfirmation: {
    id: 'order-confirmation',
    name: 'Order Confirmation',
    description: 'Sent when an order is successfully placed',
    channels: ['email', 'sms'],
    content: {
      email: {
        subject: 'Order Confirmation - #{orderId}',
        body: 'Dear #{customerName},\n\nThank you for your order! Your order #{orderId} has been confirmed and is being processed.\n\nOrder Total: #{orderTotal}\nEstimated Delivery: #{estimatedDelivery}\n\nTrack your order here: #{trackingUrl}\n\nBest regards,\nEco-Dex Team'
      },
      sms: {
        body: 'Your Eco-Dex order #{orderId} is confirmed! Total: #{orderTotal}. Track here: #{trackingUrl}'
      }
    }
  },
  paymentSuccess: {
    id: 'payment-success',
    name: 'Payment Success',
    description: 'Sent when payment is successfully processed',
    channels: ['email', 'sms'],
    content: {
      email: {
        subject: 'Payment Successful - #{transactionId}',
        body: 'Dear #{customerName},\n\nYour payment of #{amount} has been successfully processed.\n\nTransaction ID: #{transactionId}\nDate: #{date}\n\nThank you for choosing Eco-Dex!\n\nBest regards,\nEco-Dex Team'
      },
      sms: {
        body: 'Payment of #{amount} successful! Transaction ID: #{transactionId}. Thank you for choosing Eco-Dex!'
      }
    }
  },
  shippingUpdate: {
    id: 'shipping-update',
    name: 'Shipping Update',
    description: 'Sent when there is an update in shipping status',
    channels: ['email', 'sms', 'push'],
    content: {
      email: {
        subject: 'Shipping Update for Order #{orderId}',
        body: 'Dear #{customerName},\n\nYour order #{orderId} has been #{status}.\n\nCurrent Location: #{location}\nExpected Delivery: #{expectedDelivery}\n\nTrack your order here: #{trackingUrl}\n\nBest regards,\nEco-Dex Team'
      },
      sms: {
        body: 'Eco-Dex Order #{orderId} #{status}. Expected delivery: #{expectedDelivery}. Track: #{trackingUrl}'
      },
      push: {
        title: 'Shipping Update',
        body: 'Your order #{orderId} has been #{status}',
        data: {
          orderId: '#{orderId}',
          status: '#{status}',
          trackingUrl: '#{trackingUrl}'
        }
      }
    }
  }
};