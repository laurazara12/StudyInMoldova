const config = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: '24h',
  database: {
    development: {
      dialect: 'sqlite',
      storage: './database.sqlite'
    },
    test: {
      dialect: 'sqlite',
      storage: ':memory:'
    },
    production: {
      dialect: 'sqlite',
      storage: './database.sqlite'
    }
  }
};

module.exports = config; 