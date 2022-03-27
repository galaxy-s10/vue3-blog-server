import { ParameterizedContext } from 'koa';

import otherController from './other.controller';
import redisController from './redis.controller';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import emailUserService from '@/service/emailUser.service';
import { randomString } from '@/utils';

const emailResCode = {
  ok: '发送成功!',
  more: '一天只能发5次验证码!',
  later: '一分钟内只能发1次验证码，请稍后再试!',
  err: '验证码错误或已过期!',
};

class EmailController {
  async find(ctx: ParameterizedContext, next) {
    try {
      const { email } = ctx.request.query;
      const result = await emailUserService.findThirdUser(email as string);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  /**
   * 核心逻辑，每个ip一天只能发5次验证码，每个验证码有效期为5分钟，一分钟内不能重复发送验证码
   * 发验证码：
   * redis有缓存，判断：
   *   1，判断这个ip发送验证码的次数是否超过了5次，超过了5次就不能再发送了。
   *   2，判断当前时间距离上次更新时间是否在一分钟之内，在一分钟之内就提示过xx秒再发送；如果超过了一分钟则更新验证码，更新次数，然后发送验证码。
   * redis没有缓存，新建redis缓存，发送验证码
   */
  sendCode = async (ctx: ParameterizedContext, next) => {
    const { email } = ctx.request.body;
    const reg = /^[A-Za-z0-9\u4E00-\u9FA5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    if (!reg.test(email)) {
      emitError({ ctx, code: 400, message: '请输入正确的邮箱!' });
      return;
    }
    try {
      const key = {
        prefix: 'email',
        key: email,
      };
      const oldIpdata = await redisController.getVal(key);
      const redisExpired = 60 * 5; // redis缓存的有效期（五分钟），单位秒
      if (!oldIpdata) {
        const verificationCode = randomString(6);
        await otherController.sendEmail(
          email,
          `《自然博客》验证码：${verificationCode}`,
          `《自然博客》验证码：${verificationCode}，有效期五分钟`
        );
        await redisController.setVal({
          ...key,
          value: verificationCode,
          exp: redisExpired,
        });
        successHandler({ ctx, message: emailResCode.ok });
      } else {
        const ttl = await redisController.getTTL(key);
        console.log(ttl, 33);
        if (ttl > 60 * 4) {
          emitError({
            ctx,
            code: 400,
            message: `操作频繁，${`请${ttl - 60 * 4}`}秒后再发送验证码!`,
          });
          return;
        }
        const verificationCode = randomString(6);
        await otherController.sendEmail(
          email,
          `《自然博客》验证码：${verificationCode}`,
          `《自然博客》验证码：${verificationCode}，有效期五分钟`
        );
        await redisController.setVal({
          ...key,
          value: verificationCode,
          exp: redisExpired,
        });
        console.log(',,,,');
        successHandler({ ctx, message: emailResCode.ok });
      }
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  async getList(ctx: ParameterizedContext, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const result = await emailUserService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new EmailController();
