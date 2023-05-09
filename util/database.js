  const Sequelize = require('sequelize');

  const sequelize = new Sequelize('realtimechatapp', 'root', '', {
    dialect: 'mysql',
    host: 'localhost',
    port: 3307,
    logging: false
  });

  module.exports = sequelize;
