import { exec } from 'child_process';

import { ParameterizedContext } from 'koa';
import nodemailer from 'nodemailer';

import redisController from './redis.controller';

import successHandler from '@/app/handler/success-handle';
import {
  ALLOW_HTTP_CODE,
  PROJECT_ENV,
  PROJECT_NAME,
  QQ_MAIL_CONFIG,
  VERIFY_EMAIL_RESULT_CODE,
} from '@/constant';
import { CustomError } from '@/model/customError.model';
import { QQ_EMAIL_PASS, QQ_EMAIL_USER } from '@/secret/secret';
import { getRandomString } from '@/utils';
import { chalkERROR, chalkINFO } from '@/utils/chalkTip';

function execCmd({ key, cmd }: { key: string; cmd: string }) {
  return new Promise<{ key; res }>((resolve) => {
    exec(
      cmd,
      {
        cwd: process.cwd(),
      },
      (error, stdout, stderr) => {
        if (error) {
          // nginx -v时,error是null,stderr是nginx version: nginx/1.23.3
          // if (error || stderr) {
          console.log(chalkERROR(`执行${cmd}出错`));
          console.log('error', error);
          console.log('stdout', stdout);
          console.log('stderr', stderr);
          resolve({
            key,
            res: String(error || stderr)
              .toString()
              .trim(),
          });
        }
        if (stdout || stderr) {
          console.log(chalkINFO(`执行${cmd}成功`));
          console.log('error', error);
          console.log('stdout', stdout);
          console.log('stderr', stderr);
          resolve({ key, res: (stdout || stderr).toString().trim() });
        }
      }
    );
  });
}

const cmdMap = {
  uname: 'uname -a', // 系统信息
  redisVersion: 'redis-server -v', // redis版本
  mysqlVersion: 'mysql -V', // mysql版本
  nginxVersion: 'nginx -v', // nginx版本
  dockerVersion: 'docker -v', // docker版本
  pm2Version: 'pm2 -v', // pm2版本
  nodeVersion: 'node -v', // node版本
  npmVersion: 'npm -v', // npm版本
  pnpmVersion: 'pnpm -v', // pnpm版本
};

class OtherController {
  sendEmail = async (email: string, subject: string, content: string) => {
    const transporter = await nodemailer.createTransport({
      service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
      port: 465, // SMTP 端口
      secureConnection: true, // 使用了 SSL
      auth: {
        user: QQ_EMAIL_USER,
        pass: QQ_EMAIL_PASS, // 这里密码不是qq密码，是你设置的smtp授权码
      },
    });
    const mailOptions = {
      from: QQ_MAIL_CONFIG.from, // sender address
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
      throw new CustomError(
        '请输入正确的邮箱！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const key = {
      prefix: 'email',
      key: email,
    };
    const oldIpdata = await redisController.getVal(key);
    const redisExpired = 60 * 5; // redis缓存的有效期（五分钟），单位秒
    if (!oldIpdata) {
      const verificationCode = getRandomString(6);
      await this.sendEmail(
        email,
        `《自然博客》验证码：${verificationCode}`,
        `《自然博客》验证码：${verificationCode}，有效期五分钟`
      );
      await redisController.setExVal({
        ...key,
        value: verificationCode,
        exp: redisExpired,
      });
      successHandler({ ctx, message: VERIFY_EMAIL_RESULT_CODE.ok });
    } else {
      const ttl = await redisController.getTTL(key);
      if (ttl > 60 * 4) {
        throw new CustomError(
          `操作频繁，${`请${ttl - 60 * 4}`}秒后再发送验证码！`,
          ALLOW_HTTP_CODE.paramsError,
          ALLOW_HTTP_CODE.paramsError
        );
      }
      const verificationCode = getRandomString(6);
      await this.sendEmail(
        email,
        `《自然博客》验证码：${verificationCode}`,
        `《自然博客》验证码：${verificationCode}，有效期五分钟`
      );
      await redisController.setExVal({
        ...key,
        value: verificationCode,
        exp: redisExpired,
      });
      successHandler({ ctx, message: VERIFY_EMAIL_RESULT_CODE.ok });
    }
    await next();
  };

  getServerInfo = async (ctx: ParameterizedContext, next) => {
    // const server: Record<string, string> = {};
    // const cmdArr: Promise<{ key; res }>[] = [];
    // Object.keys(cmdMap).forEach((key) => {
    //   try {
    //     cmdArr.push(execCmd({ key, cmd: cmdMap[key] }));
    //   } catch (error) {
    //     console.log(error);
    //   }
    // });
    // try {
    //   const serverInfo = await Promise.all(cmdArr);
    //   Object.keys(serverInfo).forEach((index) => {
    //     const item = serverInfo[+index];
    //     server[item.key] = item.res;
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
    successHandler({
      ctx,
      data: {
        project_name: PROJECT_NAME,
        project_env: PROJECT_ENV,
        updated_at: new Date().toLocaleString(),
        // server,
        // billd: logData(),
      },
    });
    await next();
  };
}

export default new OtherController();
