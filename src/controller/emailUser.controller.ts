import { ParameterizedContext } from 'koa';

import otherController from './other.controller';
import redisController from './redis.controller';

import { authJwt } from '@/app/auth/authJwt';
import {
  REDIS_PREFIX,
  THIRD_PLATFORM,
  VERIFY_EMAIL_RESULT_CODE,
} from '@/app/constant';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import emailUserService from '@/service/emailUser.service';
import thirdUserService from '@/service/thirdUser.service';
import { emailContentTemplate, randomString } from '@/utils';

const emailResCode = {
  ok: '发送成功!',
  more: '一天只能发5次验证码!',
  later: '一分钟内只能发1次验证码，请稍后再试!',
  err: '验证码错误或已过期!',
  system: '系统错误!',
};

interface IKey {
  prefix: string;
  key: string;
}

class EmailUserController {
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
   * 发送验证码
   * redis没有缓存，新建redis缓存，发送验证码
   * redis有缓存，判断是否在一分钟之内，在一分钟之内就提示过xx秒再发送；只有超过了一分钟才能继续发送验证码。
   * 返回值：emailResCode
   */
  sendCode = async ({
    key,
    exp = 300,
    desc,
    subject,
  }: {
    key: IKey;
    exp?: number;
    desc: string;
    subject?: string;
  }) => {
    try {
      const oldIpdata = await redisController.getVal(key);
      if (!oldIpdata) {
        const verificationCode = randomString(6);
        const content = emailContentTemplate({
          code: verificationCode,
          desc,
          exp,
          subject,
        });
        await otherController.sendEmail(
          key.key,
          content.subject,
          `<h1>${content.content}</h1>`
        );
        await redisController.setVal({
          ...key,
          value: verificationCode,
          exp,
        });
        return emailResCode.ok;
      }
      const ttl = await redisController.getTTL(key);
      if (ttl > 60 * 4) {
        return emailResCode.later;
      }
      const verificationCode = randomString(6);
      const content = emailContentTemplate({
        code: verificationCode,
        desc,
        exp,
        subject,
      });
      await otherController.sendEmail(
        key.key,
        content.subject,
        `<h1>${content.content}</h1>`
      );
      await redisController.setVal({
        ...key,
        value: verificationCode,
        exp,
      });
      return emailResCode.ok;
    } catch (error) {
      console.log(error);
      return emailResCode.system;
    }
  };

  /** 发送登录验证码 */
  sendLoginCode = async (ctx: ParameterizedContext, next) => {
    const { email } = ctx.request.body;
    const result = await this.sendCode({
      key: {
        prefix: REDIS_PREFIX.login,
        key: email,
      },
      desc: '登录博客',
    });
    successHandler({ ctx, message: result });
    await next();
  };

  /** 发送注册验证码 */
  sendRegisterCode = async (ctx: ParameterizedContext, next) => {
    const { email } = ctx.request.body;
    const result = await this.sendCode({
      key: {
        prefix: REDIS_PREFIX.register,
        key: email,
      },
      desc: '注册用户',
    });
    successHandler({ ctx, message: result });
    await next();
  };

  /** 发送绑定邮箱验证码 */
  sendUserBindEmailCode = async (ctx: ParameterizedContext, next) => {
    const { email } = ctx.request.body;
    const result = await this.sendCode({
      key: {
        prefix: REDIS_PREFIX.userBindEmail,
        key: email,
      },
      desc: '绑定邮箱',
    });
    successHandler({ ctx, message: result });
    await next();
  };

  /** 获取邮箱列表 */
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

  /**
   * 用户绑定邮箱。
   * 1，先判断third_user表里面自己有没有绑定过邮箱，如果自己绑定过邮箱，就不能再绑定了（只能解绑）。
   * 2，再判断third_user表里面有没有其他人绑定过该邮箱，如果这个邮箱被别人绑定了，就不能绑定了。
   * 3，符合条件绑定邮箱条件，再验证验证码，最后绑定。
   */
  userBindEmail = async (ctx: ParameterizedContext, next) => {
    try {
      const { email, code } = ctx.request.body;
      const { userInfo } = await authJwt(ctx.request);
      const result: any[] = await thirdUserService.findByUserId(userInfo.id);
      const ownIsBind = result.filter(
        (v) => v.third_platform === THIRD_PLATFORM.email
      );
      if (ownIsBind.length) {
        emitError({
          ctx,
          code: 401,
          message: '你已经绑定过邮箱，请先解绑原邮箱!',
        });
        return;
      }
      const otherIsBind = await emailUserService.findByEmail(email);
      if (otherIsBind) {
        emitError({
          ctx,
          code: 401,
          message: '该邮箱已被其他人绑定!',
        });
        return;
      }
      const key = {
        prefix: REDIS_PREFIX.userBindEmail,
        key: email,
      };
      const redisData = await redisController.getVal({
        ...key,
      });
      if (redisData !== code || !redisData) {
        emitError({
          ctx,
          code: 401,
          message: VERIFY_EMAIL_RESULT_CODE.err,
        });
        return;
      }
      const createEmailRes: any = await emailUserService.create({ email });
      await thirdUserService.create({
        user_id: userInfo.id,
        third_platform: THIRD_PLATFORM.email,
        third_user_id: createEmailRes.id,
      });
      successHandler({ ctx, message: '绑定邮箱成功!' });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };
}

export default new EmailUserController();
