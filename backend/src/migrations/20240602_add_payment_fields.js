'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('applications', 'payment_status', {
      type: Sequelize.ENUM('unpaid', 'paid', 'failed'),
      defaultValue: 'unpaid',
      allowNull: false
    });

    await queryInterface.addColumn('applications', 'payment_id', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('applications', 'payment_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('applications', 'payment_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('applications', 'payment_currency', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('applications', 'is_paid', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('applications', 'payment_status');
    await queryInterface.removeColumn('applications', 'payment_id');
    await queryInterface.removeColumn('applications', 'payment_date');
    await queryInterface.removeColumn('applications', 'payment_amount');
    await queryInterface.removeColumn('applications', 'payment_currency');
    await queryInterface.removeColumn('applications', 'is_paid');
  }
}; 