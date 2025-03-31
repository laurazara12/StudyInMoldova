const University = require('../models/university');

const universities = [
  {
    name: 'Moldova State University',
    type: 'Public',
    description: 'Moldova State University (USM) is the leading public university in Moldova, located in the capital, Chișinău. Offers a wide range of programs across various faculties, including law, economics, international relations, and engineering. With a strong reputation in education and research, USM has partnerships with universities worldwide and welcomes students from over 80 countries.',
    website: 'https://international.usm.md/',
    ranking: 'QS Emerging Europe and Central Asia 301–350 (2022)',
    tuitionFees: {
      bachelor: '2000-3000 EUR/year',
      master: '2500-3500 EUR/year',
      phd: '3000-4000 EUR/year'
    },
    location: 'Chișinău, Moldova',
    imageUrl: '/images/universities/usm.jpg',
    programs: ['Law', 'Economics', 'International Relations', 'Engineering'],
    contactInfo: {
      email: 'international@usm.md',
      phone: '+373 22 50 99 99',
      address: 'Alexandru cel Bun 60, Chișinău, MD-2005, Moldova'
    }
  },
  {
    name: 'Technical University of Moldova',
    type: 'Public',
    description: 'The Technical University of Moldova (UTM) is the engineering and technology institution in the country, shaping the future through innovation, research, and academic excellence.',
    website: 'https://utm.md/en/',
    ranking: 'QS Emerging Europe and Central Asia 301–350 (2022)',
    tuitionFees: {
      bachelor: '2000-3000 EUR/year',
      master: '2500-3500 EUR/year',
      phd: '3000-4000 EUR/year'
    },
    location: 'Chișinău, Moldova',
    imageUrl: '/images/universities/utm.jpg',
    programs: ['Computer Science', 'Engineering', 'Architecture', 'Transportation'],
    contactInfo: {
      email: 'international@utm.md',
      phone: '+373 22 50 99 99',
      address: 'Bd. Ștefan cel Mare și Sfânt 168, Chișinău, MD-2004, Moldova'
    }
  },
  {
    name: 'Nicolae Testemițanu State University of Medicine and Pharmacy',
    type: 'Public',
    description: 'The Nicolae Testemițanu State University of Medicine and Pharmacy is Moldova\'s leading medical institution, known for its high academic standards and modern facilities. With a strong emphasis on practical training, international collaboration, and cutting-edge research, the university prepares students for successful medical careers worldwide. It offers English-taught programs, making it an excellent choice for international students.',
    website: 'https://admission.usmf.md/en',
    ranking: 'Ranking Web of Universities (Webometrics) place 3657 (first place in Moldova)',
    tuitionFees: {
      bachelor: '4000-7000 EUR/year',
      master: '4000-7000 EUR/year',
      phd: '4000-7000 EUR/year'
    },
    location: 'Chișinău, Moldova',
    imageUrl: '/images/universities/usmf.jpg',
    programs: ['Medicine', 'Pharmacy', 'Dentistry', 'Nursing'],
    contactInfo: {
      email: 'admission@usmf.md',
      phone: '+373 22 20 40 40',
      address: 'Nicolae Testemițanu 29, Chișinău, MD-2004, Moldova'
    }
  }
];

const seedUniversities = async () => {
  try {
    await University.sync({ force: true });
    await University.bulkCreate(universities);
    console.log('Universities seeded successfully');
  } catch (error) {
    console.error('Error seeding universities:', error);
  }
};

module.exports = seedUniversities; 