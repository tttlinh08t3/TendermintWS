FROM gradle:7.3.0-jdk11 AS builder

WORKDIR /app

ENV GIT_URL="https://github.com/tttlinh08t3/n10660569_TendermintWS/archive/main.zip"

RUN wget "${GIT_URL}" -P /app

RUN unzip /app/main.zip

WORKDIR /app/n10660569_TendermintWS-main /tendermint-abci 

USER root 
RUN chown -R gradle /app/n10660569_TendermintWS-main/tendermint-abci
USER gradle              

RUN ./gradlew clean

RUN ./gradlew build --no-daemon

EXPOSE 26658

ENTRYPOINT ["./gradlew"]
CMD ["run", "--no-daemon"]
