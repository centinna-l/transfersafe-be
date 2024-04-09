require("dotenv").config();
const db = require("../Models");
const TransferSafe = db.transfersafe;

const argon2 = require("argon2");

const nodemailer = require("nodemailer");
const crypto = require("crypto");

const CryptoJS = require("crypto-js");
const secretKey = "=Zu3p~GH^t1dZk#f#g*Ry!D#_#:pkQssM=NHAr%7z#,:!rB:3~";

function generateRandomKey(length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";

  // Generate random bytes
  const randomBytes = crypto.randomBytes(Math.ceil((length * 3) / 4));

  // Convert random bytes to base64 format
  const base64String = randomBytes.toString("base64");

  // Extract alphanumeric characters from base64 string
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * base64String.length);
    key += charset[randomIndex % charset.length];
  }

  return key;
}

const sendEmail = async (sender, recipient, encryptedKey, message) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // console.log(process.env.email, process.env.password);

    let info = await transporter.sendMail({
      from: `"TransferSafe" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: `TransferSafe from ${sender}`,
      text: `You have received a message from ${sender}.\n\nClick the link below to view the message:https://transfer-safe.vercel.app/unlock\n\nMessage: ${message}\n\nEncryption Key: ${encryptedKey}`,
    });

    // console.log("Message sent: %s", info.messageId);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email" };
  }
};

exports.encrypt = async (email_from, email_to, file_url, message) => {
  try {
    const encryptedKey = generateRandomKey(10);

    const transfersafe = {
      emailTo: email_to,
      emailFrom: email_from,
      file_url,
      file_key: encryptedKey,
      message,
    };

    TransferSafe.create(transfersafe)
      .then(async (_) => {
        await sendEmail(email_from, email_to, encryptedKey, message);
        console.log("Email Sent", file_url);
      })
      .catch((err) => {
        console.log(err.message);
      });

    return `File uploaded Successfully`;
  } catch (error) {
    return error.message;
  }
};

exports.decrypt = async (key) => {
  try {
    //const data = TransferSafe.findOne({ where: { file_key: key } });
    console.log(key);
    const sequelize = require("../Models").sequelize;
    const sqlQuery = `SELECT * FROM transfersaves where file_key = '${key}'`; // Define the SQL query

    console.log(sqlQuery);
    const data = await sequelize.query(sqlQuery, {
      //  replacements: { key: key },
      type: sequelize.QueryTypes.SELECT,
    });

    if (data == null || data == "") {
      throw new Error("No data found");
    }
    removeAttribute(data, "file_key");
    return data;
  } catch (error) {
    throw error;
  }
};

function removeAttribute(array, attribute) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].hasOwnProperty(attribute)) {
      delete array[i][attribute];
    }
  }
}

const sqlInjectionDetection = (input) => {
  // Regular expression pattern to match common SQL keywords
  const sqlKeywordsPattern =
    /\b(SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE|CREATE INDEX|DROP INDEX)\b/i;

  // Check if the input string contains any SQL keywords
  return sqlKeywordsPattern.test(input);
};
exports.decryptSQL = async (key) => {
  try {
    //const data = TransferSafe.findOne({ where: { file_key: key } });
    console.log(key);
    const sequelize = require("../Models").sequelize;
    let sqlQuery = "";
    let statusCode = 200;
    sqlQuery = `SELECT * FROM transfersaves where file_key = '${key}'`;
    if (sqlInjectionDetection(key)) {
      console.log("SQL Detection");
      sqlQuery = `SELECT * FROM transfersaves where file_key = '${key}`;
      statusCode = 400;
    }

    const data = await sequelize.query(sqlQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    console.log("DATA CHECK ", data);
    if (data == null || data == "") {
      statusCode = 400;
      throw new Error("No data found");
    }
    removeAttribute(data, "file_key");
    return data;
  } catch (error) {
    throw error;
  }
};
