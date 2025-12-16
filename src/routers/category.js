const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Category = require("../models/category");

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
        const category = new Category({
            description: req.body.description,
            author: req.userId
        });
        await category.save();
        res.send(category);
    } catch (e) {
        res.status(400).send("Error: Category cannot be created.");
    }
});

router.get("/category", auth, async (req, res) => {
    try {
        let categories = await Category.find({ author: req.userId });
        if(categories.length === 0) {
            const prescribed = await Category.find({ author: "__metadata__", description: req.userId });
            if(prescribed.length === 0) {
                _defaultCategories.forEach(async description => {
                    const cat = new Category({description, author: req.userId});
                    await cat.save();
                });
                categories = await Category.find({ author: req.userId });
            }
        }
        res.send(categories);
    } catch (e) {
        res.status(500).send("Error: Categories not found.");
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