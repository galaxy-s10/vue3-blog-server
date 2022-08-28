import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { COMMON_ERR_MSG } from '@/constant';
import { ILog } from '@/interface';
import blacklistService from '@/service/blacklist.service';
import logService from '@/service/log.service';

class LogController {
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
      const result = await logService.getList({
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
      const result = await logService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
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

  async create(ctx: ParameterizedContext, next) {
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
      const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';
      // 这个接口的userInfo不是必须的
      const { userInfo } = await authJwt(ctx);
      const apiNum = await logService.getOneSecondApiNums(ip);
      // 如果在1000毫秒内请求了5次，判断为频繁操作，禁用该ip
      if (apiNum > 5) {
        blacklistService.create({
          user_id: userInfo?.id,
          ip,
          msg: COMMON_ERR_MSG.banIp,
        });
        emitError({
          ctx,
          code: 403,
          error: COMMON_ERR_MSG.banIp,
        });
        return;
      }
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

  async delete(ctx: ParameterizedContext, next) {
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
