module.exports = (app) => {
  const transfersafe = require("../Controllers/controller");

  var router = require("express").Router();

  router.post("/encrypt", (req, res) => {
    const { sender, recipient, file, message } = req.body;

    if (!sender || !recipient || !file || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const encryptedKey = transfersafe.encrypt(sender, recipient, file, message);

    return res.json({ encryptedKey });
  });

  router.post("/decrypt", (req, res) => {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "Key to decrypt is required" });
    }

    const decryptedKey = transfersafe.decrypt(key);

    return res.json(decryptedKey);
  });

  app.use("/api", router);
};
