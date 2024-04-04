require("dotenv").config();
const db = require("../Models");
const Tutorial = db.tutorials;

const argon2 = require("argon2");

const nodemailer = require("nodemailer");

const CryptoJS = require("crypto-js");
const secretKey = "=Zu3p~GH^t1dZk#f#g*Ry!D#_#:pkQssM=NHAr%7z#,:!rB:3~";

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

    console.log("Message sent: %s", info.messageId);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email" };
  }
};

exports.encrypt = async (email_from, email_to, file_key, message) => {
  try {
    const encryptedKey = CryptoJS.AES.encrypt(
      JSON.stringify({ email_from, email_to, file_key, message }),
      secretKey
    ).toString();

    const hash = await argon2.hash(encryptedKey);

    const tutorial = {
      file_key: hash,
    };
    Tutorial.create(tutorial)
      .then(async (_) => {
        await sendEmail(email_from, email_to, encryptedKey, message);
        console.log("Email Sent", encryptedKey);
      })
      .catch((err) => {
        console.log(err.message);
      });

    return encryptedKey;
  } catch (error) {
    return error.message;
  }
};

exports.decrypt = async (key) => {
  //TODO: @Jerry check db for provided key. If not found, return error. If found, proceed with decryption.

  try {

    

    const data = Tutorial.findOne({ where: { file_key: key } });

    if (data == null || data == "") {
      return "No Data found!";
    }

    const decryptedKey = CryptoJS.AES.decrypt(key, secretKey).toString(
      CryptoJS.enc.Utf8
    );

    return JSON.parse(decryptedKey).file_key;
  } catch (error) {
    return error.message ?? "Key Is Malinformed!";
  }
};
