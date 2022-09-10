import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { ALLOW_HTTP_CODE, COMMON_ERR_MSG, ERROR_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';
import blacklistService from '@/service/blacklist.service';
import { isAdmin } from '@/utils';
import { chalkINFO } from '@/utils/chalkTip';

// 前台的所有get和白名单内的接口不需要token
const frontendWhiteList = [
  '/init/role',
  '/init/auth',
  '/init/roleAuth',
  '/init/dayData',
  '/visitor_log/create', // 访客记录，这个接口是post的
  '/user/login', // 登录，这个接口是post的
  '/link/create', // 申请友链，这个接口是post的
  '/qq_user/login', // 登录
  '/github_user/login', // 登录
  '/email_user/send_login_code', // 发送登录验证码
  '/email_user/send_register_code', // 发送注册验证码
  '/email_user/send_bind_code', // 发送绑定邮箱验证码
  '/email_user/send_cancel_bind_code', // 发送解绑邮箱验证码
  '/email_user/login', // 登录
  '/email_user/register', // 注册
];

// 后台的所有接口都需要判断token，除了白名单内的不需要token
const backendWhiteList = [
  '/admin/email_user/send_login_code', // 发送登录验证码
  '/admin/user/login', // 后台的这个接口是post的
  '/admin/user/code_login', // 验证码登录
  '/admin/github_user/login', // github登录
  '/admin/qq_user/login', // 登录接口
  '/admin/email_user/send_login_code', // 发送登录验证码
  '/admin/email_user/send_register_code', // 发送注册验证码
  '/admin/email_user/send_bind_code', // 发送绑定邮箱验证码
  '/admin/email_user/send_cancel_bind_code', // 发送解绑邮箱验证码
  '/admin/email_user/login', // 登录
  '/admin/email_user/register', // 注册
];

const globalWhiteList = ['/init/'];

export const apiBeforeVerify = async (ctx: ParameterizedContext, next) => {
  console.log('apiBeforeVerify中间件');
  const url = ctx.request.path;
  const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';
  const admin = isAdmin(ctx);
  console.log(
    chalkINFO(
      `日期：${new Date().toLocaleString()}，ip：${ip}，请求${
        admin ? '后' : '前'
      }台接口 ${ctx.request.method} ${url}`
    )
  );
  // 判断黑名单
  const inBlacklist = await blacklistService.findByIp(ip);

  if (inBlacklist?.type === 1) {
    // 1是频繁操作
    throw new CustomError(
      COMMON_ERR_MSG.banIp,
      ALLOW_HTTP_CODE.forbidden,
      ERROR_HTTP_CODE.banIp
    );
  } else if (inBlacklist?.type === 2) {
    // 2是管理员手动禁用
    throw new CustomError(
      COMMON_ERR_MSG.adminDisableUser,
      ALLOW_HTTP_CODE.forbidden,
      ERROR_HTTP_CODE.adminDisableUser
    );
  } else {
    console.log('不在黑名单里');
  }

  const consoleEnd = () => {
    console.log(
      chalkINFO(
        `日期：${new Date().toLocaleString()}，ip：${ip}，响应${
          admin ? '后' : '前'
        }台接口 ${ctx.request.method} ${url}`
      )
    );
  };

  let allowNext = false;
  globalWhiteList.forEach((item) => {
    if (ctx.req.url!.indexOf(item) === 0) {
      allowNext = true;
    }
  });

  if (allowNext) {
    console.log(chalkINFO('全局白名单，next'));
    await next();
    consoleEnd();
    return;
  }

  if (admin) {
    if (backendWhiteList.indexOf(url) !== -1) {
      await next();
      consoleEnd();
      return;
    }
    const { code, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      consoleEnd();
      throw new CustomError(message, code, code);
    }
    /**
     * 这里必须await next()，因为路由匹配肯定是先匹配这个app.use的，
     * 如果这里匹配完成后直接next()了，就会返回数据了（404），也就是不会
     * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
     */
    await next();
    consoleEnd();
  } else {
    // 前端的get接口都不需要判断token，白名单内的也不需要判断token（如注册登录这些接口是post的）
    if (ctx.request.method === 'GET' || frontendWhiteList.indexOf(url) !== -1) {
      await next();
      consoleEnd();
      return;
    }
    const { code, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      consoleEnd();
      throw new CustomError(message, code, code);
    }
    /**
     * 因为这个verify.middleware是最先执行的中间件路由，
     * 而且这个verify.middleware是异步的，因此如果需要等待异步执行完成才继续匹配后面的中间时，
     * 必须使用await next()，如果这里使用next()，就会返回数据了（404），也就是不会
     * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
     */
    await next();
    consoleEnd();
  }
};
