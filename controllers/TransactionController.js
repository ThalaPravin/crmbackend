const Lead = require('../models/LeadModel');
const TPMS = require('../models/TPMSModel');
const Transaction = require('../models/TransactionModel');

// Controller function to deposit amount into TPMS
async function deposit(req, res) {
    const { transactionId, tpmsId, amount, description } = req.body;

    try {

        const tpmsRecord = await TPMS.findByPk(tpmsId);
        if (!tpmsRecord) {
            return res.status(404).json({ error: 'TPMS record not found' });
        }

        const beforeDeposit = tpmsRecord.depositedAmount;
        const transaction = await Transaction.create({
            id: transactionId,
            tpmsId: tpmsId,
            type: 'deposit',
            amount: amount,
            description: description || 'Deposit'
        });

        tpmsRecord.depositedAmount += amount;
        await tpmsRecord.save();
        if (beforeDeposit === 0) {

            const lead = await Lead.findOne({
                where: {
                    uuid: tpmsRecord.uuid,
                    product_selection: "TPMS"
                }
            });

            lead.lead_status = "Fund Added";

            await lead.save();

        }
        return res.status(201).json(transaction);
    } catch (error) {
        console.error('Error depositing amount:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Controller function to withdraw amount from TPMS
async function withdraw(req, res) {
    const { transactionId, tpmsId, amount, description } = req.body;

    try {
        const tpmsRecord = await TPMS.findByPk(tpmsId);
        if (!tpmsRecord) {
            return res.status(404).json({ error: 'TPMS record not found' });
        }

        if (tpmsRecord.pnlamount < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        const transaction = await Transaction.create({
            id: transactionId,
            tpmsId: tpmsId,
            type: 'withdraw',
            amount: amount,
            description: description || 'Withdrawal'
        });

        tpmsRecord.pnlamount -= amount;
        await tpmsRecord.save();

        return res.status(201).json(transaction);
    } catch (error) {
        console.error('Error withdrawing amount:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Controller function to add profit/loss to TPMS
async function addProfitLoss(req, res) {
    const { transactionId, tpmsId, amount, description } = req.body;

    try {
        const tpmsRecord = await TPMS.findByPk(tpmsId);
        if (!tpmsRecord) {
            return res.status(404).json({ error: 'TPMS record not found' });
        }

        const transaction = await Transaction.create({
            id: transactionId,
            tpmsId: tpmsId,
            type: 'profit_loss',
            amount: amount,
            description: description || 'Profit/Loss'
        });

        if (description === "profit") {

            tpmsRecord.pnlamount += amount;
        } else if (description === "loss") {
            tpmsRecord.pnlamount -= amount;
        }

        await tpmsRecord.save();

        return res.status(201).json(transaction);
    } catch (error) {
        console.error('Error adding profit/loss:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteTransaction(req, res) {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findByPk(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const tpmsId = transaction.tpmsId;
        const tpmsRecord = await TPMS.findByPk(tpmsId);
        if (!tpmsRecord) {
            return res.status(404).json({ error: 'TPMS record not found' });
        }

        // Reverse the effect of the transaction
        if (transaction.type === 'deposit') {
            tpmsRecord.depositedAmount -= transaction.amount;
        } else if (transaction.type === 'withdraw') {
            tpmsRecord.depositedAmount += transaction.amount;
        } else if (transaction.type === 'profit_loss') {
            tpmsRecord.pnlamount -= transaction.amount;
        }

        await tpmsRecord.save();
        await transaction.destroy();

        return res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Controller function to update a transaction
async function updateTransaction(req, res) {
    const { transactionId } = req.params;
    const { amount, description } = req.body;

    try {
        const transaction = await Transaction.findByPk(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const tpmsId = transaction.tpmsId;
        const tpmsRecord = await TPMS.findByPk(tpmsId);
        if (!tpmsRecord) {
            return res.status(404).json({ error: 'TPMS record not found' });
        }

        // Calculate the difference in amount if it's updated
        const amountDifference = amount - transaction.amount;

        // Update the transaction
        await transaction.update({
            amount: amount,
            description: description || transaction.description
        });

        // Update the TPMS record accordingly
        if (transaction.type === 'deposit' || transaction.type === 'withdraw') {
            tpmsRecord.depositedAmount += amountDifference;
        } else if (transaction.type === 'profit_loss') {
            tpmsRecord.pnlamount += amountDifference;
        }

        await tpmsRecord.save();

        return res.status(200).json(transaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAllTransactions(req, res) {
    try {
        const transactions = await Transaction.findAll();
        return res.status(200).json(transactions);
    } catch (error) {
        console.error('Error retrieving transactions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getTransactionById(req, res) {
    const { id } = req.params;

    try {
        const tpmsRecord = await TPMS.findByPk(id, { include: Transaction });
        if (!tpmsRecord) {
            return res.status(404).json({ error: 'TPMS record not found' });
        }

        const transactions = tpmsRecord.Transactions;
        return res.status(200).json(transactions);
    } catch (error) {
        console.error('Error retrieving transactions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {
    deposit,
    withdraw,
    addProfitLoss,
    deleteTransaction,
    updateTransaction,
    getAllTransactions,
    getTransactionById
};