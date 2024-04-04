const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// const db = require("./Models/");
// db.sequelize
//   .sync()
//   .then(() => {
//     console.log("Synced db.");
//   })
//   .catch((err) => {
//     console.log("Failed to sync db: " + err.message);
//   });

app.get("/", (req, res) => {
  res.json({ message: "Transfersafe (Backend)" });
});

require("./Routes/routes")(app);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
