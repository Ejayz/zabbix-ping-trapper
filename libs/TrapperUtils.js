const { log_file } = require("./log_file");
const { getCurrentTimestamp, calculatable } = require("./timestamp");
const zabbix = require("zabbix-promise");

const PostPing = async (IP, ZABBIX_HOST, ZABBIX_KEY, ZABBIX_SERVER, data) => {
  try {
    const result = await zabbix.sender({
      server: ZABBIX_SERVER,
      host: ZABBIX_HOST,
      key: ZABBIX_KEY,
      value: data,
    });
    log_file(
      calculatable() + ` - ${IP} Ping Trapper was sent with ` + data + ` ms value.`
    );
    console.log(
      getCurrentTimestamp() +
        ` - ${IP} Ping Trapper was sent with ` +
        data +
        ` ms value.`
    );
  } catch (error) {
    log_file(
      calculatable() + ` - ${IP} Ping Trapper encountered an error:` + error
    );
    console.log(
      calculatable() + ` - ${IP} Ping Trapper encountered an error:` + error
    );
  }
};

const PostPacketloss = async (
  IP,
  ZABBIX_HOST,
  ZABBIX_KEY,
  ZABBIX_SERVER,
  data
) => {
  try {
    await zabbix.sender({
      server: ZABBIX_SERVER,
      host: ZABBIX_HOST,
      key: ZABBIX_KEY,
      value: data,
    });

    log_file(
      calculatable() +
        ` - ${IP} Packetloss Trapper was sent with ` +
        data +
        ` % value.`
    );
    console.log(
      calculatable() +
        ` - ${IP} Packetloss Trapper was sent with ` +
        data +
        ` % value.`
    );
  } catch (error) {
    log_file(
      calculatable() + ` - ${IP} Packetloss Trapper encountered an error:` + error
    );
    console.log(
      calculatable() +
        ` - ${IP} Packetloss Trapper encountered an error:` +
        error
    );
  }
};
module.exports = { PostPing, PostPacketloss };
