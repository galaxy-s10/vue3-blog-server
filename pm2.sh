#!/usr/bin/env bash
###
# Author: shuisheng
# Date: 2022-04-26 01:54:48
# Description: https://github.com/galaxy-s10/sh/blob/master/pm2.sh
# Email: 2274751790@qq.com
# FilePath: /vue3-blog-server/pm2.sh
# Github: https://github.com/galaxy-s10
# LastEditTime: 2022-08-25 03:40:44
# LastEditors: shuisheng
###

# 该pm2.sh文件会在Jenkins构建完成后被执行
# 注意:JOBNAME=$1,这个等号左右不能有空格！
JOBNAME=$1      #约定$1为任务名
ENV=$2          #约定$2为环境
WORKSPACE=$3    #约定$3为Jenkins工作区
PORT=$4         #约定$4为端口号
TAG=$5          #约定$5为git标签
PUBLICDIR=/node #约定公共目录为/node

if ! type pm2 >/dev/null 2>&1; then
  echo pm2未安装,先全局安装pm2
  npm i pm2 -g
else
  echo pm2已安装
fi

if ! type yarn >/dev/null 2>&1; then
  echo yarn未安装,先全局安装yarn
  npm i yarn -g
else
  echo yarn已安装
fi

# 注意：要先进入项目所在的目录，然后再执行pm2命令!!!
# 否则的话约等于在其他目录执行npm run dev,如果所在的目录没有package.json文件就会报错！
cd $PUBLICDIR/$JOBNAME/$ENV

echo 删除node_modules:
rm -rf node_modules

echo 查看npm版本:
npm -v

echo 设置npm淘宝镜像:
npm config set registry http://registry.npm.taobao.org/

echo 查看当前npm镜像:
npm get registry

echo 查看yarn版本:
yarn -v

echo 设置yarn淘宝镜像:
yarn config set registry https://registry.npm.taobao.org

echo 查看当前yarn镜像:
yarn config get registry

echo 开始安装依赖:
yarn install

echo 删除旧的pm2服务:
pm2 del $JOBNAME-$ENV-$PORT

echo 使用pm2维护:
# pm2 start ./src/index.ts --name $JOBNAME-$ENV --interpreter ./node_modules/.bin/nodemon
# pm2 start ./src/index.ts --name $JOBNAME-$ENV --interpreter ./node_modules/.bin/ts-node
# pm2 start --name $JOBNAME-$ENV ts-node -- -P tsconfig.json ./src/index.ts
npx cross-env NODE_APP_RELEASE_PROJECT_NAME=$JOBNAME NODE_APP_RELEASE_PROJECT_ENV=$ENV NODE_APP_RELEASE_PROJECT_PORT=$PORT pm2 start --name $JOBNAME-$ENV-$PORT ts-node -- -P tsconfig.json ./src/index.ts
pm2 save

# echo 使用pm2维护:
# pm2 start $PUBLICDIR/$JOBNAME/app.js --name $JOBNAME
