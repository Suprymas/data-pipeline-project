FROM node:24 as base
WORKDIR /app
COPY package.json ./


FROM base as OPC-Server

RUN npm install --no-optional
COPY OPC-Server.js .
CMD ["node", "OPC-Server.js"]


FROM base as MQTT-Agent

RUN npm install
COPY MQTT-Agent.js .
CMD ["node", "MQTT-Agent.js"]
