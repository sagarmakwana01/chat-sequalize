const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User  = require('./usetModel')
const Chat = sequelize.define('Chat', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sender_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  receiver_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  senderName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  image: {
    type: Sequelize.STRING,
  },
}, {
  timestamps: true,
});

module.exports = Chat;
