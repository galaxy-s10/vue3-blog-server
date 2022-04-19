import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { ITheme } from '@/interface';
import themeService from '@/service/theme.service';

class ThemeController {
  async getList(ctx: ParameterizedContext, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        keyWord,
        id,
      }: any = ctx.request.query;
      const result = await themeService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
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
      const result = await themeService.find(id);
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
      const { key, value, model, lang, desc }: ITheme = ctx.request.body;
      const isExist = await themeService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的主题!` });
        return;
      }
      await themeService.update({
        id,
        key,
        value,
        model,
        lang,
        desc,
      });
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    try {
      const { key, value, model, lang, desc }: ITheme = ctx.request.body;
      await themeService.create({
        key,
        value,
        model,
        lang,
        desc,
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
      const isExist = await themeService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的主题!` });
        return;
      }
      await themeService.delete(id);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new ThemeController();
