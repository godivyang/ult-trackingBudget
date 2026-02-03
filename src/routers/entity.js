const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Entity = require("../models/entity");
const {getError, getSuccess} = require("../middleware/handler.js");

const _defaultEntities = [
    "Father", "Mother", "Family", "Friend 1", "Friend 2",
    "Bank 1", "Bank 2", "Employer", "Office", "Station", "Airport",
    "Mall", "Home", "Myself"
];

router.post("/entity", auth, async (req, res) => {
    try {
        const author = req.userId, count = await Entity.countDocuments({author});
        if(count >= 400) {
            res.status(400).send(getError("COUNT_OVERFLOW", "Couldn't add a new Entity. Max limit (400) reached."));
        } else {
            const lastEntity = await Entity.find({author}).sort({ order: -1 }).limit(1);
            const entity = new Entity({ description: req.body.description, order: lastEntity.order + 10, author });
            await entity.save();
            res.send(getSuccess({message: "Entity saved successfully!", data: entity}));
        }
    } catch (e) {
        res.status(400).send(getError({message: "Entity cannot be created."}));
    }
});

router.get("/entity", auth, async (req, res) => {
    try {
        let entities = await Entity.find({ author: req.userId }).sort({ order: 1 });
        if(entities.length === 0) {
            let order = 10;
            for(const description of _defaultEntities) {
                const ent = new Entity({description, author: req.userId, order});
                await ent.save();
                order += 10;
            }
            entities = await Entity.find({ author: req.userId }).sort({ order: 1 });
        } else if(!entities[0].order) {
            let order = 10;
            for(const ent of entities) {
                ent.order = order;
                await ent.save();
                order += 10;
            }
            entities = await Entity.find({ author: req.userId }).sort({ order: 1 });
        }
        res.send(getSuccess({message: "Entities fetched successfully!", data: entities}));
    } catch (e) {
        res.status(500).send(getError({code: "NOT_FOUND", message: "Entities not found."}));
    }
});

router.post("/entity/updateOrder", auth, async (req, res) => {
    try {
        const newOrder = req.body.order, entities = await Entity.find({ author: req.userId }).sort({ order: 1 }),
              updated = [];
        for(let i = 0; i < newOrder.length; i++) {
            let actualIndex = newOrder.indexOf(entities[i]._id.toString());
            if(actualIndex !== i) {
                updated.push(i);
                entities[i].order = (actualIndex + 1) * (-10);
                await entities[i].save();
            }
        }
        updated.forEach(async i => {
            entities[i].order *= -1;
            await entities[i].save();
        });
        res.send(getSuccess({message: "Entities rearranged successfully!"}));
    } catch (e) {
        res.status(500).send(getError({code: "PROCESS_FAILED", message: "Not able to sort Entities."}));
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