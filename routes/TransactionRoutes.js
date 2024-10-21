const express = require("express");
const { verifyUser } = require("../middleware/AuthUser.js");
const { 
    deposit,
    withdraw,
    addProfitLoss,
    deleteTransaction,
    updateTransaction,
    getAllTransactions,
    getTransactionById
 } = require("../controllers/TransactionController.js");

const router = express.Router();

router.post('/deposit', verifyUser, deposit);
router.get('/getAllTransactions', verifyUser, getAllTransactions);
router.get('/getTransactionById/:id', verifyUser, getTransactionById);
router.patch('/updateTransaction/:id', verifyUser, updateTransaction);
router.delete('/deleteTransaction/:id', verifyUser, deleteTransaction);
router.post('/withdraw', verifyUser, withdraw);
router.post('/addProfitLoss', verifyUser, addProfitLoss);

module.exports = router;