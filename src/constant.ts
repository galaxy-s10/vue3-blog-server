export const PROJECT_NAME = process.env.NODE_APP_RELEASE_PROJECT_NAME;
export const PROJECT_ENV = process.env.NODE_APP_RELEASE_PROJECT_ENV;
export const PROJECT_PORT = process.env.NODE_APP_RELEASE_PROJECT_PORT;

export const VERIFY_EMAIL_RESULT_CODE = {
  ok: '发送成功!',
  more: '一天只能发5次验证码!',
  later: '一分钟内只能发1次验证码，请稍后再试!',
  err: '验证码错误或已过期!',
  system: '发送邮件错误!',
};

export const REDIS_PREFIX = {
  emailLogin: `${PROJECT_NAME}-${PROJECT_ENV}-emailLogin`, // 登录不区分前后台
  emailRegister: `${PROJECT_NAME}-${PROJECT_ENV}-emailRegister`, // 注册不区分前后台
  userBindEmail: `${PROJECT_NAME}-${PROJECT_ENV}-userBindEmail`,
  userCancelBindEmail: `${PROJECT_NAME}-${PROJECT_ENV}-userCancelBindEmail`,
  chatInfo: `${PROJECT_NAME}-${PROJECT_ENV}-chatInfo`,
};

export const THIRD_PLATFORM = {
  website: 1, // 站内
  qq_www: 2, // qq前台
  qq_admin: 3, // qq后台
  github: 4, // github
  email: 5, // 邮箱
};

export const MONIT_QINIUCDN_JOB = 'monitQiniuCDNJob';
export const MONIT_BACKUPSDB_JOB = 'monitBackupsDbJob';
export const MONIT_PROCESS_JOB = 'monitProcessJob';
export const MONIT_MEMORY_JOB = 'monitMemoryJob';

export const MONIT_TYPE_MEMORY_LOG = 1; // 服务器内存日志
export const MONIT_TYPE_MEMORY_THRESHOLD = 2; // 服务器内存达到阈值
export const MONIT_TYPE_QINIU_CDN = 3; // 监控七牛云
export const MONIT_TYPE_VUE3_BLOG_SERVER_NODE_PROCESS = 4; // 监控node进程
export const MONIT_TYPE_RESTART_PM2 = 5; // 重启pm2
export const MONIT_TYPE_CLEAR_CACHE = 6; // 清除buff/cache
export const MONIT_TYPE_BACKUPS_DB = 7; // 备份数据库

export const QINIU_BUCKET = 'hssblog'; // 七牛云bucket
