const express = require('express');
const {
    createWithdrawalRequest,
    getWithdrawalRequests,
    getWithdrawalRequestById,
    updateWithdrawalRequestStatus
} = require('../controllers/WithdrawalRequestController.js');
const { verifyUser } = require('../middleware/AuthUser.js');

const router = express.Router();

router.post('/withdrawalrequests', verifyUser, createWithdrawalRequest);
router.get('/withdrawalrequests', verifyUser, getWithdrawalRequests);
router.get('/withdrawalrequests/:id', verifyUser, getWithdrawalRequestById);
router.patch('/withdrawalrequests/status', verifyUser, updateWithdrawalRequestStatus);

module.exports = router;
