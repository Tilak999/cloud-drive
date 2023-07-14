FROM ubuntu:20.04 
ENV NODE_VERSION=18.16.1

# Install system specific dependencies 
RUN apt-get clean all 
RUN apt-get update -y 
RUN apt-get install -y curl 
RUN apt-get install -y wget 
RUN apt-get install -y git 

#Install node and npm 
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN mkdir -p /home/ubuntu/app
WORKDIR /home/ubuntu/app
RUN mkdir -p cachedFiles

ADD tsconfig.json tsconfig.json
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm i

ADD . .
RUN npm run build

CMD npm run start