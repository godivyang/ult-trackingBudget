const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Tag = require("../models/tag");
const {getError, getSuccess} = require("../middleware/handler.js");

router.post("/tag", auth, async (req, res) => {
    try {
        const author = req.userId, count = await Tag.countDocuments({author});
        if(count >= 500) {
            res.status(400).send(getError("COUNT_OVERFLOW", "Couldn't add a new Tag. Max limit (500) reached."));
        } else {
            const lastTag = await Tag.find({author}).sort({ order: -1 }).limit(1);
            const tag = new Tag({ description: req.body.description, order: lastTag.order + 10, author });
            await tag.save();
            res.send(getSuccess({message: "Tag saved successfully!", data: tag}));
        }
    } catch (e) {
        res.status(400).send(getError({message: "Tag cannot be created."}));
    }
});

router.get("/tag", auth, async (req, res) => {
    try {
        let tags = await Tag.find({ author: req.userId }).sort({ order: 1 });
        if(!tags[0]?.order) {
            let order = 10;
            for(const tag of tags) {
                tag.order = order;
                await tag.save();
                order += 10;
            }
            tags = await Tag.find({ author: req.userId }).sort({ order: 1 });
        }
        res.send(getSuccess({message: "Tags fetched successfully!", data: tags}));
    } catch (e) {
        res.status(500).send(getError({code: "NON_FOUND", message: "Tags not found."}));
    }
});

router.post("/tag/updateOrder", auth, async (req, res) => {
    try {
        const newOrder = req.body.order, tags = await Tag.find({ author: req.userId }).sort({ order: 1 }),
              updated = [];
        for(let i = 0; i < newOrder.length; i++) {
            let actualIndex = newOrder.indexOf(tags[i]._id.toString());
            if(actualIndex !== i) {
                updated.push(i);
                tags[i].order = (actualIndex + 1) * 10;
                await tags[i].save();
            }
        }
        updated.forEach(async i => {
            tags[i].order *= -1;
            await tags[i].save();
        });
        res.send(getSuccess({message: "Tags rearranged successfully!"}));
    } catch (e) {
        res.status(500).send(getError({code: "PROCESS_FAILED", message: "Not able to sort Tags."}));
    }
});

router.delete("/tag/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const tag = await Tag.findOneAndDelete({ _id, author: req.userId });
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
        const tag = await Tag.findOne({ _id: req.params.id, author: req.userId });
        if(!tag) return res.status(404).send("Tag not found");
        changing.forEach(key => tag[key] = req.body[key]);
        await tag.save();
        res.send(tag);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;