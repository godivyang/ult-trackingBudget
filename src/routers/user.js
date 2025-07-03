const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");

const tokenOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE == "true",
    sameSite: process.env.COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000
};

router.post("/user/me", auth, async (req, res) => {
    // console.log("user", req.author);
    res.cookie("token", req.token, tokenOptions);
    res.send(req.userName);
});

router.get("/", async (req, res) => {
    res.send("Welcome to Tracking Budget app!");
});

module.exports = router;