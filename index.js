const ping = require("net-ping");
const cron = require("cron");
const zabbix = require("zabbix-promise");

const dotenv = require("dotenv");
dotenv.config();
console.log(JSON.parse(process.env.ZABBIX_TRAPPER)[0].server);
const IP = process.env.IP || "1.1.1.1";
const CRON = process.env.CRON || "*/1 * * * * *";
const PACKETLOSS_COUNT = Number(process.env.PACKETLOSS_COUNT) || 60;
const ZABBIX_TRAPPER = JSON.parse(process.env.ZABBIX_TRAPPER) || [
  {
    server: "172.16.4.150",
    host: "172.16.4.139",
    key: "Trapper.Ping",
  },
  {
    server: "172.16.4.150",
    host: "172.16.4.139",
    key: "Trapper.PacketLoss",
  },
];
const session = ping.createSession({
  networkProtocol: ping.NetworkProtocol.IPv4,
  packetSize: 16,
  retries: 1,
  sessionId: process.pid % 65535,
  timeout: 2000,
  ttl: 128,
});
let pingCount = 0;
let pingFailed = 0;
let totalTime = 0;
cron.CronJob.from({
  cronTime: CRON,
  onTick: function () {
    session.pingHost(IP, function (error, target, sent, rcvd) {
      Ping(rcvd - sent);
      if (error) {
        pingFailed++;
      } else {
        pingCount++;
      }
      totalTime++;

      if (totalTime == PACKETLOSS_COUNT) {
        const percentage = (pingFailed / totalTime) * 100;
        PacketLoss(`${percentage}`);
        pingCount = 0;
        pingFailed = 0;
        totalTime = 0;
      }
    });
  },
  start: true,
});

const Ping = async (data) => {
  try {
    console.log({
      server: `${ZABBIX_TRAPPER[0].server}`,
      host: `${ZABBIX_TRAPPER[0].host}`,
      key: `${ZABBIX_TRAPPER[0].key}`,
      value: data,
    });
    const result = await zabbix.sender({
      server: ZABBIX_TRAPPER[0].server,
      host: ZABBIX_TRAPPER[0].host,
      key: ZABBIX_TRAPPER[0].key,
      value: data,
    });
    console.log("Ping Trapper was sent");
  } catch (error) {
    console.log("Ping Trapper encountered an error:" + error);
  }
};
const PacketLoss = async (data) => {
  try {
    const result = await zabbix.sender({
      server: ZABBIX_TRAPPER[1].server,
      host: ZABBIX_TRAPPER[1].host,
      key: ZABBIX_TRAPPER[1].key,
      value: data,
    });
    console.log("Packetloss Trapper was sent");
  } catch (error) {
    console.log("Packetloss encountered an error:" + error);
  }
};
