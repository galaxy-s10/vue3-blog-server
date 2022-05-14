# 简介

基于 Typescript + Node 搭建的后端项目模板，并主要使用了以下插件：

- koa
- sequelize
- mysql2
- redis
- node-schedule
- nodemailer
- jsonwebtoken

# 接口文档

> Apifox: [https://www.apifox.cn/apidoc/shared-e73bb55d-ccdd-40a2-ab41-961e1ffcfa10/doc-543592](https://www.apifox.cn/apidoc/shared-e73bb55d-ccdd-40a2-ab41-961e1ffcfa10/doc-543592)，大部分接口都写了，可能还有一些接口没写。

# 运行

在src/config目录下创建secret.ts文件：

```ts
export const JWT_SECRET = "xxxx"; // jwt秘钥

export const QINIU_ACCESSKEY = "xxxx"; // 七牛云秘钥
export const QINIU_SECRETKEY = "xxxx"; // 七牛云秘钥
export const QINIU_CALLBACK_URL = "xxxx"; // 七牛云回调
export const QINIU_BACKUPS_DATABASE = "xxxx"; // 七牛云数据库备份目录(开头不能带/)

export const WWW_QQ_CLIENT_ID = "xxxx"; // qq登录APP ID
export const WWW_QQ_CLIENT_SECRET = "xxxx"; // qq登录APP Key
export const WWW_QQ_REDIRECT_URI = "xxxx"; // qq登录回调地址
export const ADMIN_QQ_CLIENT_ID = "xxxx"; // qq登录APP ID
export const ADMIN_QQ_CLIENT_SECRET = "xxxx"; // qq登录APP Key
export const ADMIN_QQ_REDIRECT_URI = "xxxx"; // qq登录回调地址

export const GITHUB_CLIENT_ID = "xxxx"; // github登录APP ID
export const GITHUB_CLIENT_SECRET = "xxxx"; // github登录APP Key
export const GITHUB_REDIRECT_URI = "xxxx"; // github登录回调地址

export const GAODE_WEB_IP_URL = "xxxx"; // 高德地图url
export const GAODE_WEB_IP_KEY = "xxxx"; // 高德地图key

export const QQ_EMAIL_USER = "xxxx"; // qq邮箱auth的用户
export const QQ_EMAIL_PASS = "xxxx"; // qq邮箱auth的秘钥

export const MYSQL_CONFIG = {
  database: "xxxx",
  username: "xxxx",
  password: "xxxx",
  host: "xxxx",
  port: 3306,
};

export const SSH_CONFIG = {
  username: "xxxx",
  password: "xxxx",
  host: "xxxx",
  port: 22,
};

export const REDIS_CONFIG = {
  socket: {
    port: 6379,
    host: "xxxx",
  },
  password: "xxxx",
};

export const MAIL_OPTIONS_CONFIG = {
  from: "xxxx", // sender address
  to: "xxxx", // list of receivers
};

```

安装依赖：

```bash
yarn install
```

启动本地服务，默认运行在 `localhost:3100` 端口

```bash
yarn run start
```

# 注意

当前运行的 node 版本：v14.17.0
