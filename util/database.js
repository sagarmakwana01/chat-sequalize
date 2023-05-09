  const Sequelize = require('sequelize');

  const sequelize = new Sequelize({
    username: 'root',
    password:'omSj6rcm1BqvnNYawkrS',
    database:'railway',
    dialect: 'mysql',
    host: 'containers-us-west-4.railway.app',
    port: 7071,
    logging: false
  });

  module.exports = sequelize;
