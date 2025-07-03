const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Entity = require("../models/entity");

router.post("/entity", auth, async (req, res) => {
    try {
        const entity = new Entity({
            description: req.body.description,
            author: req.userId
        });
        await entity.save();
        res.send(entity);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get("/entity", auth, async (req, res) => {
    try {
        const entities = await Entity.find({ author: req.userId });
        res.send(entities);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete("/entity/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const entity = await Entity.findOneAndDelete({ _id, author: req.userId });
        if(!entity) return res.status(404).send("Entity not found");
        res.send(entity);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch("/entity/:id", auth, async (req, res) => {
    const allowed = ["description"];
    const changing = Object.keys(req.body);
    const flag = changing.every((key) => allowed.includes(key));
    if(!flag) res.status(400).send("Invalid key used!");
    try {
        const entity = await Entity.findOne({ _id: req.params.id, author: req.userId });
        if(!entity) return res.status(404).send("Entity not found");
        changing.forEach(key => entity[key] = req.body[key]);
        await entity.save();
        res.send(entity);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;