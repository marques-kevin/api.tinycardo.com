FROM node:22-alpine

WORKDIR /usr/src/app

COPY . .

RUN yarn install
RUN yarn build

ENV NODE_ENV=production

ENV PORT=3000
EXPOSE 3000

CMD ["yarn", "pm2-runtime", "ecosystem.config.js", "--only", "application,cron"]