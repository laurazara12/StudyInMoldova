const { Application, User, Program } = require('../models');

const applicationsController = {
  // Obține toate aplicațiile (filtrate în funcție de rol)
  getAll: async (req, res) => {
    try {
      const { userId, userRole } = req;
      
      console.log('Cerere pentru aplicații:', { userId, userRole });
      
      let whereClause = {};
      
      // Dacă utilizatorul este student, vede doar aplicațiile sale
      if (userRole === 'student') {
        whereClause.userId = userId;
        console.log('Filtrare aplicații pentru student:', whereClause);
      } else {
        console.log('Acces complet pentru admin');
      }

      const applications = await Application.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Program,
            attributes: ['id', 'name', 'university', 'faculty', 'degree']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      console.log(`Găsite ${applications.length} aplicații`);

      res.json({
        success: true,
        data: applications,
        meta: {
          total: applications.length,
          role: userRole,
          userId: userId
        }
      });
    } catch (error) {
      console.error('Eroare la obținerea aplicațiilor:', error);
      res.status(500).json({
        success: false,
        message: 'Eroare la obținerea aplicațiilor.'
      });
    }
  },

  // Obține o aplicație specifică
  getOne: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, userRole } = req;

      let whereClause = { id };
      
      // Dacă utilizatorul este student, poate vedea doar aplicațiile sale
      if (userRole === 'student') {
        whereClause.userId = userId;
      }

      const application = await Application.findOne({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Program,
            attributes: ['id', 'name', 'university', 'faculty', 'degree']
          }
        ]
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Aplicația nu a fost găsită.'
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
        message: 'Eroare la obținerea aplicației.'
      });
    }
  },

  // Restul metodelor rămân neschimbate...
};

module.exports = applicationsController; 