const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Score = sequelize.define('Score', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'scores',
  timestamps: true,
  underscored: true
});

module.exports = Score;

