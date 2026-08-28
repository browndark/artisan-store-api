const path = require('node:path');
const { Sequelize } = require('sequelize');

const databasePath = path.resolve(__dirname, '../../database/artisan_store.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
  logging: false,
  define: {
    freezeTableName: false,
    underscored: false,
    timestamps: true,
  },
});

module.exports = sequelize;
