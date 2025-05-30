const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Application, Program } = require('../models');

const YOUR_DOMAIN = process.env.NODE_ENV === 'production' 
  ? 'https://' + process.env.FRONTEND_URL 
  : 'http://localhost:3000';

const createCheckoutSession = async (req, res) => {
  try {
    const { program_id, motivation_letter, document_ids } = req.body;
    const userId = req.user.id;

    console.log('Începe crearea sesiunii de checkout pentru:', { program_id, userId });

    if (!program_id || !motivation_letter || !document_ids) {
      console.log('Câmpuri lipsă:', { program_id, motivation_letter, document_ids });
      return res.status(400).json({
        success: false,
        message: 'Toate câmpurile sunt obligatorii'
      });
    }

    // Verificăm dacă programul există
    const program = await Program.findByPk(program_id);
    if (!program) {
      console.log('Program negăsit:', program_id);
      return res.status(404).json({
        success: false,
        message: 'Programul nu a fost găsit'
      });
    }

    // Verificăm dacă există deja o aplicație pentru acest program
    const existingApplication = await Application.findOne({
      where: {
        user_id: userId,
        program_id: program_id,
        status: ['submitted', 'under_review', 'accepted']
      }
    });

    if (existingApplication) {
      console.log('Aplicație existentă găsită:', existingApplication.id);
      return res.status(400).json({
        success: false,
        message: 'Aveți deja o aplicație activă pentru acest program'
      });
    }

    // Creăm aplicația în starea draft
    const application = await Application.create({
      program_id,
      university_id: program.university_id,
      user_id: userId,
      motivation_letter,
      document_ids: JSON.stringify(document_ids),
      status: 'draft',
      payment_status: 'unpaid'
    });

    console.log('Aplicație creată:', application.id);

    // Creăm sesiunea de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: 'Taxă de aplicare',
              description: `Taxă pentru procesarea aplicației la ${program.name}`
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

    console.log('Sesiune Stripe creată:', session.id);

    res.json({
      success: true,
      url: session.url,
      session_id: session.id
    });
  } catch (error) {
    console.error('Eroare la crearea sesiunii de checkout:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare la procesarea plății. Vă rugăm să încercați din nou.'
    });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      console.error('Session ID lipsă');
      return res.status(400).json({
        success: false,
        message: 'Session ID este obligatoriu'
      });
    }

    console.log('Verificare status plată pentru sesiunea:', session_id);

    // Verificăm statusul sesiunii în Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log('Sesiune Stripe găsită:', {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      metadata: session.metadata
    });

    if (!session) {
      console.error('Sesiune Stripe negăsită:', session_id);
      return res.status(404).json({
        success: false,
        message: 'Sesiunea de plată nu a fost găsită'
      });
    }

    // Verificăm metadata sesiunii
    if (!session.metadata || !session.metadata.application_id || !session.metadata.user_id) {
      console.error('Metadata invalidă pentru sesiunea:', session_id);
      return res.status(400).json({
        success: false,
        message: 'Metadata sesiunii este invalidă'
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
      console.error('Aplicație negăsită pentru sesiunea:', session_id);
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită'
      });
    }

    console.log('Aplicație găsită:', {
      id: application.id,
      status: application.status,
      payment_status: application.payment_status,
      payment_id: application.payment_id
    });

    if (session.payment_status === 'paid') {
      console.log('Statusul sesiunii Stripe este paid');
      
      if (!session.payment_intent) {
        console.error('Payment intent lipsă pentru sesiunea plătită:', session_id);
        return res.status(400).json({
          success: false,
          message: 'Payment intent lipsă pentru sesiunea plătită'
        });
      }

      // Actualizăm statusul aplicației
      const updateData = {
        status: 'submitted',
        payment_status: 'paid',
        payment_id: session.payment_intent,
        application_date: new Date()
      };

      console.log('Actualizare aplicație cu datele:', updateData);
      
      try {
        // Verificăm dacă aplicația există și nu este deja plătită
        const existingApplication = await Application.findOne({
          where: {
            id: session.metadata.application_id,
            user_id: session.metadata.user_id,
            payment_status: 'paid'
          }
        });

        if (existingApplication) {
          console.log('Aplicația este deja plătită:', existingApplication.id);
          return res.json({
            success: true,
            status: 'paid',
            application: existingApplication
          });
        }

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
          status: 'paid',
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
      console.log('Statusul sesiunii Stripe nu este paid:', session.payment_status);
      // Dacă plata nu a fost procesată, aplicația rămâne în starea draft
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
    console.error('Eroare la verificarea statusului plății:', error);
    res.status(500).json({
      success: false,
      message: 'A apărut o eroare la verificarea statusului plății',
      error: error.message
    });
  }
};

module.exports = {
  createCheckoutSession,
  checkPaymentStatus
}; 