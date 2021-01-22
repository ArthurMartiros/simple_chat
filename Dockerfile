FROM node:14.15.4

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm i

COPY . .

RUN npm run build

EXPOSE 8888

CMD npm run start:prod