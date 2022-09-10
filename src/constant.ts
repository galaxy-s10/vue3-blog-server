import path from 'path';

export const PROJECT_NAME = process.env.NODE_APP_RELEASE_PROJECT_NAME as string;
export const PROJECT_ENV = process.env.NODE_APP_RELEASE_PROJECT_ENV as string;
export const PROJECT_PORT = process.env.NODE_APP_RELEASE_PROJECT_PORT as string;

export const staticDir = path.join(__dirname, './public/'); // 静态目录
export const uploadDir = path.join(__dirname, './upload/'); // 上传文件接口接收到的文件存放的目录
export const qiniuProgressV1Log = path.join(uploadDir, 'progressv1.log'); // 上传文件接口接收到的文件存放的目录
export const qiniuProgressV2Log = path.join(uploadDir, 'progressv2.log'); // 上传文件接口接收到的文件存放的目录

export const ERROR_HTTP_CODE = {
  serverError: 10000, // 服务器错误
  banIp: 1000,
  adminDisableUser: 1001,
  notFound: 1002, // 返回了404的http状态码
  errStatusCode: 1003, // 返回了即不是200也不是404的http状态码
};

export const ALLOW_HTTP_CODE = {
  ok: 200, // 成功
  apiCache: 304, // 接口缓存
  paramsError: 400, // 参数错误
  unauthorized: 401, // 未授权
  forbidden: 403, // 权限不足
  notFound: 404, // 未找到
  serverError: 500, // 服务器错误
};

export const HttpErrorMsg = {
  paramsError: '参数错误！',
  unauthorized: '未授权！',
  forbidden: '权限不足！',
  notFound: '未找到！',
  serverError: '服务器错误！',
};

export const HttpSuccessMsg = {
  GET: '获取成功！',
  POST: '新增成功！',
  PUT: '修改成功！',
  DELETE: '删除成功！',
};

export const COMMON_ERR_MSG = {
  banIp: '检测到频繁操作，此ip已被禁用，请联系管理员处理！',
  jwtExpired: '登录信息过期！',
  invalidToken: '非法token！',
  adminDisableUser: '你的账号已被管理员禁用，请联系管理员处理！',
};

// 没有用到这个DisableEnum枚举，eslint会报错
// export enum DisableEnum {
//   'banIp' = 1,
//   'adminDisableUser' = 2,
// }

// 发送邮件结果类型
export const VERIFY_EMAIL_RESULT_CODE = {
  ok: '发送成功！',
  more: '一天只能发5次验证码！',
  later: '一分钟内只能发1次验证码，请稍后再试！',
  err: '验证码错误或已过期！',
  system: '发送邮件错误！',
};

// redis前缀
export const REDIS_PREFIX = {
  emailLogin: `${PROJECT_NAME}-${PROJECT_ENV}-emailLogin`, // 登录不区分前后台
  emailRegister: `${PROJECT_NAME}-${PROJECT_ENV}-emailRegister`, // 注册不区分前后台
  userBindEmail: `${PROJECT_NAME}-${PROJECT_ENV}-userBindEmail`, // 用户绑定邮箱
  userCancelBindEmail: `${PROJECT_NAME}-${PROJECT_ENV}-userCancelBindEmail`, // 用户取消绑定邮箱
  fileProgress: `${PROJECT_NAME}-${PROJECT_ENV}-fileProgress`, // 文件上传进度
  chunkFileProgress: `${PROJECT_NAME}-${PROJECT_ENV}-chunkFileProgress`, // 分片文件上传进度
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
export enum QINIU_PREFIX {
  'image/' = 'image/',
  'backupsDatabase/' = 'backupsDatabase/',
  'media/' = 'media/',
  'nuxt-blog-client/' = 'nuxt-blog-client/',
}
