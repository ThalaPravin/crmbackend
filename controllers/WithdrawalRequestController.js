const WithdrawalRequest = require('../models/WithdrawalRequestModel');
const TPMS = require('../models/TPMSModel');

const createWithdrawalRequest = async (req, res) => {
    const { tpmsId, amount } = req.body;

    try {
        const tpms = await TPMS.findOne({ where: { id: tpmsId } });

        if (!tpms) {
            return res.status(404).json({ msg: "TPMS account not found" });
        }

        if (amount > tpms.pnlamount) {
            return res.status(400).json({ msg: "Insufficient balance" });
        }

        const withdrawalRequest = await WithdrawalRequest.create({
            tpmsId: tpmsId,
            amount: amount,
            status: 'Pending'
        });

        tpms.pnlamount -= amount;
        await tpms.save();

        res.status(201).json({ msg: "Withdrawal request created successfully", withdrawalRequest });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getWithdrawalRequests = async (req, res) => {
    try {
        const withdrawalRequests = await WithdrawalRequest.findAll();
        res.status(200).json(withdrawalRequests);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


const getWithdrawalRequestById = async (req, res) => {
    try {
        const withdrawalRequest = await WithdrawalRequest.findAll({
            where: {
                tpmsId: req.params.id
            }
        });

        if (!withdrawalRequest) {
            return res.status(404).json({ msg: "Withdrawal request not found" });
        }

        res.status(200).json(withdrawalRequest);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateWithdrawalRequestStatus = async (req, res) => {
    try {
        const { id, status } = req.body;

        const withdrawalRequest = await WithdrawalRequest.findOne({
            where: {
                id: id
            }
        });

        if (!withdrawalRequest) {
            return res.status(404).json({ msg: "Withdrawal request not found" });
        }

        withdrawalRequest.status = status;
        await withdrawalRequest.save();

        res.status(200).json({ msg: "Withdrawal request status updated successfully" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = {
    createWithdrawalRequest,
    getWithdrawalRequests,
    getWithdrawalRequestById,
    updateWithdrawalRequestStatus
};
