module.exports = {
  HOST: process.env.DB_HOST || "127.0.0.1",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "123456",
  DB: process.env.DB_NAME || "customerdb",
  port: process.env.DB_PORT || "8080",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};    
