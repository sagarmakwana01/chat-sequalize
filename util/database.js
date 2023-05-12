  
  const Sequelize = require('sequelize');
  const { MYSQLDATABASE,MYSQLUSER,MYSQLPORT,MYSQLHOST,MYSQLPASSWORD } = process.env;
  const sequelize = new Sequelize(
   {
   username: 'root',
    password:'HHpa7k00Mk2yOeIpUUzd',
    database:'railway',
    dialect: 'mysql',
    host: 'containers-us-west-185.railway.app',
    port: 6677,
    logging: false
  });

  module.exports = sequelize;
