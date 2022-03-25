import nodemailer from 'nodemailer';

import { qq_email_user, qq_email_pass } from '@/config/secret';

class SendEmail {
  from: any;

  to: any;

  subject: any;

  html: any;

  text: any;

  constructor(payload) {
    this.from = payload.from;
    this.to = payload.to;
    this.subject = payload.subject;
    this.html = payload.html;
    this.text = payload.text;
  }

  send() {
    return new Promise((resolve, reject) => {
      const transporter = nodemailer.createTransport({
        // host: 'smtp.ethereal.email',
        service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
        port: 465, // SMTP 端口
        secureConnection: true, // 使用了 SSL
        auth: {
          user: qq_email_user,
          pass: qq_email_pass, // 这里密码不是qq密码，是你设置的smtp授权码
        },
      });

      const mailOptions = {
        from: this.from, // sender address
        to: this.to, // list of receivers
        subject: this.subject, // Subject line
        text: this.text, // plain text body
        html: this.html, // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
}

export default SendEmail;
