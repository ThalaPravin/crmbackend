// models/TransactionModel.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database');
const TPMS = require('./TPMSModel'); // Ensure correct path if necessary

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.STRING,
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
    type: {
        type: DataTypes.ENUM('deposit', 'withdraw', 'profit_loss'),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
            isInt: true
        }
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    freezeTableName: true
});

TPMS.hasMany(Transaction, { foreignKey: 'tpmsId' });
Transaction.belongsTo(TPMS, { foreignKey: 'tpmsId' });

module.exports = Transaction;
