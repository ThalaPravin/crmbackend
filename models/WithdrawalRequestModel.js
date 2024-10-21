const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');
const TPMS = require('./TPMSModel'); // Ensure correct path if necessary

const WithdrawalRequest = sequelize.define('WithdrawalRequest', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tpmsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TPMS,
            key: 'id'
        },
        validate: {
            notEmpty: true
        }
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notEmpty: true,
            min: 0.01
        }
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending',
        validate: {
            notEmpty: true
        }
    }
}, {
    timestamps: true,
    freezeTableName: true
});

// Define associations
TPMS.hasMany(WithdrawalRequest, { foreignKey: 'tpmsId' });
WithdrawalRequest.belongsTo(TPMS, { foreignKey: 'tpmsId' });

module.exports = WithdrawalRequest;
