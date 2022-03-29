import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { MAIL_OPTIONS_CONFIG } from '@/config/secret';
import { ILink } from '@/interface';
import linkService from '@/service/link.service';
import SendEmailModel from '@/utils/sendEmail';

class LinkController {
  async getList(ctx: ParameterizedContext, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        status = '1',
      } = ctx.request.query;
      const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
      const result = await linkService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
        status: isAdmin ? status : 1,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result = await linkService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const { email, name, avatar, desc, url, status }: ILink =
        ctx.request.body;
      const isExist = await linkService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的友链!` });
        return;
      }
      const result = await linkService.update({
        id,
        email,
        name,
        avatar,
        desc,
        url,
        status,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    try {
      const { email, name, avatar, desc, url, status }: ILink =
        ctx.request.body;
      const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
      const result = await linkService.create({
        email,
        name,
        avatar,
        desc,
        url,
        status: isAdmin ? status : 1,
      });
      const mailOptions = {
        from: MAIL_OPTIONS_CONFIG.from, // sender address
        to: MAIL_OPTIONS_CONFIG.to, // list of receivers
        subject: `收到${name}的友链申请`, // Subject line
        text: `收到:${name}的友链申请，请及时处理~`, // plain text body
        html: `<h1>收到:${name}的友链申请，请及时处理~</h1>`, // html body
      };
      const emailMode = new SendEmailModel(mailOptions);
      await emailMode.send();
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await linkService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的友链!` });
        return;
      }
      const result = await linkService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new LinkController();
