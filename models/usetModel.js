const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('User', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  image: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  is_online: {
    type: Sequelize.STRING,
    defaultValue: '0'
  }
}, {
  timestamps: true,
  underscored: true // optional, to use snake_case instead of camelCase for table and column names
});

module.exports = User;
