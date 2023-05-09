  
  const Sequelize = require('sequelize');
  const { MYSQLDATABASE,MYSQLUSER,MYSQLPORT,MYSQLHOST,MYSQLPASSWORD } = process.env;
  const sequelize = new Sequelize(
   {
   username: 'root',
    password:'i67WD21sb9vCb21OAFyV',
    database:'railway',
    dialect: 'mysql',
    host: 'containers-us-west-48.railway.app',
    port: 7934,
    logging: false
  });

  module.exports = sequelize;
