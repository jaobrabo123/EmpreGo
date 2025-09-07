FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY ./prisma ./prisma
COPY .env ./

RUN npm install

COPY ./src ./src
COPY ./public ./public
COPY ./server.js ./server.js

EXPOSE 3001

CMD ["node", "server.js"]
