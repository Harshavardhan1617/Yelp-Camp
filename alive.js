const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const https = require("https");

const logFile = path.join(__dirname, "server_log.txt");
const intervalMinutes = 14;
const retentionDays = 2;
const bufferSize = 10;

let logBuffer = [];

async function startKeepAlive(url) {
  setInterval(() => sendRequest(url), intervalMinutes * 60 * 1000);
  setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);
  sendRequest(url);
  await cleanOldLogs();
}

function sendRequest(url) {
  const now = new Date();
  https
    .get(url, (res) => {
      bufferLog(`${now.toISOString()} - Status: ${res.statusCode}`);
    })
    .on("error", (err) => {
      bufferLog(`${now.toISOString()} - Error: ${err.message}`);
    });
}

function bufferLog(log) {
  logBuffer.push(log);
  if (logBuffer.length >= bufferSize) {
    flushLogs();
  }
}

function flushLogs() {
  if (logBuffer.length > 0) {
    fs.appendFile(logFile, logBuffer.join("\n") + "\n", (err) => {
      if (err) console.error("Error writing to log:", err);
      logBuffer = [];
    });
  }
}

async function cleanOldLogs() {
  try {
    const data = await fsPromises.readFile(logFile, "utf8");
    const lines = data.split("\n");
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - retentionDays);

    const recentLogs = lines.filter((line) => {
      if (!line.trim()) return false;
      const logDate = new Date(line.split(" - ")[0]);
      return logDate >= twoDaysAgo;
    });

    await fsPromises.writeFile(logFile, recentLogs.join("\n") + "\n");
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Error cleaning old logs:", error);
    }
  }
}

async function getLogs() {
  try {
    const data = await fsPromises.readFile(logFile, "utf8");
    return data.split("\n").filter((line) => line.trim() !== "");
  } catch (error) {
    if (error.code === "ENOENT") {
      return ["No logs found"];
    }
    console.error("Error reading log file:", error);
    return ["Error reading log file"];
  }
}

module.exports = { startKeepAlive, getLogs };
