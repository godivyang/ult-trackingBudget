const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");

router.get("/user/me", auth, async (req, res) => {
    res.send(req.user);
});

module.exports = router;