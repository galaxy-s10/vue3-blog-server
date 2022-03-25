import { ParameterizedContext } from 'koa';
import nodemailer from 'nodemailer';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import redisClient from '@/config/redis';
import {
  qq_email_user,
  qq_email_pass,
  mailOptionsConfig,
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

  send = async (ctx: ParameterizedContext, next) => {
    const { email } = ctx.request.body;
    console.log(email, 888);
    try {
      console.log(this, 44);
      const oldEmail = await this.find(email);
      if (oldEmail) {
        // 如何redis里面有，则不发送
        console.log(oldEmail, '099');
        return;
      }
      const transporter = await nodemailer.createTransport({
        // host: 'smtp.ethereal.email',
        service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
        port: 465, // SMTP 端口
        secureConnection: true, // 使用了 SSL
        auth: {
          user: qq_email_user,
          pass: qq_email_pass, // 这里密码不是qq密码，是你设置的smtp授权码
        },
      });
      const verificationCode = randomString(6);
      const expired = 60 * 10;
      // const aaa = await redisClient.setEx(email, expired, verificationCode);
      // const aaa = await redisClient.set(email, verificationCode, {
      //   EX: expired,
      // });
      const aaa = await redisClient.sAdd(email, verificationCode);
      const bbb = await redisClient.EXPIRE(email, expired);
      console.log(aaa, bbb, 3452);
      const mailOptions = {
        from: mailOptionsConfig.from, // sender address
        to: email, // list of receivers
        subject: `《自然博客》验证码:${verificationCode}`, // Subject line
        text: `《自然博客》验证码:${verificationCode},有效期十分钟`, // plain text body
        html: `<h1>《自然博客》验证码:${verificationCode},有效期十分钟</h1>`, // html body
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
