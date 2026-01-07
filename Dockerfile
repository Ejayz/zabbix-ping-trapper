
# Use buildx platform variable to support multi-arch
FROM --platform=$BUILDPLATFORM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

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
ENV IP1="1.1.1.1"
ENV IP2 = "8.8.8.8"
ENV CRON="*/1 * * * * *"
ENV PACKETLOSS_COUNT=60

# Zabbix trapper as JSON string
ENV HOST1='[{   "server": "172.16.4.150",    "host": "172.16.4.139",    "key": "Trapper.Ping"  },{"server": "172.16.4.150","host": "172.16.4.139",    "key": "Trapper.PacketLoss"  },{   "server": "172.16.4.150",    "host": "172.16.4.139",    "key": "Trapper.Ping"  },  {    "server": "172.16.4.150",    "host": "172.16.4.139",    "key": "Trapper.PacketLoss"  }]'
ENV HOST2='[{   "server": "172.16.4.150",    "host": "172.16.4.139",    "key": "Trapper.Ping"  },{"server": "172.16.4.150","host": "172.16.4.139",    "key": "Trapper.PacketLoss"  },{   "server": "172.16.4.150",    "host": "172.16.4.139",    "key": "Trapper.Ping"  },  {    "server": "172.16.4.150",    "host": "172.16.4.139",    "key": "Trapper.PacketLoss"  }]'


EXPOSE 10051 
EXPOSE 162


# Ensure node runs as PID 1 correctly
CMD ["node", "index.js"]
