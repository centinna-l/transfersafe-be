module.exports = (app) => {
  const tutorials = require("../Controllers/controller");

  var router = require("express").Router();

  // Create a new Tutorial
  router.get("/", (req, res) => {
    res.json({ message: "Welcome to Gaandu Application." });
  });

  // Retrieve all Tutorials
  router.get("/sendemail", tutorials.sendEmail);

  app.use("/api/tutorials", router);
};
