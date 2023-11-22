FROM node:21-alpine3.17

RUN mkdir -p /home/ubuntu/app
WORKDIR /home/ubuntu/app

ADD tsconfig.json tsconfig.json
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm i

ADD . .
RUN npm run build

CMD npm run start