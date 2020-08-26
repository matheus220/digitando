var express = require("express");
var router = express.Router();

const db = require("../db");

// Define route to get all messages from the database
router.get("/", async function (req, res) {
  const messages = await db.getAllMessages();
  res.json(messages);
});

module.exports = router;
