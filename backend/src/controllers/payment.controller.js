const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});
const { Application } = require('../models');

// Crearea unui payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const amount = 3000; // 30 EUR în bani (Stripe folosește cea mai mică unitate)

    // Verificăm dacă aplicația există și aparține utilizatorului
    const application = await Application.findOne({
      where: {
        id: applicationId,
        user_id: req.user.id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită'
      });
    }

    // Creăm payment intent în Stripe
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
    console.error('Eroare la crearea payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare la procesarea plății'
    });
  }
};

// Confirmarea plății
const confirmPayment = async (req, res) => {
  try {
    const { paymentMethodId, applicationId } = req.body;

    console.log('Începe confirmarea plății pentru:', { paymentMethodId, applicationId });

    // Verificăm dacă aplicația există și aparține utilizatorului
    const application = await Application.findOne({
      where: {
        id: applicationId,
        user_id: req.user.id
      }
    });

    if (!application) {
      console.error('Aplicație negăsită:', { applicationId, userId: req.user.id });
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită'
      });
    }

    console.log('Aplicație găsită:', {
      id: application.id,
      status: application.status,
      payment_status: application.payment_status
    });

    // Confirmăm plata în Stripe
    const paymentIntent = await stripe.paymentIntents.confirm(paymentMethodId);
    console.log('Payment Intent confirmat:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount
    });

    if (paymentIntent.status === 'succeeded') {
      // Actualizăm statusul aplicației
      const updateData = {
        status: 'submitted',
        payment_status: 'paid',
        payment_id: paymentIntent.id,
        application_date: new Date()
      };

      console.log('Actualizare aplicație cu datele:', updateData);
      
      try {
        const updatedApplication = await application.update(updateData);
        console.log('Aplicație actualizată:', {
          id: updatedApplication.id,
          status: updatedApplication.status,
          payment_status: updatedApplication.payment_status,
          payment_id: updatedApplication.payment_id,
          application_date: updatedApplication.application_date
        });

        res.json({
          success: true,
          message: 'Plata a fost procesată cu succes',
          application: updatedApplication
        });
      } catch (error) {
        console.error('Eroare la actualizarea aplicației:', error);
        res.status(500).json({
          success: false,
          message: 'Eroare la actualizarea statusului aplicației',
          error: error.message
        });
      }
    } else {
      console.log('Plata nu a fost procesată cu succes:', paymentIntent.status);
      res.status(400).json({
        success: false,
        message: 'Plata nu a putut fi procesată',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Eroare la confirmarea plății:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare la procesarea plății',
      error: error.message
    });
  }
};

// Verificarea plății
const verifyPayment = async (req, res) => {
  try {
    const { paymentMethodId, applicationId } = req.body;

    if (!paymentMethodId || !applicationId) {
      return res.status(400).json({
        success: false,
        message: 'ID-ul metodei de plată și ID-ul aplicației sunt obligatorii'
      });
    }

    // Verificăm statusul plății
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentMethodId);

    if (paymentIntent.status === 'succeeded') {
      return res.json({
        success: true,
        message: 'Plata a fost verificată cu succes'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Plata nu a fost procesată cu succes'
      });
    }
  } catch (error) {
    console.error('Eroare la verificarea plății:', error);
    return res.status(500).json({
      success: false,
      message: 'A apărut o eroare la verificarea plății'
    });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  verifyPayment
}; 