import { ParameterizedContext } from 'koa';
import nodemailer from 'nodemailer';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import redisClient from '@/config/redis';
import {
  QQ_EMAIL_USER,
  QQ_EMAIL_PASS,
  MAIL_OPTIONS_CONFIG,
} from '@/config/secret';
import { randomString } from '@/utils';

class EmailController {
  from: any;

  to: any;

  subject: any;

  html: any;

  text: any;

  // constructor(payload) {
  //   this.from = payload.from;
  //   this.to = payload.to;
  //   this.subject = payload.subject;
  //   this.html = payload.html;
  //   this.text = payload.text;
  // }

  find = async (key: string) => {
    try {
      const res = await redisClient.sMembers(key);
      return res;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  /**
   * 核心逻辑，每个ip一天只能发5次验证码，每个验证码有效期为5分钟，一分钟内不能重复发送验证码
   * 发验证码：
   * redis有缓存，判断：
   *   1，判断这个key的次数是否超过了5次，超过了5次就不能再发送了。
   *   2，判断当前时间距离上次更新时间是否在一分钟之内，在一分钟之内就提示过xx秒再发送；如果超过了一分钟则更新验证码，更新次数，然后发送验证码。
   * redis没有缓存，新建redis缓存，发送验证码
   */
  send = async (ctx: ParameterizedContext, next) => {
    const { email } = ctx.request.body;
    const ip = ctx.request.header.host;
    console.log(email, 888);
    try {
      // const oldEmail = await this.find(ip);
      // console.log(oldEmail, '00000');
      // if (oldEmail) {
      //   const [redisIp, redisCreateAt, redisCode] = oldEmail;
      //   console.log(redisIp, redisCreateAt, redisCode);
      //   if (+new Date() - +redisCreateAt < 1000 * 60) {
      //     console.log('一分钟内不能重复发送验证码!');
      //     emitError({ ctx, code: 403, error: '一分钟内不能重复发送验证码!' });
      //     return;
      //   }
      //   console.log('ffffff');
      // } else {
      //   console.log('没有redis');
      // }
      console.log('还');
      const transporter = await nodemailer.createTransport({
        // host: 'smtp.ethereal.email',
        service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
        port: 465, // SMTP 端口
        secureConnection: true, // 使用了 SSL
        auth: {
          user: QQ_EMAIL_USER,
          pass: QQ_EMAIL_PASS, // 这里密码不是qq密码，是你设置的smtp授权码
        },
      });
      const verificationCode = randomString(6);
      const expired = 60 * 60 * 24; // 单位秒
      const dataStr = JSON.stringify({
        code: verificationCode, // 验证码
        count: 1, // 次数
        expired, // 有效时间
        createAt: +new Date(), // 创建时间
        updatedAt: +new Date(), // 更新时间
      });
      /**
       * 核心逻辑，每个ip一天只能发5次验证码，每个验证码有效期为5分钟，一分钟内不能重复发送验证码
       * 发验证码：
       *      redis有缓存，判断：
       *       1，判断这个key的次数是否超过了5次，超过了5次就不能再发送了。
       *       2，判断当前时间距离上次更新时间是否在一分钟之内，在一分钟之内就提示过xx秒再发送；如果超过了一分钟则更新验证码，更新次数，然后发送验证码。
       *      redis没有缓存，新建redis缓存，发送验证码
       * 收验证码：
       *
       */
      const aaa = await redisClient.setEx(email, expired, dataStr); // string类型
      // const aaa = await redisClient.set(email, verificationCode, {
      //   // string类型
      //   EX: expired,
      // });

      // const aaa = await redisClient.zAdd(ip, [{ score: 100, value: '2222' }]); // sorted set类型
      // const aaa = await redisClient.sAdd(ip, [
      //   `${+new Date()}`,
      //   email,
      //   verificationCode,
      // ]); // set类型
      const bbb = await redisClient.EXPIRE(email, expired);
      console.log(aaa, bbb, 3452);
      const mailOptions = {
        from: MAIL_OPTIONS_CONFIG.from, // sender address
        to: email, // list of receivers
        subject: `【自然博客】验证码:${verificationCode}`, // Subject line
        text: `【自然博客】验证码:${verificationCode}，有效期五分钟`, // plain text body
        html: `<h1>【自然博客】验证码:${verificationCode}，有效期五分钟</h1>`, // html body
      };
      // send mail with defined transport object
      const info = await transporter.sendMail(mailOptions);
      successHandler({ ctx, data: info });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };
}

export default new EmailController();
