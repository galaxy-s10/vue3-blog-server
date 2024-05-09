#!/usr/bin/env bash
###
# Author: shuisheng
# Date: 2022-08-09 12:55:47
# Description: https://github.com/galaxy-s10/sh/
# Email: 2274751790@qq.com
# FilePath: /vue3-blog-server/deploy/docker-build.sh
# Github: https://github.com/galaxy-s10
# LastEditors: shuisheng
# LastEditTime: 2024-05-06 14:27:03
###

# 生成头部文件快捷键: ctrl+cmd+i

# docker项目, 一般流程是在jenkins里面执行项目里的docker-build.sh进行构建,
# 构建完成后会连接ssh, 执行/node/sh/docker.sh, 并且执行/node/xxx/docker-run.sh
# 最后, 服务器的/node/sh/docker.sh会执行清除buff/cache操作

# 注意: JOBNAME=$1, 这个等号左右不能有空格!
JOBNAME=$1      #约定$1为任务名
ENV=$2          #约定$2为环境
WORKSPACE=$3    #约定$3为Jenkins工作区
PORT=$4         #约定$4为端口号
TAG=$5          #约定$5为git标签
PUBLICDIR=/node #约定公共目录为/node

# echo 删除node_modules:
# rm -rf node_modules

# echo 查看node版本:
# node -v

# echo 查看npm版本:
# npm -v

# echo 设置npm淘宝镜像:
# npm config set registry https://registry.npmmirror.com/

# echo 查看当前npm镜像:
# npm get registry

# if ! type pnpm >/dev/null 2>&1; then
#   echo 'pnpm未安装,先全局安装pnpm'
#   npm i pnpm -g
# else
#   echo 'pnpm已安装'
# fi

# echo 查看pnpm版本:
# pnpm -v

# echo 设置pnpm淘宝镜像:
# pnpm config set registry https://registry.npmmirror.com/
# pnpm config set @billd:registry https://registry.hsslive.cn/

# echo 查看当前pnpm镜像:
# pnpm config get registry
# pnpm config get @billd:registry

# # 注意：要先进入项目所在的目录，然后再执行pm2命令!!!
# # 否则的话约等于在其他目录执行npm run dev,如果所在的目录没有package.json文件就会报错！

# if [ $ENV != 'null' ]; then
#   echo 当前环境:$ENV
# else
#   echo 当前环境是null
# fi

# echo 开始安装依赖:
# pnpm install

# echo 开始打包:
# pnpm run build

# 本机写死测试：
# sh ./deploy/docker-build.sh vue3-blog-server beta /Users/huangshuisheng/Desktop/hss/galaxy-s10 3300 v0.0.1

# 服务器写死测试：
# sh ./deploy/docker-build.sh vue3-blog-server beta /var/lib/jenkins/workspace/vue3-blog-server 3300 v0.0.1
# sh ./deploy/docker-build.sh vue3-blog-server prod /var/lib/jenkins/workspace/vue3-blog-server 3200 v0.0.1

echo 当前目录
echo $(pwd)

echo 执行docker-build.sh

DOCKER_BUILDKIT=0 docker build -t $JOBNAME-$ENV-$PORT . \
  --build-arg BILLD_JOBNAME=$JOBNAME \
  --build-arg BILLD_ENV=$ENV \
  --build-arg BILLD_WORKSPACE=$WORKSPACE \
  --build-arg BILLD_PORT=$PORT \
  --build-arg BILLD_TAG=$TAG \
  --build-arg BILLD_PUBLICDIR=$PUBLICDIR
