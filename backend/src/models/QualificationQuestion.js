const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QualificationQuestion = sequelize.define('QualificationQuestion', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.ENUM('TEXT', 'MULTIPLE_CHOICE', 'NUMBER'),
    defaultValue: 'TEXT'
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'qualification_questions',
  timestamps: true,
  underscored: true
});

module.exports = QualificationQuestion;

