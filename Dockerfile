FROM node:24
WORKDIR /app
COPY OPC-Server.js package.json ./

RUN npm install

CMD ["node", "./OPC-Server.js"]
