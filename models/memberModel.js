const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./usetModel')
const Group = require('./groupModel')

const Member = sequelize.define('Member', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    group_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  });

  // Member.belongsTo(User, { foreignKey: 'user_id' });
  // User.hasMany(Member, { foreignKey: 'user_id' });

  Member.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });
  Member.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Group.hasMany(Member, { foreignKey: 'group_id' });
  User.hasMany(Member, { foreignKey: 'user_id' });
  module.exports = Member;