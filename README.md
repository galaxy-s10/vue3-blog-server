# 项目简介

基于 Typescript + Node + Koa2 搭建的博客后端

# 线上地址

[https://admin.hsslive.cn](https://admin.hsslive.cn)

# 接口文档

[apifox](https://apifox.com/apidoc/shared-e73bb55d-ccdd-40a2-ab41-961e1ffcfa10)，绝大部分接口都写了，可能还有一些接口没写~

# 安装依赖

```bash
pnpm install
```

> 更新 billd 依赖：

```bash
pnpm i billd-utils@latest billd-html-webpack-plugin@latest
```

# 调试

> 注意：项目启动后，会默认在 src/config/secret.ts 生成秘钥文件，请在该文件里面填写本项目所需的秘钥信息~

```bash
# npm run dev，运行在3300端口
npm run dev
# 或者npm run dev:beta，运行在3300端口
npm run dev:beta
# 或者npm run dev:prod，运行在3200端口
npm run dev:prod
```

# 部署（Docker）

1.执行 docker-build.sh：

```bash
sh ./deploy/docker-build.sh vue3-blog-server beta /Users/huangshuisheng/Desktop/hss/galaxy-s10 3300 v0.0.1
```

2.执行 docker-run.sh：

```bash
sh ./deploy/docker-run.sh vue3-blog-server beta /Users/huangshuisheng/Desktop/hss/galaxy-s10/vue3-blog-server 3300 v0.0.1
```

# 服务器环境

> 注意：这是服务器的环境信息，并非实际运行时的环境信息（因为使用了 Docker）

- 操作系统：CentOS Linux release 8.2.2004
- nginx 版本：1.21.4
- node 版本：14.19.0
- redis 版本：5.0.3
- mysql 版本：8.0.26
- pm2 版本：5.1.2
