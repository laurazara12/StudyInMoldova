const { Application, Program, User, Document, University, Notification, SavedProgram } = require('../models');
const { NOTIFICATION_TYPES } = require('../constants/notificationTypes');
const { Op } = require('sequelize');
const stripe = require('stripe');

exports.createApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { program_id, motivation_letter } = req.body;
    const document_ids = req.body['document_ids[]'] || [];

    console.log('Starting application creation:', {
      userId,
      program_id,
      document_ids,
      motivation_letter
    });

    // Check if the program exists
    const program = await Program.findByPk(program_id, {
      include: [{
        model: University,
        as: 'university'
      }]
    });

    if (!program) {
      console.log('Program not found:', program_id);
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    console.log('Program found:', {
      id: program.id,
      name: program.name,
      university: program.university?.name
    });

    // Check if user already has an application for this program
    const existingApplication = await Application.findOne({
      where: {
        user_id: userId,
        program_id: program_id,
        status: {
          [Op.notIn]: ['withdrawn', 'rejected']
        }
      }
    });

    if (existingApplication) {
      console.log('Existing application found:', {
        id: existingApplication.id,
        status: existingApplication.status
      });
      return res.status(400).json({
        success: false,
        message: 'Aveți deja o aplicație activă pentru acest program'
      });
    }

    // Create application
    const application = await Application.create({
      user_id: userId,
      program_id: program_id,
      university_id: program.university.id,
      motivation_letter: motivation_letter,
      status: 'draft',
      application_date: new Date()
    });

    console.log('Application created:', {
      id: application.id,
      status: application.status,
      university_id: application.university_id,
      application_date: application.application_date
    });

    // Associate documents if they exist
    if (document_ids.length > 0) {
      await application.setDocuments(document_ids);
      console.log('Documents associated:', document_ids);
    }

    // Get list of saved programs
    const savedPrograms = await SavedProgram.findAll({
      where: { user_id: userId },
      include: [{
        model: Program,
        as: 'program',
        include: [{
          model: University,
          as: 'university'
        }]
      }]
    });

    // Format saved programs list
    const formattedSavedPrograms = savedPrograms.map(sp => ({
      id: sp.program.id,
      name: sp.program.name,
      university: {
        id: sp.program.university.id,
        name: sp.program.university.name
      }
    }));

    console.log('Final response:', {
      applicationId: application.id,
      savedProgramsCount: formattedSavedPrograms.length
    });

    return res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: {
        application,
        savedPrograms: formattedSavedPrograms
      }
    });

  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the application'
    });
  }
};

exports.getUserApplications = async (req, res) => {
  try {
    console.log('=== getUserApplications ===');
    console.log('User from request:', req.user);
    console.log('User ID:', req.user.id);
    
    const user_id = req.user.id;

    console.log('Searching for applications for user_id:', user_id);

    const applications = await Application.findAll({
      where: { user_id },
      include: [
        {
          model: Program,
          as: 'program',
          include: [{
            model: University,
            as: 'university',
            attributes: ['id', 'name', 'location']
          }]
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'document_type', 'status', 'originalName', 'filename']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log('Applications found:', applications.length);

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error getting user applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving applications',
      error: error.message
    });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const application = await Application.findOne({
      where: { 
        id,
        user_id
      },
      include: [
        {
          model: Program,
          as: 'program',
          include: [{
            model: University,
            as: 'university',
            attributes: ['id', 'name', 'location']
          }]
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'document_type', 'status', 'originalName', 'filename']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error getting application:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving application',
      error: error.message
    });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: Program,
          as: 'program',
          include: [{
            model: University,
            as: 'university',
            attributes: ['id', 'name', 'location']
          }]
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'document_type', 'status', 'originalName', 'filename']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving applications',
      error: error.message
    });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { program_id, motivation_letter, document_ids, status, is_paid } = req.body;

    console.log('Updating application:', {
      id,
      user_id,
      program_id,
      motivation_letter,
      document_ids,
      status,
      is_paid
    });

    const application = await Application.findOne({
      where: { 
        id,
        user_id
      }
    });

    if (!application) {
      console.log('Application not found:', { id, user_id });
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update application
    const updateData = {
      program_id: program_id || application.program_id,
      motivation_letter: motivation_letter || application.motivation_letter,
      status: status || application.status,
      is_paid: is_paid !== undefined ? is_paid : application.is_paid
    };

    await application.update(updateData);

    // Update associated documents if they exist
    if (document_ids && Array.isArray(document_ids)) {
      await application.setDocuments(document_ids);
    }

    // Get updated application with all relationships
    const updatedApplication = await Application.findByPk(id, {
      include: [
        {
          model: Program,
          as: 'program',
          include: [{
            model: University,
            as: 'university',
            attributes: ['id', 'name', 'location']
          }]
        },
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'document_type', 'status', 'originalName', 'filename']
        }
      ]
    });

    console.log('Application updated successfully:', {
      id: updatedApplication.id,
      status: updatedApplication.status
    });

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
};

exports.cancelApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const application = await Application.findOne({
      where: { 
        id,
        user_id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Application cancelled successfully',
      data: application
    });
  } catch (error) {
    console.error('Error cancelling application:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling application',
      error: error.message
    });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const application = await Application.findOne({
      where: { 
        id,
        user_id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.update({ status: 'withdrawn' });

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application
    });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findByPk(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită'
      });
    }

    // Verificăm dacă se încearcă marcarea aplicației ca "submitted" fără plată
    if (status === 'submitted') {
      if (!application.is_paid || application.payment_status !== 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Nu puteți trimite aplicația fără a plăti taxa de aplicare'
        });
      }
    }

    // Actualizăm statusul aplicației
    await application.update({ 
      status,
      // Dacă aplicația este marcată ca "submitted", ne asigurăm că și statusul plății este corect
      ...(status === 'submitted' && {
        is_paid: true,
        payment_status: 'paid'
      })
    });

    res.json({
      success: true,
      message: 'Statusul aplicației a fost actualizat cu succes',
      data: application
    });
  } catch (error) {
    console.error('Eroare la actualizarea statusului aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea statusului aplicației',
      error: error.message
    });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const application = await Application.findOne({
      where: { 
        id,
        user_id
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application can be deleted (only in draft and not started)
    if (application.status !== 'draft' || application.submitted_at) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete this application as it has already been submitted'
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
      error: error.message
    });
  }
};

const verifyPayment = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session details:', {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      payment_intent_status: session.payment_intent?.status,
      metadata: session.metadata,
      customer: session.customer,
      amount_total: session.amount_total,
      currency: session.currency
    });

    const application = await Application.findByPk(session.metadata.application_id);
    console.log('Application found:', {
      id: application.id,
      status: application.status,
      payment_status: application.payment_status,
      payment_id: application.payment_id
    });

    const paymentVerification = {
      payment_status: session.payment_status,
      payment_intent_status: session.payment_intent?.status,
      session_status: session.status,
      isPaymentSuccessful: session.payment_status === 'paid' && session.payment_intent?.status === 'succeeded',
      amount_paid: session.amount_total,
      currency: session.currency
    };
    console.log('Payment verification:', paymentVerification);

    if (paymentVerification.isPaymentSuccessful) {
      console.log('Payment confirmed in Stripe');
      
      // Actualizăm aplicația doar dacă plata a fost confirmată
      await application.update({
        status: 'submitted',
        payment_status: 'paid',
        payment_id: session.payment_intent
      });

      const response = {
        success: true,
        status: 'paid',
        message: 'Plata a fost procesată cu succes și aplicația a fost trimisă',
        application: application,
        paymentDetails: {
          amount: session.amount_total / 100,
          currency: session.currency,
          payment_date: new Date(),
          payment_method: 'card',
          status: session.payment_status,
          payment_intent_status: session.payment_intent?.status
        }
      };
      console.log('Sending response:', response);
      return response;
    } else {
      console.log('Payment not confirmed in Stripe');
      return {
        success: false,
        status: session.payment_status,
        message: 'Plata nu a fost confirmată. Vă rugăm să încercați din nou.',
        application: application
      };
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}; 