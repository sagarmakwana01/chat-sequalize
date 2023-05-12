const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const GroupChat = sequelize.define('GroupChat', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false
  },
  senderName: {
    type: Sequelize.STRING
  },
    image: {
    type: Sequelize.STRING
  }

},{ timestamps: true,});

// Associations
const User = require('./usetModel'); // Replace with the path to the User model
const Group = require('./groupModel'); // Replace with the path to the Group model

GroupChat.belongsTo(User, {
  foreignKey: 'sender_id',
  onDelete: 'CASCADE'
});

GroupChat.belongsTo(Group, {
  foreignKey: 'group_id',
  onDelete: 'CASCADE'
});

module.exports = GroupChat;
