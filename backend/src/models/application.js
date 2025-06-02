const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    university_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    motivation_letter: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'),
      defaultValue: 'draft'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    application_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    payment_status: {
      type: DataTypes.ENUM('unpaid', 'paid', 'failed'),
      defaultValue: 'unpaid'
    },
    payment_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    payment_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    payment_currency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'applications',
    timestamps: true,
    underscored: true
  });

  Application.associate = (models) => {
    Application.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Application.belongsTo(models.Program, {
      foreignKey: 'program_id',
      as: 'program'
    });
    Application.belongsTo(models.University, {
      foreignKey: 'university_id',
      as: 'university'
    });
    Application.belongsToMany(models.Document, {
      through: 'application_documents',
      foreignKey: 'application_id',
      otherKey: 'document_id',
      as: 'documents'
    });
  };

  return Application;
}; 