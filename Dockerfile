FROM node:18.19.0

ARG BILLD_JOBNAME
ARG BILLD_ENV
ARG BILLD_WORKSPACE
ARG BILLD_PORT
ARG BILLD_TAG
ARG BILLD_PUBLICDIR


# https://medium.com/@yangcar/arg-in-dockerfile-cmd-db22c2bc7b62
# https://stackoverflow.com/questions/35560894/is-docker-arg-allowed-within-cmd-instruction/35562189#35562189
ENV BILLD_JOBNAME ${BILLD_JOBNAME}
ENV BILLD_ENV ${BILLD_ENV}
ENV BILLD_WORKSPACE ${BILLD_WORKSPACE}
ENV BILLD_PORT ${BILLD_PORT}
ENV BILLD_TAG ${BILLD_TAG}
ENV BILLD_PUBLICDIR ${BILLD_PUBLICDIR}

# https://github.com/pnpm/pnpm/issues/4495
ENV PNPM_HOME="/pnpm/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

EXPOSE ${BILLD_PORT}

WORKDIR ${BILLD_PUBLICDIR}/${BILLD_JOBNAME}/${BILLD_ENV}

COPY . .

RUN echo 设置npm淘宝镜像:
RUN npm config set registry https://registry.npmmirror.com/

RUN echo 开始全局安装pnpm:
RUN npm i pnpm -g

RUN echo 设置pnpm淘宝镜像:
RUN pnpm config set registry https://registry.npmmirror.com/
RUN pnpm config set @billd:registry https://registry.hsslive.cn/

RUN echo 开始全局安装pm2:
RUN pnpm i pm2 -g

RUN echo node版本:    $(node -v)
RUN echo npm版本:     $(npm -v)
RUN echo pnpm版本:    $(pnpm -v)
RUN echo pm2版本:     $(pm2 -v)
RUN echo git版本:     $(git --version)

RUN echo 当前路径:     $(pwd)
RUN echo 当前文件:     $(ls -al)

RUN echo JOBNAME:     ${BILLD_JOBNAME}
RUN echo ENV:         ${BILLD_ENV}
RUN echo WORKSPACE:   ${BILLD_WORKSPACE}
RUN echo TAG:         ${BILLD_TAG}
RUN echo PUBLICDIR:   ${BILLD_PUBLICDIR}

RUN echo 开始安装依赖:
RUN pnpm i

RUN echo 开始打包:
RUN npm run build

VOLUME [ ${BILLD_PUBLICDIR}/${BILLD_JOBNAME}/${BILLD_ENV} ]
VOLUME [ ${BILLD_PUBLICDIR}/backup/ ]

# pm2环境变量管理:https://pm2.io/docs/runtime/best-practices/environment-variables/
CMD pm2 -v && \
  pm2 list && \
  NODE_APP_RELEASE_PROJECT_NAME=${BILLD_JOBNAME} \
  NODE_APP_RELEASE_PROJECT_ENV=${BILLD_ENV} \
  NODE_APP_RELEASE_PROJECT_PORT=${BILLD_PORT} \
  pm2-runtime start './dist/index.js' -i 1 --name ${BILLD_JOBNAME}-${BILLD_ENV}-${BILLD_PORT}
