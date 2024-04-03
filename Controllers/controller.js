require("dotenv").config();
const db = require("../Models");
const Tutorial = db.tutorials;
const Op = db.Sequelize.Op;

const nodemailer = require("nodemailer");

// Create and Save a new Tutorial
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a Tutorial
  const tutorial = {
    emailTo: req.body.email_to,
    emailFrom: req.body.email_from,
    file_url: req.body.file_url ?? "",
    file_key: req.body.file_key ?? "",
    message: req.body.message,
  };

  // Save Tutorial in the database
  Tutorial.create(tutorial)
    .then((data) => {
      res.json({ data });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tutorial.",
      });
    });
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;

  Tutorial.findAll({ where: condition })
    .then((data) => {
      res.json({ data });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

// Find a single Tutorial with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Tutorial.findByPk(id)
    .then((data) => {
      res.json({ data });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Tutorial with id=" + id,
      });
    });
};

exports.sendEmail = (req, res) => {
  const id = req.params.id;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.email,
      pass: process.env.password,
      clientId: process.env.client_id,
      clientSecret: process.env.client_secret,
      refreshToken: process.env.refreshToken,
    },
  });
  let mailOptions = {
    from: "jerryjoy99@gmail.com",
    to: "aryanxarora@gmail.com ",
    subject: "Transfer Safe Project",
    text: "Welcome to the Gaandu Project, sent from the sexy API made by me",
  };
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email sent successfully");
      return res.json({ message: "Email sent" });
    }
  });
  //   Tutorial.findByPk(id)
  //     .then((data) => {

  //       res.json({ data });
  //     })
  //     .catch((err) => {
  //       res.status(500).send({
  //         message: "Error retrieving Tutorial with id=" + id,
  //       });
  //     });
};
