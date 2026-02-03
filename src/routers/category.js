const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Category = require("../models/category");
const {getError, getSuccess} = require("../middleware/handler.js");

const _defaultCategories = [
    "Rent", "EMI", "Electricity", "Phone bill", "Internet",
    "Groceries", "Dining out", "Food delivery",
    "Cab rides", "Metro fare", "Parking", "Flights",
    "Clothing", "Accessories", "Electronics",
    "Medicine", "Gym fees", "Grooming",
    "Movies", "Subscription", "Books",
    "Education", "SIP", "Stocks", "Insurance", "Credit card bill",
    "Home supplies", "Repairs",
    "Hotels", "Charity", "Gift",
    "Salary", "Bonus", "Interest", "Refund", "Reimbursement", 
    "Others"
];

router.post("/category", auth, async (req, res) => {
    try {
        const author = req.userId, count = await Category.countDocuments({author});
        if(count >= 200) {
            res.status(400).send(getError("COUNT_OVERFLOW", "Couldn't add a new Category. Max limit (200) reached."));
        } else {
            const lastCategory = await Category.find({author}).sort({ order: -1 }).limit(1);
            const category = new Category({ description: req.body.description, order: lastCategory.order + 10, author });
            await category.save();
            res.send(getSuccess({message: "Category saved successfully!", data: category}));
        }
    } catch (e) {
        res.status(400).send(getError({message: "Category cannot be created."}));
    }
});

router.get("/category", auth, async (req, res) => {
    try {
        let categories = await Category.find({ author: req.userId }).sort({ order: 1 });
        if(categories.length === 0) {
            let order = 10;
            for(const description of _defaultCategories) {
                const cat = new Category({description, author: req.userId, order});
                order += 10;
                await cat.save();
            }
            categories = await Category.find({ author: req.userId }).sort({ order: 1 });
        } else if(!categories[0].order) {
            let order = 10;
            for(const cat of categories) {
                cat.order = order;
                await cat.save();
                order += 10;
            }
            categories = await Category.find({ author: req.userId }).sort({ order: 1 });
        }
        res.send(getSuccess({message: "Categories fetched successfully!", data: categories}));
    } catch (e) {
        res.status(500).send(getError({code: "NOT_FOUND", message: "Categories not found."}));
    }
});

router.post("/category/updateOrder", auth, async (req, res) => {
    try {
        const newOrder = req.body.order, categories = await Category.find({ author: req.userId }).sort({ order: 1 }), 
              updated = [];
        for(let i = 0; i < newOrder.length; i++) {
            let actualIndex = newOrder.indexOf(categories[i]._id.toString());
            if(actualIndex !== i) {
                updated.push(i);
                categories[i].order = (actualIndex + 1) * (-10);
                await categories[i].save();
            }
        }
        updated.forEach(async i => {
            categories[i].order *= -1;
            await categories[i].save();
        });
        res.send(getSuccess({message: "Categories rearranged successfully!"}));
    } catch (e) {
        res.status(500).send(getError({code: "PROCESS_FAILED", message: "Not able to sort Categories."}));
    }
});

router.delete("/category/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const category = await Category.findOneAndDelete({ _id, author: req.userId });
        if(!category) return res.status(404).send("Category not found");
        res.send(category);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch("/category/:id", auth, async (req, res) => {
    const allowed = ["description"];
    const changing = Object.keys(req.body);
    const flag = changing.every((key) => allowed.includes(key));
    if(!flag) res.status(400).send("Invalid key used!");
    try {
        const category = await Category.findOne({ _id: req.params.id, author: req.userId });
        if(!category) return res.status(404).send("Category not found");
        changing.forEach(key => category[key] = req.body[key]);
        await category.save();
        res.send(category);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;