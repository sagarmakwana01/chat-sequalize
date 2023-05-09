  
  const Sequelize = require('sequelize');
  const { MYSQLDATABASE,MYSQLUSER,MYSQLPORT,MYSQLHOST,MYSQLPASSWORD } = process.env;
  const sequelize = new Sequelize(
   {
    username:MYSQLUSER,
    password:MYSQLPASSWORD,
    database:MYSQLDATABASE,
    dialect: 'mysql',
    host: MYSQLHOST,
    port: MYSQLPORT,
    logging: false
  });

  module.exports = sequelize;
