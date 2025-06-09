const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Transaction = require("../models/transaction");

router.post("/transaction", auth, async (req, res) => {
    const transaction = new Transaction({
        ...req.body,
        author: req.author
    });
    try {
        await transaction.save();
        res.send(transaction);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get("/transaction", auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ author: req.author });
        res.send(transactions);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete("/transaction/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const transaction = await Transaction.findOneAndDelete({ _id, author: req.author });
        if(!transaction) return res.status(404).send("Transaction not found");
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
        const transaction = await Transaction.findOne({ _id: req.params.id, author: req.author });
        if(!transaction) return res.status(404).send("Transaction not found");
        changing.forEach(key => transaction[key] = req.body[key]);
        await transaction.save();
        res.send(transaction);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;