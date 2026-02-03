const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Mode = require("../models/mode");
const {getError, getSuccess} = require("../middleware/handler.js");

const _defaultModes = [
    "Bank 1", "Bank 2", "Cash", "Credit card", "UPI"
];

router.post("/mode", auth, async (req, res) => {
    try {
        const author = req.userId, count = await Mode.countDocuments({author});
        if(count >= 50) {
            res.status(400).send(getError("COUNT_OVERFLOW", "Couldn't add a new Mode of transaction. Max limit (50) reached."));
        } else {
            const lastMode = await Mode.find({author}).sort({ order: -1 }).limit(1);
            const mode = new Mode({ description: req.body.description, order: lastMode.order + 10, author });
            await mode.save();
            res.send(getSuccess({message: "Mode of transaction saved successfully!", data: mode}));
        }
    } catch (e) {
        res.status(400).send(getError({message: "Mode of transaction cannot be created."}));
    }
});

router.get("/mode", auth, async (req, res) => {
    try {
        let modes = await Mode.find({ author: req.userId }).sort({ order: 1 });
        if(modes.length === 0) {
            let order = 10;
            for(const description of _defaultModes) {
                const mod = new Mode({description, author: req.userId, order});
                await mod.save();
                order += 10;
            }
            modes = await Mode.find({ author: req.userId }).sort({ order: 1 });
        } else if(!modes[0].order) {
            let order = 10;
            for(const mode of modes) {
                mode.order = order;
                await mode.save();
                order += 10;
            }
            modes = await Mode.find({ author: req.userId }).sort({ order: 1 });
        }
        res.send(getSuccess({message: "Mode of transactions fetched successfully!", data: modes}));
    } catch (e) {
        res.status(500).send(getError({code: "NOT_FOUND", message: "Mode of transactions not found."}));
    }
});

router.post("/mode/updateOrder", auth, async (req, res) => {
    try {
        const newOrder = req.body.order, modes = await Mode.find({ author: req.userId }).sort({ order: 1 }),
            updated = [];
        for(let i = 0; i < newOrder.length; i++) {
            let actualIndex = newOrder.indexOf(modes[i]._id.toString());
            if(actualIndex !== i) {
                updated.push(i);
                modes[i].order = (actualIndex + 1) * (-10);
                await modes[i].save();
            }
        }
        updated.forEach(async i => {
            modes[i].order *= -1;
            await modes[i].save();
        });
        res.send(getSuccess({message: "Mode of transactions rearranged successfully!"}));
    } catch (e) {
        res.status(500).send(getError({code: "PROCESS_FAILED", message: "Not able to sort Mode of Transactions."}));
    }
});

router.delete("/mode/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const mode = await Mode.findOneAndDelete({ _id, author: req.userId });
        if(!mode) return res.status(404).send("Mode not found");
        res.send(mode);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch("/mode/:id", auth, async (req, res) => {
    const allowed = ["description"];
    const changing = Object.keys(req.body);
    const flag = changing.every((key) => allowed.includes(key));
    if(!flag) res.status(400).send("Invalid key used!");
    try {
        const mode = await Mode.findOne({ _id: req.params.id, author: req.userId });
        if(!mode) return res.status(404).send("Mode not found");
        changing.forEach(key => mode[key] = req.body[key]);
        await mode.save();
        res.send(mode);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;