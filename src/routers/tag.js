const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Tag = require("../models/tag");

router.post("/tag", auth, async (req, res) => {
    const tag = new Tag({
        ...req.body,
        author: req.author
    });
    try {
        await tag.save();
        res.send(tag);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get("/tag", auth, async (req, res) => {
    try {
        const tags = await Tag.find({ author: req.author });
        res.send(tags);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete("/tag/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const tag = await Tag.findOneAndDelete({ _id, author: req.author });
        if(!tag) return res.status(404).send("Tag not found");
        res.send(tag);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch("/tag/:id", auth, async (req, res) => {
    const allowed = ["description"];
    const changing = Object.keys(req.body);
    const flag = changing.every((key) => allowed.includes(key));
    if(!flag) res.status(400).send("Invalid key used!");
    try {
        const tag = await Tag.findOne({ _id: req.params.id, author: req.author });
        if(!tag) return res.status(404).send("Tag not found");
        changing.forEach(key => tag[key] = req.body[key]);
        await tag.save();
        res.send(tag);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;