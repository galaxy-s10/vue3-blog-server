import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { QQ_EMAIL_USER } from '@/config/secret';
import otherController from '@/controller/other.controller';
import { ILink, IList } from '@/interface';
import linkService from '@/service/link.service';
import { isAdmin } from '@/utils';

class LinkController {
  async getList(ctx: ParameterizedContext, next) {
    try {
      const {
        id,
        orderBy = 'asc',
        orderName = 'id',
        nowPage,
        pageSize,
        keyWord,
        status,
      }: IList<ILink> = ctx.request.query;
      const result = await linkService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
        status: isAdmin(ctx) ? status : 1,
        keyWord,
        id,
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
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      const id = +ctx.params.id;
      const { email, name, avatar, desc, url, status }: ILink =
        ctx.request.body;
      const isExist = await linkService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的友链!` });
        return;
      }
      await linkService.update({
        id,
        email,
        name,
        avatar,
        desc,
        url,
        status,
      });
      if (status === 1 && email) {
        await otherController.sendEmail(
          QQ_EMAIL_USER,
          `友链申请审核通过！`,
          `你在自然博客申请的友链（${name!}）已审核通过！`
        );
      }
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    try {
      const { email, name, avatar, desc, url, status }: ILink =
        ctx.request.body;
      await linkService.create({
        email,
        name,
        avatar,
        desc,
        url,
        status: isAdmin(ctx) ? status : 2,
      });
      await otherController.sendEmail(
        QQ_EMAIL_USER,
        `收到${name!}的友链申请`,
        `收到:${name!}的友链申请，请及时处理~`
      );
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    try {
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      const id = +ctx.params.id;
      const isExist = await linkService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的友链!` });
        return;
      }
      await linkService.delete(id);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new LinkController();
