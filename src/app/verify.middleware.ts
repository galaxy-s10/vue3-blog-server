import { performance } from 'perf_hooks';

import chalk from 'chalk';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { ALLOW_HTTP_CODE } from '@/constant';
import logController from '@/controller/log.controller';
import { CustomError } from '@/model/customError.model';
import { IP_WHITE_LIST } from '@/secret/secret';
import { isAdmin } from '@/utils';
import { chalkINFO, chalkWARN } from '@/utils/chalkTip';

// 前台的所有get和白名单内的接口不需要token
const frontendWhiteList = [
  '/init/role',
  '/init/auth',
  '/init/roleAuth',
  '/init/dayData',
  '/link/create', // 申请友链，这个接口是post的
  '/visitor_log/create', // 访客记录，这个接口是post的
  '/user/login', // 登录，这个接口是post的
  '/qq_user/login', // 登录，这个接口是post的
  '/email_user/login', // 登录，这个接口是post的
  '/github_user/login', // 登录，这个接口是post的
  '/email_user/send_login_code', // 发送登录验证码，这个接口是post的
  '/email_user/send_register_code', // 发送注册验证码，这个接口是post的
  '/email_user/send_bind_code', // 发送绑定邮箱验证码，这个接口是post的
  '/email_user/send_cancel_bind_code', // 发送解绑邮箱验证码，这个接口是post的
  '/email_user/register', // 注册，这个接口是post的
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

// 允许频繁请求的路径白名单
const frequentlyWhiteList = [
  '/admin/qiniu_data/upload_chunk',
  '/admin/qiniu_data/progress',
  '/article/test',
  '/admin/article/test',
];

async function isPass(ip: string) {
  const nowDate = +new Date();
  let flag = true;
  if (IP_WHITE_LIST.includes(ip)) return flag;
  const [tenMinuteApiNum, oneHourApiNum, oneDayApiNum] = await Promise.all([
    logController.common.getCount({
      startTime: new Date(nowDate - 1000 * 60 * 10), // 十分钟内访问的次数
      endTime: new Date(nowDate),
      api_real_ip: ip,
    }),
    logController.common.getCount({
      startTime: new Date(nowDate - 1000 * 60 * 60), // 一小时内访问的次数
      endTime: new Date(nowDate),
      api_real_ip: ip,
    }),
    logController.common.getCount({
      startTime: new Date(nowDate - 1000 * 60 * 60 * 24), // 一天内访问的次数
      endTime: new Date(nowDate),
      api_real_ip: ip,
    }),
  ]);
  const nums = 24 * 60 * 60; // 一秒请求一次，连续请求一天，总共请求的次数
  const oneDayNums = nums * 5; // 假设一秒请求5次，连续请求一天
  tenMinuteApiNum > oneDayNums / 24 / 6 && (flag = false);
  oneHourApiNum > oneDayNums / 24 && (flag = false);
  oneDayApiNum > oneDayNums && (flag = false);
  return flag;
}

export const apiBeforeVerify = async (ctx: ParameterizedContext, next) => {
  console.log(chalkINFO('apiBeforeVerify中间件开始'));
  const startTime = performance.now();
  const url = ctx.request.path;
  const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';
  const admin = isAdmin(ctx);
  const consoleEnd = () => {
    const duration = Math.floor(performance.now() - startTime);
    console.log(chalkINFO('apiBeforeVerify中间件通过！'));
    console.log(chalkWARN(`apiBeforeVerify中间件耗时：${duration}ms`));
    console.log(
      chalkINFO(
        `ip：${ip}，响应${admin ? '后' : '前'}台接口 ${
          ctx.request.method
        } ${url}`
      )
    );
  };

  console.log(
    chalkINFO(
      `ip：${ip}，收到${admin ? '后' : '前'}台接口 ${
        ctx.request.method
      } ${url}请求`
    )
  );

  console.log(chalk.blueBright('query:'), { ...ctx.request.query });
  console.log(chalk.blueBright('params:'), ctx.params);
  console.log(chalk.blueBright('body:'), ctx.request.body);
  console.log(chalk.blueBright('referer:'), ctx.request.header.referer);
  console.log(chalk.blueBright('cookie:'), ctx.request.header.cookie);
  console.log(chalk.blueBright('token:'), ctx.request.headers.authorization);

  // 判断黑名单
  // const inBlacklist = await blacklistController.findByIp(ip);

  // if (inBlacklist?.type === BLACKLIST_TYPE.banIp) {
  //   // 频繁操作
  //   throw new CustomError(
  //     `当前ip:${ip}调用api频繁,${COMMON_ERR_MSG.banIp}`,
  //     ALLOW_HTTP_CODE.forbidden,
  //     ERROR_HTTP_CODE.banIp
  //   );
  // } else if (inBlacklist?.type === BLACKLIST_TYPE.adminDisableUser) {
  //   // 管理员手动禁用
  //   throw new CustomError(
  //     COMMON_ERR_MSG.adminDisableUser,
  //     ALLOW_HTTP_CODE.forbidden,
  //     ERROR_HTTP_CODE.adminDisableUser
  //   );
  // }

  // 验证是否频繁请求
  // if (frequentlyWhiteList.indexOf(url) === -1) {
  //   console.log('验证是否频繁请求');
  //   const res = await isPass(ip);
  //   if (!res) {
  //     const { userInfo } = await authJwt(ctx);
  //     blacklistController.common.create({
  //       user_id: userInfo?.id,
  //       ip,
  //       type: BLACKLIST_TYPE.banIp,
  //       msg: COMMON_ERR_MSG.banIp,
  //     });
  //     throw new CustomError(
  //       `当前ip:${ip}调用api频繁,${COMMON_ERR_MSG.banIp}`,
  //       ALLOW_HTTP_CODE.forbidden,
  //       ERROR_HTTP_CODE.banIp
  //     );
  //   }
  // }

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
