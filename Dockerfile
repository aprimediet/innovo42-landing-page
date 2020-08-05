FROM aprimediet/alpine-nodejs:3.10
LABEL maintainer="<Muhamad Aditya Prima> aprimediet@gmail.com"

ENV NODE_ENV=development

# SET WORKDIR
WORKDIR /usr/local/app

RUN apk update && apk upgrade && \
    apk add --update --no-cache \
    gifsicle autoconf libtool \
    git automake nasm zlib build-base \
    libpng libpng-dev zlib-dev \
    optipng jpeg jpeg-dev libjpeg

# INSTALL YARN
RUN npm i -g yarn

# COPY SOURCE TO IMAGE
ADD . ./

# INSTALL REQUIRED DEPENDENCIES
RUN yarn install --production=false && sleep 3 && \
    yarn build

FROM aprimediet/alpine-nginx:latest
LABEL maintainer="<Muhamad Aditya Prima> aprimediet@gmail.com"

# SET WORKDIR
WORKDIR /usr/www/html

# COPY NGINX PRODUCTION SCRIPT
# ADD deploy /

COPY --from=0 /usr/local/app/xdist/ ./