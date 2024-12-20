import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE } from '@/constant';
import { IList, IVisitorLog } from '@/interface';
import { CustomError } from '@/model/customError.model';
import positionService from '@/service/position.service';
import visitorLogService from '@/service/visitorLog.service';
import { strSlice } from '@/utils';

class VisitorLogController {
  async getHistoryVisitTotal(ctx: ParameterizedContext, next) {
    const { orderBy = 'asc', orderName = 'ip' } = ctx.request.query;
    const result = await visitorLogService.getHistoryVisitTotal({
      orderBy,
      orderName,
    });

    successHandler({ ctx, data: result });
    await next();
  }

  async getDayVisitTotal(ctx: ParameterizedContext, next) {
    const { orderBy, orderName, startTime, endTime } = ctx.request.query;
    const result = await visitorLogService.getDayVisitTotal({
      orderBy,
      orderName,
      startTime,
      endTime,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async getIpVisitTotal(ctx: ParameterizedContext, next) {
    const {
      nowPage,
      pageSize,
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

    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      user_id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IVisitorLog> = ctx.request.query;
    const result = await visitorLogService.getList({
      id,
      user_id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async getList2(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    }: IList<IVisitorLog> = ctx.request.query;
    const result = await visitorLogService.getList2({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      rangTimeType,
      rangTimeStart,
      rangTimeEnd,
    });
    successHandler({ ctx, data: result });
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const ip = strSlice(String(ctx.request.headers['x-real-ip']), 490);
    // 这个接口的userInfo不是必须的
    const { userInfo } = await authJwt(ctx);
    if (['127.0.0.1', 'localhost', 'undefined'].includes(ip)) {
      successHandler({ ctx, data: `${ip}环境下调用` });
    } else {
      const { page_url }: IVisitorLog = ctx.request.body;
      const ip_data = await positionService.get(ip);
      const user_agent = strSlice(
        String(ctx.request.headers['user-agent']),
        490
      );
      const result = await visitorLogService.create({
        ip: strSlice(ip, 400),
        user_id: userInfo?.id || -1,
        ip_data: strSlice(JSON.stringify(ip_data), 490),
        page_url: strSlice(page_url || '', 490),
        user_agent,
      });
      successHandler({ ctx, data: result });
    }
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await visitorLogService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的访客日志！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await visitorLogService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}

export default new VisitorLogController();
