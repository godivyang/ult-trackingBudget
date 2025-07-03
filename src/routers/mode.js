const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Mode = require("../models/mode");

router.post("/mode", auth, async (req, res) => {
    try {
        const mode = new Mode({
            description: req.body.description,
            author: req.userId
        });
        await mode.save();
        res.send(mode);
    } catch (e) {
        res.status(400).send("Error: Mode of transaction cannot be created.");
    }
});

router.get("/mode", auth, async (req, res) => {
    try {
        const modes = await Mode.find({ author: req.userId });
        res.send(modes);
    } catch (e) {
        res.status(500).send(e);
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