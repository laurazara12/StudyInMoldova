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
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ranking: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tuition_fees: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        bachelor: null,
        master: null,
        phd: null
      }
    },
    contact_info: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        email: null,
        phone: null,
        address: null
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: true,
    tableName: 'universities',
    underscored: true,
    hooks: {
      beforeValidate: (university) => {
        if (university.name && !university.slug) {
          university.slug = generateSlug(university.name);
        }
        
        // Asigurăm că taxele de studii sunt în formatul corect
        if (!university.tuition_fees) {
          university.tuition_fees = {
            bachelor: null,
            master: null,
            phd: null
          };
        }
        
        // Asigurăm că informațiile de contact sunt în formatul corect
        if (!university.contact_info) {
          university.contact_info = {
            email: null,
            phone: null,
            address: null
          };
        }
      }
    }
  });

  University.associate = (models) => {
    University.hasMany(models.Program, {
      foreignKey: 'university_id',
      as: 'Programs'
    });
  };

  return University;
};

const generateSlug = (name) => {
  const nameMappings = {
    // USM
    'universitatea de stat din moldova': 'usm',
    'usm': 'usm',
    'universitatea de stat a moldovei': 'usm',
    'moldova state university': 'usm',
    'moldova state university (usm)': 'usm',
    
    // UTM
    'utm': 'utm',
    'universitatea tehnica a moldovei': 'utm',
    'universitatea tehnica din moldova': 'utm',
    'technical university of moldova': 'utm',
    'technical university of moldova (utm)': 'utm',
    
    // ASEM
    'asem': 'asem',
    'academia de studii economice din moldova': 'asem',
    'academy of economic studies of moldova': 'asem',
    'academy of economic studies of moldova (asem)': 'asem',
    
    // Nicolae Testemițanu
    'universitatea de stat de medicina si farmacie nicolae testemitanu': 'testemitanu',
    'nicolae testemitanu state university of medicine and pharmacy': 'testemitanu',
    'testemitanu': 'testemitanu',
    
    // ULIM
    'ulim': 'ulim',
    'universitatea libera internationala din moldova': 'ulim',
    'free international university of moldova': 'ulim',
    'free international university of moldova (ulim)': 'ulim',
    
    // USEM
    'usem': 'usem',
    'universitatea de studii europene din moldova': 'usem',
    'european university of moldova': 'usem',
    'european university of moldova (usem)': 'usem',
    
    // Alecu Russo
    'universitatea de stat alecu russo din balti': 'russo-balti',
    'alecu russo state university of balti': 'russo-balti',
    'russo-balti': 'russo-balti',
    
    // Comrat
    'universitatea de stat din comrat': 'comrat',
    'comrat state university': 'comrat',
    
    // Ion Creangă
    'universitatea pedagogica de stat ion creanga': 'creanga',
    'ion creanga state pedagogical university': 'creanga',
    'creanga': 'creanga',
    
    // AMTAP
    'academia de muzica teatru si arte plastice': 'amtap',
    'academy of music theatre and fine arts': 'amtap',
    'amtap': 'amtap',
    
    // UASM
    'universitatea agrara de stat din moldova': 'uasm',
    'state agrarian university of moldova': 'uasm',
    'uasm': 'uasm',
    
    // USEFS
    'universitatea de stat de educatie fizica si sport': 'usefs',
    'state university of physical education and sport': 'usefs',
    'usefs': 'usefs',
    
    // Hasdeu
    'universitatea de stat bogdan petriceicu hasdeu din cahul': 'hasdeu-cahul',
    'bogdan petriceicu hasdeu state university of cahul': 'hasdeu-cahul',
    'hasdeu-cahul': 'hasdeu-cahul',
    
    // Taraclia
    'universitatea de stat din taraclia': 'taraclia',
    'taraclia state university': 'taraclia',
    
    // Perspectiva
    'universitatea perspectiva-int': 'perspectiva',
    'perspectiva-int university': 'perspectiva',
    'perspectiva': 'perspectiva',
    
    // IMI-NOVA
    'institutul international de management imi-nova': 'imi-nova',
    'international institute of management imi-nova': 'imi-nova',
    'imi-nova': 'imi-nova',
    
    // UCCM
    'universitatea cooperatist-comerciala din moldova': 'uccm',
    'cooperative-commercial university of moldova': 'uccm',
    'uccm': 'uccm',
    
    // USM
    'universitatea slavona': 'usm',
    'slavonic university': 'usm',
    'usm': 'usm',
    
    // USPEES
    'universitatea de studii politice si economice europene constantin stere': 'uspees',
    'constantin stere european university of political and economic studies': 'uspees',
    'uspees': 'uspees',
    
    // UAP
    'universitatea de administratie publica': 'uap',
    'public administration university': 'uap',
    'uap': 'uap'
  };

  const normalizedName = name.toLowerCase().trim();
  return nameMappings[normalizedName] || normalizedName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}; 