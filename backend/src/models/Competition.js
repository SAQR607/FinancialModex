const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Competition = sequelize.define('Competition', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  current_stage_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  sponsor_banner_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'competitions',
  timestamps: true,
  underscored: true
});

module.exports = Competition;

