const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const {getError, getSuccess, setCookie} = require("../middleware/response.js");

router.get("/user/wakeUltUtl", async (req, res) => {
    try {
        await fetch(process.env.ULTIMATE_UTILITY_AUTH_URL);
        res.send(getSuccess({ message: "Ultimate Utility is awake!" }));
    } catch (e) {
        res.status(400).send(getError({ message: "Failed to wake Ultimate Utility.", detail: e.message }));
    }
});

router.post("/user/me", auth, async (req, res) => {
    // console.log("user", req.author);
    try {
        setCookie(res, req.token);
        res.send(getSuccess({ message: "Login Successful!", data: req.userName }));
    } catch (e) {
        res.status(400).send(getError({ message: "Failed to get user details.", detail: e.message }));
    }
});

router.get("/", async (req, res) => {
    res.send("Welcome to Tracking Budget app!");
});

module.exports = router;