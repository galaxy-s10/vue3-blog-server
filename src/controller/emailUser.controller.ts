import { ParameterizedContext } from 'koa';

import otherController from './other.controller';
import redisController from './redis.controller';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import { chalkERROR } from '@/app/chalkTip';
import {
  REDIS_PREFIX,
  THIRD_PLATFORM,
  VERIFY_EMAIL_RESULT_CODE,
} from '@/app/constant';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IEmail, IUser } from '@/interface';
import emailUserService from '@/service/emailUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import { emailContentTemplate, randomNumber, randomString } from '@/utils';

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
      console.log(chalkERROR(error));
      return emailResCode.system;
    }
  };

  /** 邮箱登录（邮箱验证码登录） */
  login = async (ctx: ParameterizedContext, next) => {
    try {
      const { email, code, exp = 24 } = ctx.request.body;
      const key = {
        prefix: REDIS_PREFIX.emailLogin,
        key: email,
      };
      // 判断redis中的验证码是否正确
      const redisData = await redisController.getVal(key);
      if (redisData !== code || !redisData) {
        emitError({ ctx, code: 400, message: '验证码错误或已过期!' });
        return;
      }
      const findEmailUserRes = await emailUserService.findThirdUser(email);
      const userInfo = findEmailUserRes.get().users[0].get();
      const token = signJwt({
        userInfo,
        exp,
      });
      await userService.update({ id: userInfo?.id, token }); // 每次登录都更新token
      await redisController.del(key);
      successHandler({ ctx, data: token, message: '登录成功!' });
    } catch (error) {
      emitError({
        ctx,
        code: 400,
        error,
      });
      return;
    }
    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */
    await next();
  };

  /** 邮箱注册 */
  register = async (ctx: ParameterizedContext, next) => {
    try {
      const { email, code, exp = 24 }: IEmail = ctx.request.body;
      const reg =
        /^[A-Za-z0-9\u4E00-\u9FA5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (!reg.test(email)) {
        emitError({ ctx, code: 400, message: '请输入正确的邮箱!' });
        return;
      }
      const emailIsExist = await emailUserService.isExist([email]);
      if (emailIsExist) {
        emitError({ ctx, code: 400, message: '该邮箱已被他人使用!' });
      } else {
        const key = {
          prefix: REDIS_PREFIX.emailRegister,
          key: email,
        };
        // 判断redis中的验证码是否正确
        const redisData = await redisController.getVal(key);
        if (redisData !== code || !redisData) {
          emitError({ ctx, code: 400, message: '验证码错误或已过期!' });
          return;
        }
        // 用户表创建用户
        const createUserRes = await userService.create({
          username: `用户${randomNumber(8)}`,
          password: randomString(8),
        });
        // 邮箱表创建邮箱
        const emailData: any = await emailUserService.create({ email });
        // 第三方用户表绑定用户和邮箱
        await thirdUserService.create({
          user_id: createUserRes.id,
          third_user_id: emailData.id,
          third_platform: THIRD_PLATFORM.email,
        });
        const token = signJwt({
          userInfo: createUserRes,
          exp,
        });
        await userService.update({ token, id: createUserRes.id }); // 每次登录都更新token
        await redisController.del(key);
        successHandler({ ctx, data: token, message: '注册成功!' });
      }
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  /** 发送登录验证码 */
  sendLoginCode = async (ctx: ParameterizedContext, next) => {
    const { email } = ctx.request.body;
    const result = await this.sendCode({
      key: {
        prefix: REDIS_PREFIX.emailLogin,
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
        prefix: REDIS_PREFIX.emailRegister,
        key: email,
      },
      desc: '注册用户',
    });
    successHandler({ ctx, message: result });
    await next();
  };

  /** 发送绑定邮箱验证码 */
  sendBindEmailCode = async (ctx: ParameterizedContext, next) => {
    const { userInfo } = await authJwt(ctx);
    const { email } = ctx.request.body;
    const result = await this.sendCode({
      key: {
        prefix: `${REDIS_PREFIX.userBindEmail}-${userInfo.id}`,
        key: email,
      },
      desc: '绑定邮箱',
    });
    successHandler({ ctx, message: result });
    await next();
  };

  /** 发送取消绑定邮箱验证码 */
  sendCancelBindEmailCode = async (ctx: ParameterizedContext, next) => {
    const { userInfo } = await authJwt(ctx);
    const { email } = ctx.request.body;
    const key = {
      prefix: `${REDIS_PREFIX.userCancelBindEmail}-${userInfo.id}`,
      key: email,
    };
    const result = await this.sendCode({
      key,
      desc: '取消绑定邮箱',
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
   * 3，符合绑定邮箱条件，再验证验证码，最后绑定。
   */
  bindEmail = async (ctx: ParameterizedContext, next) => {
    try {
      const { email, code } = ctx.request.body;
      if (!code) {
        emitError({
          ctx,
          code: 400,
          message: '验证码不能为空!',
        });
        return;
      }
      const { userInfo } = await authJwt(ctx);
      const result: any[] = await thirdUserService.findByUserId(userInfo.id);
      const ownIsBind = result.filter(
        (v) => v.third_platform === THIRD_PLATFORM.email
      );
      if (ownIsBind.length) {
        emitError({
          ctx,
          code: 400,
          message: '你已经绑定过邮箱，请先解绑原邮箱!',
        });
        return;
      }
      const otherIsBind = await emailUserService.findByEmail(email);
      if (otherIsBind) {
        emitError({
          ctx,
          code: 400,
          message: '该邮箱已被其他人绑定!',
        });
        return;
      }
      const key = {
        prefix: `${REDIS_PREFIX.userBindEmail}-${userInfo.id}`,
        key: email,
      };
      const redisData = await redisController.getVal({
        ...key,
      });
      if (redisData !== code || !redisData) {
        emitError({
          ctx,
          code: 400,
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
      await redisController.del(key);
      successHandler({ ctx, message: '绑定邮箱成功!' });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  /**
   * 用户取消绑定邮箱。
   * 1，先判断third_user表里面自己有没有绑定过邮箱，如果自己没有绑定过邮箱，就不能取消绑定。
   * 2，符合取消绑定邮箱条件，再验证验证码，最后绑定。
   */
  cancelBindEmail = async (ctx: ParameterizedContext, next) => {
    try {
      const { code } = ctx.request.body;
      if (!code) {
        emitError({
          ctx,
          code: 400,
          message: '验证码不能为空!',
        });
        return;
      }
      const { userInfo } = await authJwt(ctx);
      const result: any[] = await thirdUserService.findByUserId(userInfo.id);
      const ownIsBind = result.filter(
        (v) => v.third_platform === THIRD_PLATFORM.email
      );
      if (!ownIsBind.length) {
        emitError({
          ctx,
          code: 400,
          message: '你没有绑定过邮箱，不能解绑!',
        });
        return;
      }
      const userEmail: any = await emailUserService.findById(
        ownIsBind[0].third_user_id
      );
      const key = {
        prefix: `${REDIS_PREFIX.userCancelBindEmail}-${userInfo.id}`,
        key: userEmail.email,
      };
      const redisData = await redisController.getVal({
        ...key,
      });
      if (redisData !== code || !redisData) {
        emitError({
          ctx,
          code: 400,
          message: VERIFY_EMAIL_RESULT_CODE.err,
        });
        return;
      }
      await emailUserService.delete(ownIsBind[0].third_user_id);
      await thirdUserService.delete(ownIsBind[0].id);
      await redisController.del(key);

      successHandler({ ctx, message: '解绑邮箱成功!' });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };
}

export default new EmailUserController();
