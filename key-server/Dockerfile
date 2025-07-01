FROM node:18-alpine

# Install nginx
RUN echo "http://dl-4.alpinelinux.org/alpine/v3.3/main" >> /etc/apk/repositories && \
    apk add --update nginx && \
    rm -rf /var/cache/apk/* && \
    chown -R nginx:www-data /var/lib/nginx

COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
WORKDIR /app
COPY . .
# Install dependencies including TypeScript and Knex globally
RUN npm install && \
    npm install -g typescript && \
    npm run build
CMD [ "sh", "scripts/start.sh"]
