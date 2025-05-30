const { Application, Program, User, Document, University, Notification, SavedProgram } = require('../models');
const { NOTIFICATION_TYPES } = require('../constants/notificationTypes');
const { Op } = require('sequelize');

exports.createApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { program_id, motivation_letter } = req.body;
    const document_ids = req.body['document_ids[]'] || [];

    console.log('Începe crearea aplicației:', {
      userId,
      program_id,
      document_ids,
      motivation_letter
    });

    // Verificăm dacă programul există
    const program = await Program.findByPk(program_id, {
      include: [{
        model: University,
        as: 'university'
      }]
    });

    if (!program) {
      console.log('Programul nu a fost găsit:', program_id);
      return res.status(404).json({
        success: false,
        message: 'Programul nu a fost găsit'
      });
    }

    console.log('Program găsit:', {
      id: program.id,
      name: program.name,
      university: program.university?.name
    });

    // Verificăm dacă utilizatorul are deja o aplicație pentru acest program
    const existingApplication = await Application.findOne({
      where: {
        user_id: userId,
        program_id: program_id
      }
    });

    if (existingApplication) {
      console.log('Aplicație existentă găsită:', {
        id: existingApplication.id,
        status: existingApplication.status
      });
      return res.status(400).json({
        success: false,
        message: 'Aveți deja o aplicație pentru acest program'
      });
    }

    // Creăm aplicația
    const application = await Application.create({
      user_id: userId,
      program_id: program_id,
      university_id: program.university.id,
      motivation_letter: motivation_letter,
      status: 'draft',
      application_date: new Date()
    });

    console.log('Aplicație creată:', {
      id: application.id,
      status: application.status,
      university_id: application.university_id,
      application_date: application.application_date
    });

    // Asociem documentele dacă există
    if (document_ids.length > 0) {
      await application.setDocuments(document_ids);
      console.log('Documente asociate:', document_ids);
    }

    // Obținem lista de programe salvate
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

    // Formatăm lista de programe salvate
    const formattedSavedPrograms = savedPrograms.map(sp => ({
      id: sp.program.id,
      name: sp.program.name,
      university: {
        id: sp.program.university.id,
        name: sp.program.university.name
      }
    }));

    console.log('Răspuns final:', {
      applicationId: application.id,
      savedProgramsCount: formattedSavedPrograms.length
    });

    return res.status(201).json({
      success: true,
      message: 'Aplicația a fost creată cu succes',
      data: {
        application,
        savedPrograms: formattedSavedPrograms
      }
    });

  } catch (error) {
    console.error('Eroare la crearea aplicației:', error);
    return res.status(500).json({
      success: false,
      message: 'A apărut o eroare la crearea aplicației'
    });
  }
};

exports.getUserApplications = async (req, res) => {
  try {
    console.log('=== getUserApplications ===');
    console.log('User din request:', req.user);
    console.log('User ID:', req.user.id);
    
    const user_id = req.user.id;

    console.log('Căutăm aplicații pentru user_id:', user_id);

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

    console.log('Aplicații găsite:', applications.length);

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Eroare la obținerea aplicațiilor utilizatorului:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea aplicațiilor',
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
        message: 'Aplicația nu a fost găsită'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Eroare la obținerea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea aplicației',
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
    console.error('Eroare la obținerea aplicațiilor:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la obținerea aplicațiilor',
      error: error.message
    });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { program_id, motivation_letter, document_ids, status, is_paid } = req.body;

    console.log('Actualizare aplicație:', {
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
      console.log('Aplicație negăsită:', { id, user_id });
      return res.status(404).json({
        success: false,
        message: 'Aplicația nu a fost găsită'
      });
    }

    // Actualizăm aplicația
    const updateData = {
      program_id: program_id || application.program_id,
      motivation_letter: motivation_letter || application.motivation_letter,
      status: status || application.status,
      is_paid: is_paid !== undefined ? is_paid : application.is_paid
    };

    await application.update(updateData);

    // Actualizăm documentele asociate dacă există
    if (document_ids && Array.isArray(document_ids)) {
      await application.setDocuments(document_ids);
    }

    // Obținem aplicația actualizată cu toate relațiile
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

    console.log('Aplicație actualizată cu succes:', {
      id: updatedApplication.id,
      status: updatedApplication.status
    });

    res.json({
      success: true,
      message: 'Aplicația a fost actualizată cu succes',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Eroare la actualizarea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la actualizarea aplicației',
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
        message: 'Aplicația nu a fost găsită'
      });
    }

    await application.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Aplicația a fost anulată cu succes',
      data: application
    });
  } catch (error) {
    console.error('Eroare la anularea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la anularea aplicației',
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
        message: 'Aplicația nu a fost găsită'
      });
    }

    await application.update({ status: 'withdrawn' });

    res.json({
      success: true,
      message: 'Aplicația a fost retrasă cu succes',
      data: application
    });
  } catch (error) {
    console.error('Eroare la retragerea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la retragerea aplicației',
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

    await application.update({ status });

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
        message: 'Aplicația nu a fost găsită'
      });
    }

    // Verificăm dacă aplicația poate fi ștearsă (doar în draft și neîncepută)
    if (application.status !== 'draft' || application.submitted_at) {
      return res.status(400).json({
        success: false,
        message: 'Nu puteți șterge această aplicație deoarece a fost deja trimisă'
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Aplicația a fost ștearsă cu succes'
    });
  } catch (error) {
    console.error('Eroare la ștergerea aplicației:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare la ștergerea aplicației',
      error: error.message
    });
  }
}; 