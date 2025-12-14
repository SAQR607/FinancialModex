const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeamMember = sequelize.define('TeamMember', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  tableName: 'team_members',
  timestamps: true,
  underscored: true
});

module.exports = TeamMember;

