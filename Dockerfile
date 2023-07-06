FROM ubuntu:20.04
FROM node:latest

WORKDIR /app

COPY tsconfig.json /app/tsconfig.json
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm i

COPY . .
RUN npm run build

CMD npm run start