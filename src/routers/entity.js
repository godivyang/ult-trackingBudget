const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Entity = require("../models/entity");

const _defaultEntities = [
    "Father", "Mother", "Family", "Friend 1", "Friend 2",
    "Bank 1", "Bank 2", "Employer", "Office", "Station", "Airport",
    "Mall", "Home", "Myself"
];

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
        if(entities.length === 0) {
            const prescribed = await Entity.find({ author: "__metadata__", description: req.userId });
            if(prescribed.length === 0) {
                _defaultEntities.forEach(async description => {
                    const ent = new Entity({description, author: req.userId});
                    await ent.save();
                });
                entities = await Entity.find({ author: req.userId });
            }
        }
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