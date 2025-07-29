const express = require("express");
const router = express.Router();

// Routes will go here
router.get("/", (req, res)=>{
    res.render("home");
    res.clearCookie('token');
});

module.exports = router;