const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Application, Program } = require('../models');

const YOUR_DOMAIN = process.env.NODE_ENV === 'production' 
  ? 'https://' + process.env.FRONTEND_URL 
  : 'http://localhost:3000';

const createCheckoutSession = async (req, res) => {
  try {
    const { program_id, motivation_letter, document_ids } = req.body;
    const userId = req.user.id;

    console.log('Starting checkout session creation for:', { program_id, userId });

    if (!program_id || !motivation_letter || !document_ids) {
      console.log('Missing fields:', { program_id, motivation_letter, document_ids });
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

    // Check if there's already an application for this program
    const existingApplication = await Application.findOne({
      where: {
        user_id: userId,
        program_id: program_id,
        status: ['submitted', 'under_review', 'accepted']
      }
    });

    if (existingApplication) {
      console.log('Existing application found:', existingApplication.id);
      return res.status(400).json({
        success: false,
        message: 'You already have an active application for this program'
      });
    }

    // Create application in draft state
    const application = await Application.create({
      program_id,
      university_id: program.university_id,
      user_id: userId,
      motivation_letter,
      document_ids: JSON.stringify(document_ids),
      status: 'draft',
      payment_status: 'unpaid'
    });

    console.log('Application created:', application.id);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: 'Application Fee',
              description: `Fee for processing application to ${program.name}`
            },
            unit_amount: 1000, // 10.00 RON
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/profile`,
      metadata: {
        application_id: application.id,
        user_id: userId,
        program_id: program_id
      },
      customer_email: req.user.email,
      billing_address_collection: 'required',
      locale: 'ro'
    });

    console.log('Stripe session created:', session.id);

    res.json({
      success: true,
      url: session.url,
      session_id: session.id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the payment. Please try again.'
    });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      console.error('Missing Session ID');
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    console.log('Checking payment status for session:', session_id);

    // Check session status in Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log('Stripe session found:', {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      metadata: session.metadata
    });

    if (!session) {
      console.error('Stripe session not found:', session_id);
      return res.status(404).json({
        success: false,
        message: 'Payment session not found'
      });
    }

    // Check session metadata
    if (!session.metadata || !session.metadata.application_id || !session.metadata.user_id) {
      console.error('Invalid metadata for session:', session_id);
      return res.status(400).json({
        success: false,
        message: 'Session metadata is invalid'
      });
    }

    // Find associated application
    const application = await Application.findOne({
      where: {
        id: session.metadata.application_id,
        user_id: session.metadata.user_id
      }
    });

    if (!application) {
      console.error('Application not found for session:', session_id);
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    console.log('Application found:', {
      id: application.id,
      status: application.status,
      payment_status: application.payment_status,
      payment_id: application.payment_id
    });

    if (session.payment_status === 'paid') {
      console.log('Stripe session status is paid');
      
      if (!session.payment_intent) {
        console.error('Missing payment intent for paid session:', session_id);
        return res.status(400).json({
          success: false,
          message: 'Missing payment intent for paid session'
        });
      }

      // Update application status
      const updateData = {
        status: 'submitted',
        payment_status: 'paid',
        payment_id: session.payment_intent,
        application_date: new Date()
      };

      console.log('Updating application with data:', updateData);
      
      try {
        // Check if application exists and is not already paid
        const existingApplication = await Application.findOne({
          where: {
            id: session.metadata.application_id,
            user_id: session.metadata.user_id,
            payment_status: 'paid'
          }
        });

        if (existingApplication) {
          console.log('Application is already paid:', existingApplication.id);
          return res.json({
            success: true,
            status: 'paid',
            application: existingApplication
          });
        }

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
          status: 'paid',
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
      console.log('Stripe session status is not paid:', session.payment_status);
      // If payment was not processed, application remains in draft state
      await application.update({
        status: 'draft',
        payment_status: 'unpaid'
      });

      res.json({
        success: true,
        status: session.payment_status,
        application
      });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while checking payment status',
      error: error.message
    });
  }
};

module.exports = {
  createCheckoutSession,
  checkPaymentStatus
}; 