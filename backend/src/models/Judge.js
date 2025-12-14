const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Judge = sequelize.define('Judge', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  assigned_teams: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'judges',
  timestamps: true,
  underscored: true
});

module.exports = Judge;

