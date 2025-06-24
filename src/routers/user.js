const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");

const tokenOptions = {
    httpOnly: true,
    secure: process.env.cookie_Secure == "true",
    sameSite: process.env.cookie_SameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000
};

router.post("/user/me", auth, async (req, res) => {
    res.cookie("token", req.token, tokenOptions);
    res.send(req.user);
});

router.get("/", async (req, res) => {
    res.send("Welcome to Tracking Budget app!");
});

module.exports = router;