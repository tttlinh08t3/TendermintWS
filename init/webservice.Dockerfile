FROM node:14
WORKDIR /app

ENV GIT_URL="https://github.com/tttlinh08t3/TendermintWS/archive/main.zip"

RUN wget "${GIT_URL}" -P /app

RUN unzip /app/main.zip

WORKDIR /app/TendermintWS-main/webservice

RUN npm install

CMD npm start