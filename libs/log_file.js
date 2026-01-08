const FileSystem = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const LOGFILE = process.env.LOGFILE || "./logs/logs.log";

const log_file = async (data) => {
  FileSystem.appendFile(LOGFILE, `${data}\n`, function (err) {
    if (err) throw err;
  });
};

module.exports = { log_file };
