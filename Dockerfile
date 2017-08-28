FROM node:boron

WORKDIR /usr/src/app

COPY app.js /usr/src/app/

ENV connectionString your-eventhub-namespace
ENV offlineMin 0
ENV offlineMax 1
ENV interval 15

RUN cd /usr/src/app && npm install

CMD [ "npm", "start" ]
