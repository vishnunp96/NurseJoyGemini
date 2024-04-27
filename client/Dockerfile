FROM node:latest
LABEL authors="vishnunp"

WORKDIR /app
COPY . .
RUN npm install --quiet


ENTRYPOINT ["npm", "start"]