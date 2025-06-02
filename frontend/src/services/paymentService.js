import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../config/api.config';

// Axios configuration for payments
const paymentAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout for payments
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
paymentAxios.interceptors.request.use(
  (config) => {
    const headers = getAuthHeaders();
    config.headers = {
      ...config.headers,
      ...headers
    };
    return config;
  },
  (error) => {
    console.error('Error configuring payment request:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
paymentAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export const checkPaymentStatus = async (sessionIdOrPaymentIntent) => {
  try {
    console.log('Checking payment status for:', sessionIdOrPaymentIntent);
    
    if (!sessionIdOrPaymentIntent) {
      throw new Error('Session ID or payment intent is required');
    }

    const response = await paymentAxios.get(
      `/api/payments/check-payment-status/${sessionIdOrPaymentIntent}`
    );
    
    console.log('Payment status response:', response.data);
    
    if (!response.data) {
      throw new Error('No response received from server');
    }

    // Check if we have a success response or a specific status
    if (response.data.success) {
      return {
        success: true,
        status: response.data.status,
        message: response.data.message,
        application: response.data.application,
        paymentDetails: {
          amount: response.data.amount,
          currency: response.data.currency,
          payment_date: response.data.payment_date,
          payment_intent_status: response.data.payment_intent_status,
          payment_method: response.data.payment_method
        }
      };
    }

    // Check specific Stripe statuses
    if (response.data.status === 'succeeded' || response.data.status === 'paid') {
      return {
        success: true,
        status: 'paid',
        message: 'Payment was processed successfully',
        application: response.data.application,
        paymentDetails: {
          amount: response.data.amount,
          currency: response.data.currency,
          payment_date: response.data.payment_date,
          payment_intent_status: response.data.payment_intent_status,
          payment_method: response.data.payment_method
        }
      };
    }

    if (response.data.status === 'processing' || response.data.status === 'pending') {
      return {
        success: true,
        status: 'pending',
        message: 'Payment is being processed',
        application: response.data.application,
        paymentDetails: {
          amount: response.data.amount,
          currency: response.data.currency,
          payment_date: response.data.payment_date,
          payment_intent_status: response.data.payment_intent_status,
          payment_method: response.data.payment_method
        }
      };
    }

    if (response.data.status === 'failed' || response.data.status === 'canceled') {
      throw new Error(response.data.message || 'Payment failed or was canceled');
    }

    // If we get here, we have an unexpected status
    throw new Error(response.data.message || 'Unexpected payment status');
  } catch (error) {
    console.error('Error in checkPaymentStatus:', error);
    
    if (error.response) {
      // Server responded with an error status
      const errorMessage = error.response.data?.message || 'Error checking payment';
      console.error('Server error:', errorMessage);
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from server');
      throw new Error('No response received from server. Please try again.');
    } else {
      // An error occurred while setting up the request
      console.error('Error setting up request:', error.message);
      throw new Error('An error occurred while checking payment. Please try again.');
    }
  }
};

export const initiatePayment = async (applicationId, amount, currency = 'MDL') => {
  try {
    const response = await paymentAxios.post('/api/payments/initiate', {
      applicationId,
      amount,
      currency
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error initiating payment');
    }

    return {
      sessionId: response.data.sessionId,
      paymentUrl: response.data.paymentUrl,
      expiresAt: response.data.expiresAt
    };
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw new Error(error.response?.data?.message || 'Could not initiate payment');
  }
};

export const getPaymentHistory = async (applicationId) => {
  try {
    const response = await paymentAxios.get(`/api/payments/history/${applicationId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error getting payment history');
    }

    return response.data.payments;
  } catch (error) {
    console.error('Error getting payment history:', error);
    throw new Error(error.response?.data?.message || 'Could not get payment history');
  }
};

export const refundPayment = async (paymentId, reason) => {
  try {
    const response = await paymentAxios.post(`/api/payments/${paymentId}/refund`, { reason });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error processing refund');
    }

    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error(error.response?.data?.message || 'Could not process refund');
  }
};

export const getPaymentMethods = async () => {
  try {
    const response = await paymentAxios.get('/api/payments/methods');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Error getting payment methods');
    }

    return response.data.methods;
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw new Error(error.response?.data?.message || 'Could not get payment methods');
  }
};

export const validatePaymentAmount = (amount, currency) => {
  if (!amount || amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }
  
  if (!currency || !['MDL', 'EUR', 'USD'].includes(currency)) {
    throw new Error('Currency must be MDL, EUR, or USD');
  }
  
  return true;
}; 