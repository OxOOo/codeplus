# Code+报名网站

### 部署

#### 安装docker和docker-compose

```sh
> sudo apt install docker.io
> sudo curl -L https://github.com/docker/compose/releases/download/1.17.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
> sudo chmod +x /usr/local/bin/docker-compose
```

#### 目录&配置

```sh
> mkdir -p data/logs
> mkdir -p repositories
> cp config.example.yml config.yml
```

#### 安装&部署

```sh
> sudo docker-compose build
> sudo docker-compose up -d
```

### 个人信息逻辑

报名比赛需要`邮箱`,`帐号`,`详细资料`

修改邮箱需要`帐号`