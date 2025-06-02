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

    // Verificăm dacă avem o aplicație existentă
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
          message: 'Aplicația nu a fost găsită'
        });
      }

      if (application.status === 'withdrawn') {
        console.log('Cannot process payment for withdrawn application:', application_id);
        return res.status(400).json({
          success: false,
          message: 'Nu se poate procesa plata pentru o aplicație retrasă'
        });
      }

      if (application.is_paid) {
        console.log('Application already paid:', application_id);
        return res.status(400).json({
          success: false,
          message: 'Această aplicație a fost deja plătită'
        });
      }
    } else {
      // Dacă nu avem o aplicație existentă, verificăm dacă avem toate câmpurile necesare
      if (!program_id || !motivation_letter || !document_ids) {
        console.log('Missing fields:', { program_id, motivation_letter, document_ids });
        return res.status(400).json({
          success: false,
          message: 'Toate câmpurile sunt obligatorii'
        });
      }

      // Check if the program exists
      const program = await Program.findByPk(program_id);
      if (!program) {
        console.log('Program not found:', program_id);
        return res.status(404).json({
          success: false,
          message: 'Programul nu a fost găsit'
        });
      }

      // Verificăm dacă există deja o aplicație activă pentru acest program
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
        console.log('Active application already exists for this program:', program_id);
        return res.status(400).json({
          success: false,
          message: 'Aveți deja o aplicație activă pentru acest program. Trebuie să retrageți aplicația anterioară înainte de a aplica din nou.'
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
                description: `Taxă pentru procesarea aplicației`
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

      // Verificăm dacă sesiunea a fost creată cu succes
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
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare la procesarea plății. Vă rugăm să încercați din nou.',
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

    // Verificăm sesiunea în Stripe
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

    // Verificăm metadata sesiunii
    if (!session.metadata?.application_id || !session.metadata?.user_id) {
      console.error('Invalid metadata for session:', sessionId);
      return res.status(400).json({
        success: false,
        message: 'Session metadata is invalid'
      });
    }

    // Găsim aplicația asociată
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
        message: 'Nu se poate actualiza statusul plății pentru o aplicație retrasă'
      });
    }

    console.log('Application found:', {
      id: application.id,
      status: application.status,
      payment_status: application.payment_status,
      payment_id: application.payment_id
    });

    // Verificăm dacă aplicația este deja plătită
    if (application.payment_status === 'paid' && application.is_paid) {
      console.log('Application is already paid:', application.id);
      return res.json({
        success: true,
        status: 'paid',
        application
      });
    }

    // Verificăm statusul plății în Stripe
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
        // Actualizăm statusul plății și aplicației doar dacă plata este confirmată
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
        
        // Verificăm dacă actualizarea a fost reușită
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
          message: 'Plata a fost procesată cu succes și aplicația a fost trimisă',
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
        // Resetăm aplicația la starea draft în caz de eroare
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
      
      // Dacă plata nu a fost procesată, aplicația rămâne în starea draft și unpaid
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
          message: 'Plata nu a fost confirmată. Aplicația a fost resetată la starea draft.',
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
    console.error('Error checking payment status:', error);
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

    // Verificăm dacă aplicația există și aparține utilizatorului
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

    // Verificăm dacă aplicația poate fi retrasă
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

    // Actualizăm statusul aplicației
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