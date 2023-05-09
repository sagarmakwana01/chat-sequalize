const Sequelize = require('sequelize');
const sequelize = require('../util/database');


const Group = sequelize.define('Group', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  image: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  limit: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = Group;