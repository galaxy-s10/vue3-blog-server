FROM node:16.19.0
EXPOSE 3300

WORKDIR /node/vue3-blog-server/beta

RUN cd /node/vue3-blog-server/beta

CMD [ "node","./dist/index.js" ]
