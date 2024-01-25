import { PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';

export const JWT_SECRET = '**********'; // jwt秘钥

export const QINIU_ACCESSKEY = '**********'; // 七牛云秘钥
export const QINIU_SECRETKEY = '**********'; // 七牛云秘钥
export const QINIU_CALLBACK_URL = '**********'; // 七牛云回调

export const WWW_QQ_CLIENT_ID = '**********'; // qq登录APP ID
export const WWW_QQ_CLIENT_SECRET = '**********'; // qq登录APP Key
export const WWW_QQ_REDIRECT_URI = '**********'; // qq登录回调地址
export const ADMIN_QQ_CLIENT_ID = '**********'; // qq登录APP ID
export const ADMIN_QQ_CLIENT_SECRET = '**********'; // qq登录APP Key
export const ADMIN_QQ_REDIRECT_URI = '**********'; // qq登录回调地址

export const GITHUB_CLIENT_ID = '**********'; // github登录APP ID
export const GITHUB_CLIENT_SECRET = '**********'; // github登录APP Key
export const GITHUB_REDIRECT_URI =
  '**************************************************'; // github登录回调地址

export const GAODE_WEB_IP_URL = '**********'; // 高德地图url
export const GAODE_WEB_IP_KEY = '**********'; // 高德地图key

export const QQ_EMAIL_USER = '**********'; // qq邮箱auth的用户
export const QQ_EMAIL_PASS = '**********'; // qq邮箱auth的秘钥

export const IP_WHITE_LIST = ['127.0.0.1']; // ip白名单

export const MYSQL_CONFIG = {
  docker: {
    container: '**********',
    image: '**********',
    port: { 3306: 3306 },
    MYSQL_ROOT_PASSWORD: '**********',
    volume: '**********',
  },
  database:
    PROJECT_ENV !== PROJECT_ENV_ENUM.prod ? `************` : '************',
  username: '**********',
  password: '**********',
  host: '**********',
  port: 666,
}; // mysql配置

export const SSH_CONFIG = {
  username: '**********',
  password: '**********',
  host: '**********',
  port: 666,
}; // ssh配置

export enum REDIS_DATABASE {
  blog,
  live,
}

export const REDIS_CONFIG = {
  database: REDIS_DATABASE.blog,
  socket: {
    port: 666,
    host: '**********',
  },
  username: '**********',
  password: '**********',
}; // redis配置
