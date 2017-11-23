FROM node:8.9.1
MAINTAINER Yu Chen <believe.chenyu@gmail.com>

# install supervisor
RUN \
    apt-get update && \
    apt-get install -y supervisor && \
    apt-get clean
RUN cp /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
ADD ./etc/srv.conf /etc/supervisor/conf.d

# build
WORKDIR /srv/
ADD package.json /srv/package.json
ADD package-lock.json /srv/package-lock.json
RUN \
    npm install cnpm -g --registry=https://registry.npm.taobao.org && \
    cnpm install

ADD *.md /srv/
ADD *.js /srv/

EXPOSE 4399

CMD supervisord -n
