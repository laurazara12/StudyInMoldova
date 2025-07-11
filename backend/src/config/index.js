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
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    }
  }
};

module.exports = config; 