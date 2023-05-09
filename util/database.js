  const Sequelize = require('sequelize');

  const sequelize = new Sequelize('realtimechatapp', 'root', '', {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    logging: false
  });

  module.exports = sequelize;
