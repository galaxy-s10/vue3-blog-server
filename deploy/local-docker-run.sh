#!/usr/bin/env bash
###
# Author: shuisheng
# Date: 2023-03-01 22:42:02
# Description: https://github.com/galaxy-s10/sh/
# Email: 2274751790@qq.com
# FilePath: /vue3-blog-server/deploy/local-docker-run.sh
# Github: https://github.com/galaxy-s10
# LastEditors: shuisheng
# LastEditTime: 2024-03-19 15:18:26
###

# 生成头部文件快捷键: ctrl+cmd+i

# docker项目, 一般流程是在jenkins里面执行项目里的docker-build.sh进行构建,
# 构建完成后会连接ssh, 执行/node/sh/docker.sh, 并且执行/node/xxx/docker-run.sh
# 最后, 服务器的/node/sh/docker.sh会执行清除buff/cache操作

# 注意: JOBNAME=$1, 这个等号左右不能有空格!
JOBNAME=$1   #约定$1为任务名
ENV=$2       #约定$2为环境
WORKSPACE=$3 #约定$3为Jenkins工作区
PORT=$4      #约定$4为端口号
TAG=$5       #约定$5为git标签
# PUBLICDIR=/node #约定公共目录为/node
PUBLICDIR=/Users/huangshuisheng/Desktop/hss/galaxy-s10

echo JOBNAME: $JOBNAME
echo ENV: $ENV
echo WORKSPACE: $WORKSPACE
echo PORT: $PORT
echo TAG: $TAG

# echo 开始安装依赖:
# pnpm install

# echo 开始打包:
# pnpm run build

echo 停掉旧的容器$JOBNAME-$ENV-$PORT:
docker stop $JOBNAME-$ENV-$PORT

echo 删掉旧的容器$JOBNAME-$ENV-$PORT:
docker rm $JOBNAME-$ENV-$PORT

echo 启动新的容器$JOBNAME-$ENV-$PORT:

# 本机写死测试：
# sh ./deploy/local-docker-run.sh vue3-blog-server prod /Users/huangshuisheng/Desktop/hss/galaxy-s10/vue3-blog-server 3300 v0.0.1

# 不使用volume
# docker run --name $JOBNAME-$ENV-$PORT -d -p $PORT:$PORT $JOBNAME-$ENV-$PORT
# 使用volume
docker run --name $JOBNAME-$ENV-$PORT -d \
  -p $PORT:$PORT \
  $JOBNAME-$ENV-$PORT
