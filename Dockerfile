FROM node:25-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-alpine AS opc-server

WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY OPC-Server.js .
CMD ["node", "OPC-Server.js"]


FROM node:24-alpine AS mqtt-agent

WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY MQTT-Agent.js .
CMD ["node", "MQTT-Agent.js"]
