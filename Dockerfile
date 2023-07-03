FROM ubuntu:20.04
FROM node:latest

WORKDIR /app
COPY . .

RUN npm i
RUN npm run build

CMD npm run start