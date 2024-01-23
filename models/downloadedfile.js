const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const DownloadedFile = sequelize.define('downloadedFiles', {
    id:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },

    fileUrl: {
        type: Sequelize.STRING,
        allowNull: false
    }
});


module.exports = DownloadedFile;
