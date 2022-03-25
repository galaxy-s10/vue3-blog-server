import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import positionService from '@/service/position.service';
import visitorLogService from '@/service/visitorLog.service';

class VisitorLogController {
  async getHistoryVisitTotal(ctx: ParameterizedContext, next) {
    try {
      const { orderBy = 'asc', orderName = 'ip' } = ctx.request.query;
      const result = await visitorLogService.getHistoryVisitTotal({
        orderBy,
        orderName,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getDayVisitTotal(ctx: ParameterizedContext, next) {
    try {
      const {
        orderBy = 'asc',
        orderName = 'ip',
        startTime,
        endTime,
      } = ctx.request.query;
      const result = await visitorLogService.getDayVisitTotal({
        orderBy,
        orderName,
        startTime,
        endTime,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getIpVisitTotal(ctx: ParameterizedContext, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'ip',
        startTime,
        endTime,
      } = ctx.request.query;
      const result = await visitorLogService.getIpVisitTotal({
        nowPage,
        pageSize,
        orderBy,
        orderName,
        startTime,
        endTime,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const result = await visitorLogService.getList({
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

  async create(ctx: ParameterizedContext, next) {
    try {
      const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';
      const { userInfo } = await authJwt(ctx.request);
      const apiNum = await visitorLogService.getOneSecondApiNums(ip);
      // 如果在1000毫秒内请求了5次，判断为频繁操作，禁用该ip
      if (apiNum > 5) {
        await visitorLogService.update({
          status: -1,
          ip,
          user_id: userInfo?.id || -1,
        });
        emitError({
          ctx,
          code: 403,
          error: '检测到频繁操作，此ip已被禁用，请联系管理员处理!',
        });
      } else if (ip === '127.0.0.1') {
        successHandler({ ctx, data: '开发环境下调用~' });
      } else {
        const ip_data = await positionService.get(ip);
        const result = await visitorLogService.create({
          ip,
          user_id: userInfo?.id || -1,
          ip_data: JSON.stringify(ip_data),
        });
        successHandler({ ctx, data: result });
      }
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await visitorLogService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的访客日志!` });
        return;
      }
      const result = await visitorLogService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new VisitorLogController();
