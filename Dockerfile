FROM node:onbuild

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app

WORKDIR /opt/app
ADD . /opt/app

ENV NODE_ENV production
ENV DATABASE_URL "mongodb://history:everythingisawesome@ds159367-a0.mlab.com:59367,ds159367-a1.mlab.com:59367/history?replicaSet=rs-ds159367"
ENV ODDS_TYPES 0,1,3,4,5,6291457,8388608
ENV SPORTS 1,3,4,5,6,7,8
ENV BOOKMAKERS 83

ENV NODE_ENV production
CMD ["npm", "start"]