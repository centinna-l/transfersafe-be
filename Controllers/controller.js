require("dotenv").config();
const db = require("../Models");
const Tutorial = db.tutorials;
const Op = db.Sequelize.Op;

const nodemailer = require("nodemailer");

const CryptoJS = require("crypto-js");
const secretKey = "=Zu3p~GH^t1dZk#f#g*Ry!D#_#:pkQssM=NHAr%7z#,:!rB:3~";

// TODO: @Jerry, fix this. Create and Save a new Tutorial
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

// TODO: @Jerry, fix this. Retrieve all Tutorials from the database.
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

// TODO: @Jerry, fix this. Find a single Tutorial with an id
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

// Jolson's functions:
exports.sendEmail = async (sender, recipient, encryptedKey, message) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);

    let info = await transporter.sendMail({
      from: `"TransferSafe" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: `TransferSafe from ${sender}`,
      text: `You have received a message from ${sender}.\n\nClick the link below to view the message:https://transfer-safe.vercel.app/unlock\n\nMessage: ${message}\n\nEncryption Key: ${encryptedKey}`,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email" };
  }
};

exports.encrypt = (sender, recipient, file, message) => {
  const encryptedKey = CryptoJS.AES.encrypt(
    JSON.stringify({ sender, recipient, file, message }),
    secretKey
  ).toString();

  //TODO: @Jerry create db entry. Once done, proceed with sending email.
  exports.sendEmail(sender, recipient, encryptedKey, message);

  return encryptedKey;
};

exports.decrypt = (key) => {
  //TODO: @Jerry check db for provided key. If not found, return error. If found, proceed with decryption.

  const decryptedKey = CryptoJS.AES.decrypt(key, secretKey).toString(
    CryptoJS.enc.Utf8
  );

  return JSON.parse(decryptedKey).file;
};
