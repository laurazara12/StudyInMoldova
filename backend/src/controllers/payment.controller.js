const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});
const { Application } = require('../models');

// Create a payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const amount = 3000; // 30 EUR in cents (Stripe uses the smallest unit)

    // Check if the application exists and belongs to the user
    const application = await Application.findOne({
      where: {
        id: applicationId,
        user_id: req.user.id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Create payment intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        applicationId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the payment'
    });
  }
};

// Confirm payment
const confirmPayment = async (req, res) => {
  try {
    const { paymentMethodId, applicationId } = req.body;

    console.log('Starting payment confirmation for:', { paymentMethodId, applicationId });

    // Check if the application exists and belongs to the user
    const application = await Application.findOne({
      where: {
        id: applicationId,
        user_id: req.user.id
      }
    });

    if (!application) {
      console.error('Application not found:', { applicationId, userId: req.user.id });
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    console.log('Application found:', {
      id: application.id,
      status: application.status,
      payment_status: application.payment_status
    });

    // Confirm payment in Stripe
    const paymentIntent = await stripe.paymentIntents.confirm(paymentMethodId);
    console.log('Payment Intent confirmed:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount
    });

    if (paymentIntent.status === 'succeeded') {
      // Update application status
      const updateData = {
        status: 'submitted',
        payment_status: 'paid',
        payment_id: paymentIntent.id,
        application_date: new Date()
      };

      console.log('Updating application with data:', updateData);
      
      try {
        const updatedApplication = await application.update(updateData);
        console.log('Application updated:', {
          id: updatedApplication.id,
          status: updatedApplication.status,
          payment_status: updatedApplication.payment_status,
          payment_id: updatedApplication.payment_id,
          application_date: updatedApplication.application_date
        });

        res.json({
          success: true,
          message: 'Payment processed successfully',
          application: updatedApplication
        });
      } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({
          success: false,
          message: 'Error updating application status',
          error: error.message
        });
      }
    } else {
      console.log('Payment not processed successfully:', paymentIntent.status);
      res.status(400).json({
        success: false,
        message: 'Payment could not be processed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the payment',
      error: error.message
    });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { paymentMethodId, applicationId } = req.body;

    if (!paymentMethodId || !applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method ID and application ID are required'
      });
    }

    // Check payment status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentMethodId);

    if (paymentIntent.status === 'succeeded') {
      return res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment was not processed successfully'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while verifying the payment'
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  verifyPayment
}; 