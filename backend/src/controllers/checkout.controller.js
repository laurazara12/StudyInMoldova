const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Application, Program } = require('../models');
const { Op } = require('sequelize');

const YOUR_DOMAIN = process.env.NODE_ENV === 'production' 
  ? 'https://' + process.env.FRONTEND_URL 
  : 'http://localhost:3000';

const createCheckoutSession = async (req, res) => {
  try {
    const { application_id, program_id, motivation_letter, document_ids } = req.body;
    const userId = req.user.id;

    console.log('Starting checkout session creation for:', { application_id, program_id, userId });

    // Check if we have an existing application
    let application;
    if (application_id) {
      application = await Application.findOne({
        where: {
          id: application_id,
          user_id: userId
        }
      });

      if (!application) {
        console.log('Application not found:', application_id);
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      if (application.status === 'withdrawn') {
        console.log('Cannot process payment for a withdrawn application:', application_id);
        return res.status(400).json({
          success: false,
          message: 'Cannot process payment for a withdrawn application'
        });
      }

      if (application.is_paid) {
        console.log('This application has already been paid:', application_id);
        return res.status(400).json({
          success: false,
          message: 'This application has already been paid'
        });
      }
    } else {
      // If we don't have an existing application, check if we have all required fields
      if (!program_id || !motivation_letter || !document_ids) {
        console.log('All fields are required:', { program_id, motivation_letter, document_ids });
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if the program exists
      const program = await Program.findByPk(program_id);
      if (!program) {
        console.log('Program not found:', program_id);
        return res.status(404).json({
          success: false,
          message: 'Program not found'
        });
      }

      // Check if there is already an active application for this program
      const existingApplication = await Application.findOne({
        where: {
          program_id,
          user_id: userId,
          status: {
            [Op.notIn]: ['withdrawn', 'rejected']
          }
        }
      });

      if (existingApplication) {
        console.log('You already have an active application for this program. You need to withdraw the previous application before applying again.', program_id);
        return res.status(400).json({
          success: false,
          message: 'You already have an active application for this program. You need to withdraw the previous application before applying again.'
        });
      }

      // Create application in draft state
      application = await Application.create({
        program_id,
        university_id: program.university_id,
        user_id: userId,
        motivation_letter,
        document_ids: JSON.stringify(document_ids),
        status: 'draft',
        payment_status: 'unpaid'
      });

      console.log('Application created:', application.id);
    }

    // Create checkout session
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Application Fee',
                description: `Application processing fee`
              },
              unit_amount: 3000, // 30.00 EUR
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/profile`,
        metadata: {
          application_id: application.id,
          user_id: userId,
          program_id: application.program_id
        },
        customer_email: req.user.email,
        billing_address_collection: 'required',
        locale: 'ro'
      });

      if (!session || !session.id) {
        throw new Error('Invalid session response from Stripe');
      }

      console.log('Stripe session created:', session.id);

      // Check if the session was created successfully
      const retrievedSession = await stripe.checkout.sessions.retrieve(session.id);
      if (!retrievedSession) {
        throw new Error('Could not verify session creation');
      }

      res.json({
        success: true,
        url: session.url,
        session_id: session.id
      });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      throw new Error(`Stripe error: ${stripeError.message}`);
    }
  } catch (error) {
    console.error('An error occurred while processing the payment. Please try again.', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the payment. Please try again.',
      error: error.message
    });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const sessionId = req.params.session_id;

    if (!sessionId) {
      console.error('Missing Session ID');
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    console.log('Checking payment status for session:', sessionId);

    // Check the session in Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer', 'line_items']
    });

    if (!session) {
      console.error('Stripe session not found:', sessionId);
      return res.status(404).json({
        success: false,
        message: 'Payment session not found'
      });
    }

    console.log('Stripe session details:', {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent?.id,
      payment_intent_status: session.payment_intent?.status,
      metadata: session.metadata,
      customer: session.customer?.id,
      amount_total: session.amount_total,
      currency: session.currency
    });

    // Check session metadata
    if (!session.metadata?.application_id || !session.metadata?.user_id) {
      console.error('Invalid metadata for session:', sessionId);
      return res.status(400).json({
        success: false,
        message: 'Session metadata is invalid'
      });
    }

    // Find the associated application
    const application = await Application.findOne({
      where: {
        id: session.metadata.application_id,
        user_id: session.metadata.user_id
      }
    });

    if (!application) {
      console.error('Application not found for session:', sessionId);
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status === 'withdrawn') {
      console.log('Cannot update payment status for withdrawn application:', application.id);
      return res.status(400).json({
        success: false,
        message: 'Cannot update payment status for a withdrawn application'
      });
    }

    console.log('Application found:', {
      id: application.id,
      status: application.status,
      payment_status: application.payment_status,
      payment_id: application.payment_id
    });

    // Check if the application is already paid
    if (application.payment_status === 'paid' && application.is_paid) {
      console.log('Application is already paid:', application.id);
      return res.json({
        success: true,
        status: 'paid',
        application
      });
    }

    // Check payment status in Stripe
    const isPaymentSuccessful = session.payment_status === 'paid' && 
                              session.payment_intent?.status === 'succeeded' &&
                              session.status === 'complete';

    console.log('Payment verification:', {
      payment_status: session.payment_status,
      payment_intent_status: session.payment_intent?.status,
      session_status: session.status,
      isPaymentSuccessful,
      amount_paid: session.amount_total,
      currency: session.currency
    });

    if (isPaymentSuccessful) {
      console.log('Payment confirmed in Stripe');
      
      try {
        // Update payment status and application only if payment is confirmed
        const updateData = {
          payment_status: 'paid',
          payment_id: session.payment_intent.id,
          payment_date: new Date(),
          payment_amount: session.amount_total / 100,
          payment_currency: session.currency,
          is_paid: true,
          status: 'submitted',
          application_date: new Date()
        };
        
        console.log('Attempting to update application with data:', updateData);
        
        await application.update(updateData);
        console.log('Update completed, reloading application...');
        
        await application.reload();
        console.log('Application after reload:', application.toJSON());
        
        // Verify update was successful
        if (!application.is_paid || application.payment_status !== 'paid') {
          console.error('Update verification failed:', {
            is_paid: application.is_paid,
            payment_status: application.payment_status
          });
          throw new Error('Failed to update payment status');
        }
        
        const responseData = {
          success: true,
          status: 'paid',
          message: 'Payment processed successfully and application submitted',
          application: application.toJSON(),
          paymentDetails: {
            amount: session.amount_total / 100,
            currency: session.currency,
            payment_date: new Date(),
            payment_method: session.payment_method_types?.[0] || 'card',
            status: session.payment_status,
            payment_intent_status: session.payment_intent?.status
          }
        };

        console.log('Sending response:', responseData);
        return res.json(responseData);
      } catch (updateError) {
        console.error('Error updating application:', updateError);
        // Reset application to draft state in case of error
        await application.update({
          status: 'draft',
          payment_status: 'unpaid',
          is_paid: false,
          payment_id: null,
          payment_date: null,
          payment_amount: null,
          payment_currency: null
        });
        throw new Error(`Failed to update application: ${updateError.message}`);
      }
    } else {
      console.log('Payment not confirmed:', {
        payment_status: session.payment_status,
        payment_intent_status: session.payment_intent?.status
      });
      
      // If payment was not processed, application remains in draft and unpaid
      const updateData = {
        status: 'draft',
        payment_status: 'unpaid',
        is_paid: false,
        payment_id: null,
        payment_date: null,
        payment_amount: null,
        payment_currency: null
      };

      try {
        await application.update(updateData);
        console.log('Application reset to draft state:', application.toJSON());

        return res.json({
          success: false,
          status: session.payment_status || 'pending',
          message: 'Payment not confirmed. Application reset to draft state.',
          application: application.toJSON(),
          payment_details: {
            status: session.payment_status,
            payment_intent_status: session.payment_intent?.status
          }
        });
      } catch (updateError) {
        console.error('Error resetting application:', updateError);
        throw new Error(`Failed to reset application: ${updateError.message}`);
      }
    }
  } catch (error) {
    console.error('An error occurred while checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while checking payment status',
      error: error.message
    });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    const userId = req.user.id;

    console.log('Începe retragerea aplicației:', { application_id, userId });

    // Check if the application exists and belongs to the user
    const application = await Application.findOne({
      where: {
        id: application_id,
        user_id: userId
      }
    });

    if (!application) {
      console.log('Aplicație negăsită:', application_id);
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită'
      });
    }

    // Check if the application can be withdrawn
    if (application.status === 'withdrawn') {
      console.log('Aplicația este deja retrasă:', application_id);
      return res.status(400).json({
        success: false,
        message: 'Aplicația a fost deja retrasă'
      });
    }

    if (application.status === 'approved') {
      console.log('Nu se poate retrage o aplicație aprobată:', application_id);
      return res.status(400).json({
        success: false,
        message: 'Nu se poate retrage o aplicație care a fost deja aprobată'
      });
    }

    // Update application status
    const updateData = {
      status: 'withdrawn',
      withdrawn_date: new Date()
    };

    console.log('Actualizare aplicație cu datele:', updateData);
    
    await application.update(updateData);
    await application.reload();

    console.log('Aplicație actualizată cu succes:', application.toJSON());

    res.json({
      success: true,
      message: 'Aplicația a fost retrasă cu succes',
      application: application.toJSON()
    });

  } catch (error) {
    console.error('Eroare la retragerea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare la retragerea aplicației',
      error: error.message
    });
  }
};

module.exports = {
  createCheckoutSession,
  checkPaymentStatus,
  withdrawApplication
}; 