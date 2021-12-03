FROM node:14
WORKDIR /app

ENV GIT_URL="https://github.com/tttlinh08t3/n10660569_TendermintWS/archive/main.zip"

RUN wget "${GIT_URL}" -P /app

RUN unzip /app/main.zip

WORKDIR /app/n10660569_TendermintWS-main/tendermint-webservice

RUN npm install

CMD npm start