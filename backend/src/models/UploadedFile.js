const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UploadedFile = sequelize.define('UploadedFile', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'uploaded_files',
  timestamps: true,
  underscored: true
});

module.exports = UploadedFile;

