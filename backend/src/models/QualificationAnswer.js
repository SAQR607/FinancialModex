const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QualificationAnswer = sequelize.define('QualificationAnswer', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  answer_text: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'qualification_answers',
  timestamps: true,
  underscored: true
});

module.exports = QualificationAnswer;

