export const VERIFY_EMAIL_RESULT_CODE = {
  ok: '发送成功!',
  more: '一天只能发5次验证码!',
  later: '一分钟内只能发1次验证码，请稍后再试!',
  err: '验证码错误或已过期!',
  system: '系统错误!',
};

export const REDIS_PREFIX = {
  login: 'login', // 登录不区分前后台
  register: 'register', // 注册不区分前后台
  userBindEmail: 'userBindEmail',
};

export const THIRD_PLATFORM = {
  website: 1, // 站内
  qq_www: 2, // qq前台
  qq_admin: 3, // qq后台
  github: 4, // github
  email: 5, // 邮箱
};
