# pull the base image
FROM node:lts-alpine

# set the working direction
WORKDIR /app

# install app dependencies
COPY package*.json .

COPY yarn.lock .

COPY .eslintrc.js .

COPY .prettierrc.js .

RUN yarn install

# add app
COPY . ./

EXPOSE 3000 

# start app
CMD ["yarn", "start"]
