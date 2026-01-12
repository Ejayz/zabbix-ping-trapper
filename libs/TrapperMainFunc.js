const { getCurrentTimestamp, calculatable } = require("./timestamp");
const ping = require("net-ping");
const { PostPing, PostPacketloss } = require("./TrapperUtils");
const cron = require("cron");
const { log_file } = require("./log_file");

const Process = async (
  IP,
  PACKETLOSS_INTERVAL,
  PING_ZABBIX_SERVER,
  PING_ZABBIX_HOST,
  PING_ZABBIX_KEY,
  PACKETLOSS_ZABBIX_SERVER,
  PACKETLOSS_ZABBIX_KEY,
  PACKETLOSS_ZABBIX_HOST,
  PING_TIMEOUT,
  RETRIES,
  CRON
) => {
  let pingCount = 0;
  let pingFailed = 0;
  let totalTime = 0;

  cron.CronJob.from({
    cronTime: CRON,
    onTick: function () {
      const session = ping.createSession({
        networkProtocol: ping.NetworkProtocol.IPv4,
        packetSize: 16,
        retries: RETRIES,
        sessionId: process.pid % 65535,
        timeout: PING_TIMEOUT,
        ttl: 128,
      });

      session.pingHost(IP, function (error, target, sent, rcvd) {
        if (error) {
          log_file(calculatable() + " - Ping request failed: " + error.toString());
          console.log(
            calculatable() +
              ` - ${IP} Ping request failed: ` +
              error.toString()
          );
          pingFailed++;
        } else {
          PostPing(
            IP,
            PING_ZABBIX_HOST,
            PING_ZABBIX_KEY,
            PING_ZABBIX_SERVER,
            rcvd - sent
          );
          pingCount++;
        }
        totalTime++;

        if (totalTime == PACKETLOSS_INTERVAL) {
          const percentage = (pingFailed / totalTime) * 100;
          PostPacketloss(
            IP,
            PACKETLOSS_ZABBIX_HOST,
            PACKETLOSS_ZABBIX_KEY,
            PACKETLOSS_ZABBIX_SERVER,
            percentage.toFixed(2)
          );
          pingCount = 0;
          pingFailed = 0;
          totalTime = 0;
        }
      });
    },
    start: true,
  });
};
module.exports = { Process };
