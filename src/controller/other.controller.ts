import { ParameterizedContext } from 'koa';
import nodemailer from 'nodemailer';

import redisController from './redis.controller';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import {
  mailOptionsConfig,
  qq_email_pass,
  qq_email_user,
} from '@/config/secret';
import { randomString } from '@/utils';

const emailResCode = {
  ok: '发送成功!',
  more: '一天只能发5次验证码!',
  later: '一分钟内只能发1次验证码，请稍后再试!',
  err: '验证码错误或已过期!',
};

class OtherController {
  sendEmail = async (email: string, subject: string, content: string) => {
    const transporter = await nodemailer.createTransport({
      service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
      port: 465, // SMTP 端口
      secureConnection: true, // 使用了 SSL
      auth: {
        user: qq_email_user,
        pass: qq_email_pass, // 这里密码不是qq密码，是你设置的smtp授权码
      },
    });
    const mailOptions = {
      from: mailOptionsConfig.from, // sender address
      to: email, // list of receivers
      subject, // Subject line
      text: `${content}`, // plain text body
      html: `<h1>${content}</h1>`, // html body
    };
    // send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);
    return info;
  };

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
        await this.sendEmail(
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
        await this.sendEmail(
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
}

export default new OtherController();
