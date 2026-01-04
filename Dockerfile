
# Use LTS (cron + native deps are more stable)
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git


# Install dependencies first (better cache)
COPY package*.json ./
RUN npm ci 

# Copy app source
COPY . .

# Set default environment variables (can be overridden)
ENV IP=1.1.1.1
ENV CRON="*/1 * * * * *"
ENV PACKETLOSS_COUNT=60



# Zabbix trapper as JSON string
ENV ZABBIX_TRAPPER='[  {    "server": "172.16.4.150",    "host": "172.16.4.139",    "key": "Trapper.Ping"  },  {    "server": "172.16.4.150",    "host": "172.16.4.139",    "key": "Trapper.PacketLoss"  }]'

EXPOSE 10051 


# Ensure node runs as PID 1 correctly
CMD ["node", "index.js"]
