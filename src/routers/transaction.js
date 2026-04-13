const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Transaction = require("../models/transaction");
const { getSuccess, getError } = require("../middleware/response");

router.post("/transaction", auth, async (req, res) => {
// router.post("/transaction", async (req, res) => {
    // res.send();

    try {
        let transaction = new Transaction({
            ...req.body,
            author: req.userId
        });
        await transaction.save();
        transaction = await Transaction.enrich(transaction);
        res.send(getSuccess({message: "Transaction saved successfully!", data: transaction}));
    } catch (e) {
        res.status(400).send(getError({message: "Transaction was not saved.", detail: e.message}));
    }
});

// used as a getter with filters passed in the body
router.post("/transaction/filter", auth, async (req, res) => {
    try {
        const filter = req.body;
        let transactions = await Transaction.find({ ...filter, author: req.userId }).sort({ date: -1 });
        transactions = await Transaction.enrichBulk(transactions);
        // console.log(transactions)
        res.send(transactions);
    } catch (e) {
        // console.log(e)
        res.status(500).send(e);
    }
});

router.delete("/transaction/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        let transaction = await Transaction.findOneAndDelete({ _id, author: req.userId });
        if(!transaction) return res.status(404).send("Transaction not found");
        transaction = await Transaction.enrich(transaction);
        res.send(transaction);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch("/transaction/:id", auth, async (req, res) => {
    const allowed = ["date","amount","type","category","description","motive","mode","entities","tags"];
    const changing = Object.keys(req.body);
    const flag = changing.every((key) => allowed.includes(key));
    if(!flag) res.status(400).send("Invalid key used!");
    try {
        let transaction = await Transaction.findOne({ _id: req.params.id, author: req.userId });
        if(!transaction) return res.status(404).send(getError({code: "NOT_FOUND", message:"Transaction not found"}));
        changing.forEach(key => transaction[key] = req.body[key]);
        await transaction.save();
        transaction = await Transaction.enrich(transaction);
        res.send(transaction);
    } catch (e) {
        res.status(500).send(getError({message: "Transaction edit failed.", detail: e.message}));
    }
});

module.exports = router;