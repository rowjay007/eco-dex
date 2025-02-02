export interface ServiceEndpoint {
  url: string;
  timeout?: number;
  retries?: number;
}

export interface ServicesConfig {
  [key: string]: ServiceEndpoint;
}

const servicesConfig: ServicesConfig = {
  cart: {
    url: process.env.CART_SERVICE_URL || "http://cart-service:8081",
    timeout: 5000,
    retries: 3,
  },
  order: {
    url: process.env.ORDER_SERVICE_URL || "http://order-service:8082",
    timeout: 5000,
    retries: 3,
  },
  payment: {
    url: process.env.PAYMENT_SERVICE_URL || "http://payment-service:8083",
    timeout: 5000,
    retries: 3,
  },
  product: {
    url: process.env.PRODUCT_SERVICE_URL || "http://product-service:8084",
    timeout: 5000,
    retries: 3,
  },
  notification: {
    url:
      process.env.NOTIFICATION_SERVICE_URL ||
      "http://notification-service:8085",
    timeout: 5000,
    retries: 3,
  },
  user: {
    url: process.env.USER_SERVICE_URL || "http://user-service:8086",
    timeout: 5000,
    retries: 3,
  },
};

export default servicesConfig;
