module.exports = (sequelize, Sequelize) => {
  const TransferSafe = sequelize.define("transfersafe", {
    emailTo: {
      type: Sequelize.STRING,
    },
    emailFrom: {
      type: Sequelize.STRING,
    },
    file_url: {
      type: Sequelize.STRING,
    },
    file_key: {
      type: Sequelize.STRING,
    },
    message: {
      type: Sequelize.STRING,
    },
  });

  return TransferSafe;
};
