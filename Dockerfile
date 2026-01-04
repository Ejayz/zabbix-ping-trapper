
# Use LTS (cron + native deps are more stable)
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Set default environment variables (can be overridden)
ENV IP=1.1.1.1
ENV CRON="*/1 * * * * *"
ENV PACKETLOSS_COUNT=60

# Zabbix trapper as JSON string
ENV ZABBIX_TRAPPER='[  {    "server": "172.16.4.150",    "host": "172.16.4.139",    "key": "Trapper.Ping"  },  {    "server": "172.16.4.150",    "host": "172.16.4.139",    "key": "Trapper.PacketLoss"  }]'

# Ensure node runs as PID 1 correctly
CMD ["node", "index.js"]
