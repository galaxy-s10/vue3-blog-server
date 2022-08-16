#!/usr/bin/env bash
###
# Author: shuisheng
# Email: 2274751790@qq.com
# Github: https://github.com/galaxy-s10
# Date: 2022-01-21 13:43:16
# LastEditTime: 2022-08-14 02:43:17
# Description: https://gitee.com/galaxy-s10/react-blog-server
###

# 约定$1为任务名, $2为环境, $3为Jenkins工作区, $4为端口号
JOBNAME=$1 # 注意: JOBNAME=$1,这个等号左右不能有空格！
ENV=$2
WORKSPACE=$3
PORT=$4
PUBLICDIR=/node
