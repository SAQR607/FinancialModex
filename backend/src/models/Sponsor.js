const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sponsor = sequelize.define('Sponsor', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  website_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_global: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'sponsors',
  timestamps: true,
  underscored: true
});

module.exports = Sponsor;

