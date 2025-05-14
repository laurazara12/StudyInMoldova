'use strict';

// Funcție pentru generarea slug-urilor
const generateSlug = (name) => {
  // Mapare pentru nume comune
  const nameMappings = {
    // USM
    'usm': 'usm',
    'universitatea de stat din moldova': 'usm',
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

  // Convertim la lowercase și eliminăm diacriticele
  const normalizedName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Verificăm dacă numele normalizat există în mapare
  if (nameMappings[normalizedName]) {
    return nameMappings[normalizedName];
  }

  // Dacă nu există în mapare, generăm un slug standard
  return normalizedName
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('universities', 'slug', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: 'default-slug' // Valoare temporară pentru universitățile existente
    });

    // Actualizăm slug-urile pentru universitățile existente
    const universities = await queryInterface.sequelize.query(
      'SELECT id, name FROM universities;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const university of universities) {
      const slug = generateSlug(university.name);
      
      await queryInterface.sequelize.query(
        'UPDATE universities SET slug = ? WHERE id = ?;',
        {
          replacements: [slug, university.id],
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Eliminăm valoarea implicită după ce am actualizat toate înregistrările
    await queryInterface.changeColumn('universities', 'slug', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('universities', 'slug');
  }
}; 