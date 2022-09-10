# 简介

基于 Typescript + Node 搭建的后端项目模板，并主要使用了以下插件：

- koa
- sequelize
- mysql2
- redis
- node-schedule
- nodemailer
- jsonwebtoken
- socket.io

# 接口

> Apifox: [https://www.apifox.cn/apidoc/shared-e73bb55d-ccdd-40a2-ab41-961e1ffcfa10/doc-543592](https://www.apifox.cn/apidoc/shared-e73bb55d-ccdd-40a2-ab41-961e1ffcfa10/doc-543592)，绝大部分接口都写了，可能还有一些接口没写~

# 运行

## 安装依赖

```bash
yarn install
```

## 启动项目

```bash
# yarn run start，运行在3300端口
yarn run start
# 或者yarn run start:beta，运行在3300端口
yarn run start:beta
# 或者yarn run start:prod，运行在3200端口
yarn run start:prod
```

## 注意事项

`yarn start` 启动后，会默认在 src/config/secret.ts 生成秘钥文件，请在该文件里面填写本项目所需的秘钥信息~

# 环境

node 版本：v14.17.0
