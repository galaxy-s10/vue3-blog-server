export const PROJECT_NAME = process.env.NODE_APP_RELEASE_PROJECT_NAME;
export const PROJECT_ENV = process.env.NODE_APP_RELEASE_PROJECT_ENV;
export const PROJECT_PORT = process.env.NODE_APP_RELEASE_PROJECT_PORT;

// 发送邮件结果类型
export const VERIFY_EMAIL_RESULT_CODE = {
  ok: '发送成功!',
  more: '一天只能发5次验证码!',
  later: '一分钟内只能发1次验证码，请稍后再试!',
  err: '验证码错误或已过期!',
  system: '发送邮件错误!',
};

// redis前缀
export const REDIS_PREFIX = {
  emailLogin: `${PROJECT_NAME}-${PROJECT_ENV}-emailLogin`, // 登录不区分前后台
  emailRegister: `${PROJECT_NAME}-${PROJECT_ENV}-emailRegister`, // 注册不区分前后台
  userBindEmail: `${PROJECT_NAME}-${PROJECT_ENV}-userBindEmail`,
  userCancelBindEmail: `${PROJECT_NAME}-${PROJECT_ENV}-userCancelBindEmail`,
  chatInfo: `${PROJECT_NAME}-${PROJECT_ENV}-chatInfo`,
};

// 平台类型
export const THIRD_PLATFORM = {
  website: 1, // 站内
  qq_www: 2, // qq前台
  qq_admin: 3, // qq后台
  github: 4, // github
  email: 5, // 邮箱
};

// 监控任务
export const MONIT_JOB = {
  MEMORY: 'monitMemoryJob', // 监控内存任务
  PROCESS: 'monitProcessJob', // 监控node进程任务
  BACKUPSDB: 'monitBackupsDbJob', // 监控备份数据库任务
  QINIUCDN: 'monitQiniuCDNJob', // 监控七牛云cdn任务
};

// 监控类型
export const MONIT_TYPE = {
  MEMORY_LOG: 1, // 服务器内存日志
  MEMORY_THRESHOLD: 2, // 服务器内存达到阈值
  QINIU_CDN: 3, // 监控七牛云
  VUE3_BLOG_SERVER_NODE_PROCESS: 4, // 监控node进程
  RESTART_PM2: 5, // 重启pm2
  CLEAR_CACHE: 6, // 清除buff/cache
  BACKUPS_DB_OK: 7, // 备份数据库成功
  BACKUPS_DB_ERR: 8, // 备份数据库失败
};

export const QINIU_CDN_DOMAIN = 'resource.hsslive.cn';
export const QINIU_CDN_URL = 'https://resource.hsslive.cn/';
export const QINIU_BUCKET = 'hssblog'; // 七牛云bucket
export const QINIU_PREFIX = {
  'image/': 'image/',
  'backupsDatabase/': 'backupsDatabase/',
  'media/': 'media/',
  'nuxt-blog-client/': 'nuxt-blog-client/',
};
