const programsRouter = require('./programRoutes');
const savedProgramRoutes = require('./savedProgramRoutes');
const authRouter = require('./auth');
const documentsRouter = require('./documents');
const universitiesRouter = require('./universities');
const notificationRoutes = require('./notificationRoutes');
const applicationsRouter = require('./applications');
const helpYouChooseRoutes = require('./helpYouChooseRoutes');
const paymentRoutes = require('./payment.routes');

const setupRoutes = (app) => {
  // Rute API
  app.use('/api/programs', programsRouter);
  app.use('/api/saved-programs', savedProgramRoutes);
  app.use('/api/auth', authRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/universities', universitiesRouter);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/help-you-choose', helpYouChooseRoutes);
  app.use('/api/payments', paymentRoutes);

  // Logging pentru rute înregistrate
  console.log('Registered API routes:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          console.log(`${Object.keys(handler.route.methods).join(', ').toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  });
};

module.exports = { setupRoutes }; 