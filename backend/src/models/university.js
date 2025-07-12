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
      type: DataTypes.STRING(255), // sau chiar mai mult, dacă vrei
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
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
        bachelor: '',
        master: '',
        phd: ''
      },
      get() {
        const rawValue = this.getDataValue('tuition_fees');
        return rawValue || {
          bachelor: '',
          master: '',
          phd: ''
        };
      },
      set(value) {
        this.setDataValue('tuition_fees', value);
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
            bachelor: '',
            master: '',
            phd: ''
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
      as: 'programs',
      onDelete: 'CASCADE'
    });
  };

  return University;
};

const generateSlug = (name) => {
  const nameMappings = {
    // USM
    'universitatea de stat din moldova': 'moldova-state-university-usm',
    'usm': 'moldova-state-university-usm',
    'universitatea de stat a moldovei': 'moldova-state-university-usm',
    'moldova state university': 'moldova-state-university-usm',
    'moldova state university (usm)': 'moldova-state-university-usm',
    
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
    'universitatea libera internationala din moldova': 'free-international-university-of-moldova-ulim',
    'free international university of moldova': 'free-international-university-of-moldova-ulim',
    'free international university of moldova (ulim)': 'free-international-university-of-moldova-ulim',
    'ulim':'free-international-university-of-moldova-ulim',
    'free-international-university-of-moldova-ulim':'free-international-university-of-moldova-ulim',

    
    // USEM
    'usem': 'usem',
    'universitatea de studii europene din moldova': 'usem',
    'european university of moldova': 'usem',
    'european university of moldova (usem)': 'usem',
    
    // Alecu Russo
    'universitatea de stat alecu russo din balti': 'alecu-russo-state-university-of-b-l-i-usarb',
    'alecu russo state university of balti': 'alecu-russo-state-university-of-b-l-i-usarb',
    'alecu russo state university of bălți': 'alecu-russo-state-university-of-b-l-i-usarb',
    'alecu russo state university of balti (usarb)': 'alecu-russo-state-university-of-b-l-i-usarb',
    'alecu russo state university of bălți (usarb)': 'alecu-russo-state-university-of-b-l-i-usarb',
    'usarb': 'alecu-russo-state-university-of-b-l-i-usarb',
    'alecu-russo-state-university-of-b-l-i-usarb': 'alecu-russo-state-university-of-b-l-i-usarb',
    'universitatea alecu russo din balti': 'alecu-russo-state-university-of-b-l-i-usarb',
    'universitatea alecu russo din bălți': 'alecu-russo-state-university-of-b-l-i-usarb',
    'universitatea de stat alecu russo din bălți': 'alecu-russo-state-university-of-b-l-i-usarb',
    'universitatea de stat alecu russo din balti (usarb)': 'alecu-russo-state-university-of-b-l-i-usarb',
    'universitatea de stat alecu russo din bălți (usarb)': 'alecu-russo-state-university-of-b-l-i-usarb',
    
    // Comrat
    'universitatea de stat din comrat': 'comrat',
    'comrat state university': 'comrat',
    
    // Ion Creangă
    'ion creanga state pedagogical university of chisinau': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creangă state pedagogical university of chisinau': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creanga state pedagogical university': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creangă state pedagogical university': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'state pedagogical university ion creanga': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'state pedagogical university ion creangă': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'pedagogical university ion creanga': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'pedagogical university ion creangă': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'universitatea pedagogica de stat ion creanga': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'universitatea pedagogică de stat ion creangă': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'universitatea pedagogica ion creanga': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'universitatea pedagogică ion creangă': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creanga': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creangă': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'creanga': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'creangă': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creanga chisinau': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creangă chisinau': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creanga chișinău': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creangă chișinău': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    // Variante cu "upsc"
    'ion creanga state pedagogical university of chisinau upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creangă state pedagogical university of chisinau upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creanga state pedagogical university upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creangă state pedagogical university upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'state pedagogical university ion creanga upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'state pedagogical university ion creangă upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'pedagogical university ion creanga upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'pedagogical university ion creangă upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'universitatea pedagogica de stat ion creanga upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'universitatea pedagogică de stat ion creangă upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'universitatea pedagogica ion creanga upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'universitatea pedagogică ion creangă upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creanga upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creangă upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'creanga upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'creangă upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creanga chisinau upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creangă chisinau upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creanga chișinău upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion creangă chișinău upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    'ion-creang-state-pedagogical-university-of-chisin-u-upsc': 'ion-creang-state-pedagogical-university-of-chi-in-u',
    
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