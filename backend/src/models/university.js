const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const University = sequelize.define('University', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    acronym: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tuition_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    programs: {
      type: DataTypes.JSON,
      allowNull: true
    },
    contact_info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: true,
    tableName: 'universities',
    underscored: true
  });

  University.associate = (models) => {
    University.hasMany(models.Program, {
      foreignKey: 'university_id',
      as: 'Programs'
    });
  };

  // Funcție pentru generarea slug-ului
  const generateSlug = (name) => {
    const nameMappings = {
      'universitatea de stat din moldova': 'usm',
      'usm': 'usm',
      'universitatea tehnica a moldovei': 'utm',
      'utm': 'utm',
      'academia de studii economice din moldova': 'asem',
      'asem': 'asem',
      'universitatea de stat de medicina si farmacie nicolae testemitanu': 'usmf',
      'usmf': 'usmf',
      'universitatea de stat alecu russo din balti': 'usarb',
      'usarb': 'usarb',
      'universitatea de stat din taraclia': 'ust',
      'ust': 'ust',
      'universitatea de stat din comrat': 'uscom',
      'uscom': 'uscom',
      'universitatea de stat din cahul': 'usc',
      'usc': 'usc',
      'universitatea de stat din orhei': 'uso',
      'uso': 'uso',
      'universitatea de stat din soroca': 'uss',
      'uss': 'uss',
      'universitatea de stat din ungheni': 'usu',
      'usu': 'usu',
      'universitatea de stat din edinet': 'used',
      'used': 'used',
      'universitatea de stat din ribnita': 'usr',
      'usr': 'usr',
      'universitatea de stat din tighina': 'ustg',
      'ustg': 'ustg',
      'universitatea de stat din tiraspol': 'ustr',
      'ustr': 'ustr',
      'universitatea de stat din bender': 'usb',
      'usb': 'usb',
      'universitatea de stat din dubasari': 'usd',
      'usd': 'usd',
      'universitatea de stat din camenca': 'uscam',
      'uscam': 'uscam',
      'universitatea de stat din grigoriopol': 'usg',
      'usg': 'usg',
      'universitatea de stat din dnestrovsc': 'usdn',
      'usdn': 'usdn',
      'universitatea de stat din slobozia': 'ussl',
      'ussl': 'ussl'
    };

    const normalizedName = name.toLowerCase().trim();
    return nameMappings[normalizedName] || normalizedName.replace(/\s+/g, '-');
  };

  // Hook pentru generarea automată a slug-ului
  University.beforeCreate((university) => {
    university.slug = generateSlug(university.name);
  });

  University.beforeUpdate((university) => {
    if (university.changed('name')) {
      university.slug = generateSlug(university.name);
    }
  });

  return University;
}; 