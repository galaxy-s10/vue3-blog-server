import { Context } from 'koa';

import emitError from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import { ILog } from '@/interface';
import logService from '@/service/log.service';

class LogController {
  async getList(ctx: Context, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const result = await logService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const result = await logService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const {
        user_id,
        api_user_agent,
        api_from,
        api_ip,
        api_hostname,
        api_method,
        api_path,
        api_query,
        api_body,
        api_err_msg,
        api_err_stack,
      }: ILog = ctx.request.body;
      const isExist = await logService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的日志!` });
        return;
      }
      const result = await logService.update({
        id,
        user_id,
        api_user_agent,
        api_from,
        api_ip,
        api_hostname,
        api_method,
        api_path,
        api_query,
        api_body,
        api_err_msg,
        api_err_stack,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: Context, next) {
    try {
      const {
        user_id,
        api_user_agent,
        api_from,
        api_ip,
        api_hostname,
        api_method,
        api_path,
        api_query,
        api_body,
        api_err_msg,
        api_err_stack,
      }: ILog = ctx.request.body;
      const result = await logService.create({
        user_id,
        api_user_agent,
        api_from,
        api_ip,
        api_hostname,
        api_method,
        api_path,
        api_query,
        api_body,
        api_err_msg,
        api_err_stack,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await logService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的日志!` });
        return;
      }
      const result = await logService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new LogController();
