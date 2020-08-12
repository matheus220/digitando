var express = require("express");
var router = express.Router();

const db = require("../db");

// define the home page route
router.get("/", async function (req, res) {
  const messages = await db.getAllMessages();
  res.json(messages);
});

// define the about route
router.get("/about", function (req, res) {
  res.send("About birds");
});

module.exports = router;
