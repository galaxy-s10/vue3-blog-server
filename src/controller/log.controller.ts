import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import { ALLOW_HTTP_CODE, COMMON_ERR_MSG } from '@/constant';
import { IList, ILog } from '@/interface';
import { CustomError } from '@/model/customError.model';
import blacklistService from '@/service/blacklist.service';
import logService from '@/service/log.service';

class LogController {
  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
    }: IList<ILog> = ctx.request.query;
    const result = await logService.getList({
      nowPage,
      pageSize,
      orderBy,
      orderName,
      keyWord,
      id,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await logService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
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
      api_status_code,
      api_duration,
      api_err_code,
      api_error,
    }: ILog = ctx.request.body;
    const isExist = await logService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的日志！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
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
      api_status_code,
      api_duration,
      api_err_code,
      api_error,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
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
      api_status_code,
      api_duration,
      api_err_code,
      api_error,
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
      throw new CustomError(
        COMMON_ERR_MSG.banIp,
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
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
      api_status_code,
      api_duration,
      api_err_code,
      api_error,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await logService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的日志！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await logService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}

export default new LogController();
