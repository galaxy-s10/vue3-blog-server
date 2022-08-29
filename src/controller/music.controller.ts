import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IList, IMusic } from '@/interface';
import musicService from '@/service/music.service';
import { isAdmin } from '@/utils';

class MusicController {
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
      }: IList<IMusic> = ctx.request.query;
      const result = await musicService.getList({
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
      const result = await musicService.find(id);
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
      const { name, cover_pic, audio_url, author, status }: IMusic =
        ctx.request.body;
      const isExist = await musicService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的音乐!` });
        return;
      }
      await musicService.update({
        id,
        name,
        cover_pic,
        audio_url,
        author,
        status,
      });
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    try {
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      const { name, cover_pic, audio_url, author, status }: IMusic =
        ctx.request.body;
      await musicService.create({
        name,
        cover_pic,
        audio_url,
        author,
        status,
      });
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
      const isExist = await musicService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的音乐!` });
        return;
      }
      await musicService.delete(id);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new MusicController();
