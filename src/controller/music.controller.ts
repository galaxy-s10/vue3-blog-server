import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { IList, IMusic } from '@/interface';
import { CustomError } from '@/model/customError.model';
import musicService from '@/service/music.service';
import { isAdmin } from '@/utils';

class MusicController {
  async getList(ctx: ParameterizedContext, next) {
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

    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await musicService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    const id = +ctx.params.id;
    const { name, cover_pic, audio_url, author, status }: IMusic =
      ctx.request.body;
    const isExist = await musicService.isExist([id]);
    if (!isExist) {
      throw new CustomError(`不存在id为${id}的音乐！`, 400, 400);
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

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(`权限不足！`, 403, 403);
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

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    const id = +ctx.params.id;
    const isExist = await musicService.isExist([id]);
    if (!isExist) {
      throw new CustomError(`不存在id为${id}的音乐！`, 400, 400);
    }
    await musicService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new MusicController();
