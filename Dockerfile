FROM node:latest

RUN apt update -y
RUN apt install -y sqlite3

RUN npm install web-push
RUN npm install express
RUN npm install sqlite3
RUN mkdir -p /push
WORKDIR /push

EXPOSE 80

CMD node app.js