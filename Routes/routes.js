module.exports = (app) => {
  const transfersafe = require("../Controllers/controller");

  var router = require("express").Router();

  router.post("/encrypt", async (req, res) => {
    const { sender, recipient, file, message } = req.body;

    if (!sender || !recipient || !file || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const encryptedKey = await transfersafe.encrypt(
      sender,
      recipient,
      file,
      message
    );

    return res.json({ key: encryptedKey });
  });

  router.post("/decrypt", async (req, res) => {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "Key to decrypt is required" });
    }

    const file_url = await transfersafe.decrypt(key);

    return res.json({ file_url });
  });

  app.use("/api", router);
};
