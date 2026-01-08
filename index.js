const ping = require("net-ping");
const cron = require("cron");
const zabbix = require("zabbix-promise");
const dotenv = require("dotenv");

const { getCurrentTimestamp } = require("./libs/timestamp");

dotenv.config();

//IP 1 declared in environment variable
const IP1 = process.env.IP1 || "1.1.1.1";
//IP 1 declared in environment variable
const IP2 = process.env.IP2 || "8.8.8.8";
//Cron job interval
const CRON = process.env.CRON || "*/1 * * * * *";
//Interval when to send packetloss data to trapper.
const PACKETLOSS_INTERVAL = Number(process.env.PACKETLOSS_INTERVAL) || 60;
//Object array information of trapper
const HOST1 = JSON.parse(process.env.HOST1) || [
  {
    server: "172.16.4.150",
    host: "172.16.4.139",
    key: "Trapper.Ping1",
  },
  {
    server: "172.16.4.150",
    host: "172.16.4.139",
    key: "Trapper.PacketLoss1",
  },
];
const HOST2 = JSON.parse(process.env.HOST2) || [
  {
    server: "172.16.4.150",
    host: "172.16.4.139",
    key: "Trapper.Ping1",
  },
  {
    server: "172.16.4.150",
    host: "172.16.4.139",
    key: "Trapper.PacketLoss1",
  },
];

let pingCount = 0;
let pingFailed = 0;
let totalTime = 0;

let pingCount1 = 0;
let pingFailed1 = 0;
let totalTime1 = 0;

cron.CronJob.from({
  cronTime: CRON,
  onTick: function () {
    const session = ping.createSession({
      networkProtocol: ping.NetworkProtocol.IPv4,
      packetSize: 16,
      retries: 0,
      sessionId: process.pid % 65535,
      timeout: 600,
      ttl: 128,
    });

    session.pingHost(IP1, function (error, target, sent, rcvd) {
      if (error) {
        console.log(
          getCurrentTimestamp() + " IP1 Ping timed out:",
          rcvd - sent,
          "ms"
        );

        pingFailed++;
      } else {
        console.log(getCurrentTimestamp() + " IP1 Ping:", rcvd - sent, "ms");
        IP1_Ping(rcvd - sent);
        pingCount++;
      }
      totalTime++;

      if (totalTime == PACKETLOSS_INTERVAL) {
        console.log(getCurrentTimestamp() + " Calculating Packetloss for IP1");
        const percentage = (pingFailed / totalTime) * 100;
        IP1_PacketLoss(`${percentage}`);
        console.log(
          getCurrentTimestamp() + " Packetloss for IP1 sent to Zabbix Trapper"
        );
        pingCount = 0;
        pingFailed = 0;
        totalTime = 0;
      }
    });
  },
  start: true,
});

cron.CronJob.from({
  cronTime: CRON,
  onTick: function () {
    const session = ping.createSession({
      networkProtocol: ping.NetworkProtocol.IPv4,
      packetSize: 16,
      retries: 0,
      sessionId: process.pid % 65535,
      timeout: 600,
      ttl: 128,
    });
    session.pingHost(IP2, function (error, target, sent, rcvd) {
      if (error) {
        console.log(
          getCurrentTimestamp() + " IP2 Ping timed out:",
          rcvd - sent,
          "ms"
        );
        pingFailed1++;
      } else {
        IP2_Ping(rcvd - sent);
        console.log(getCurrentTimestamp() + " IP2 Ping:", rcvd - sent, "ms");
        pingCount1++;
      }
      totalTime1++;

      if (totalTime1 == PACKETLOSS_INTERVAL) {
        console.log(getCurrentTimestamp() + " Calculating Packetloss for IP2");
        const percentage = (pingFailed1 / totalTime1) * 100;
        IP2_PacketLoss(`${percentage}`);
        console.log(
          getCurrentTimestamp() + " Packetloss for IP2 sent to Zabbix Trapper"
        );
        pingCount1 = 0;
        pingFailed1 = 0;
        totalTime1 = 0;
      }
    });
  },
  start: true,
});

const IP1_Ping = async (data) => {
  try {
    const result = await zabbix.sender({
      server: HOST1[0].server,
      host: HOST1[0].host,
      key: HOST1[0].key,
      value: data,
    });
    console.log(getCurrentTimestamp() + " Host 1 Ping Trapper was sent");
  } catch (error) {
    console.log(
      getCurrentTimestamp() +
        " Host 1 Ping Trapper encountered an error:" +
        error
    );
  }
};
const IP1_PacketLoss = async (data) => {
  try {
    const result = await zabbix.sender({
      server: HOST1[1].server,
      host: HOST1[1].host,
      key: HOST1[1].key,
      value: data,
    });
    console.log(getCurrentTimestamp() + " Host 1 Packetloss Trapper was sent");
  } catch (error) {
    console.log(
      getCurrentTimestamp() +
        " Host 1  Packetloss encountered an error:" +
        error
    );
  }
};
const IP2_Ping = async (data) => {
  try {
    const result = await zabbix.sender({
      server: HOST2[0].server,
      host: HOST2[0].host,
      key: HOST2[0].key,
      value: data,
    });
    console.log(getCurrentTimestamp() + " Host 2 Ping Trapper was sent");
  } catch (error) {
    console.log(
      getCurrentTimestamp() +
        " Host 2 Ping Trapper encountered an error:" +
        error
    );
  }
};
const IP2_PacketLoss = async (data) => {
  try {
    const result = await zabbix.sender({
      server: HOST2[1].server,
      host: HOST2[1].host,
      key: HOST2[1].key,
      value: data,
    });
    console.log(getCurrentTimestamp() + " Host 2 Packetloss Trapper was sent.");
  } catch (error) {
    console.log(
      getCurrentTimestamp() + " Host 2 Packetloss encountered an error:" + error
    );
  }
};
