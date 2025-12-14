const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  invite_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_complete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'teams',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (team) => {
      if (!team.invite_code) {
        team.invite_code = crypto.randomBytes(8).toString('hex').toUpperCase();
      }
    }
  }
});

module.exports = Team;

