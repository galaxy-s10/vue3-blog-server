import { ParameterizedContext } from 'koa';

import { authJwt } from './auth/authJwt';

import { ALLOW_HTTP_CODE, ERROR_HTTP_CODE, PROJECT_ENV } from '@/constant';
import { CustomError } from '@/model/customError.model';
import logService from '@/service/log.service';
import { isAdmin } from '@/utils';
import { chalkINFO } from '@/utils/chalkTip';

// 全局错误处理中间件
export const catchErrorMiddle = async (ctx: ParameterizedContext, next) => {
  // 这个中间件是第一个中间件，得是异步的，否则直接就next到下一个中间件了
  console.log('catchErrorMiddle中间件');
  const start = Date.now();
  const insertLog = async (info: {
    statusCode: number;
    errorCode: number;
    error: string;
    message: string;
  }) => {
    if (PROJECT_ENV !== 'beta') {
      console.log(chalkINFO('当前不是beta环境，写入日志'));
      // 将请求写入日志表
      const { userInfo } = await authJwt(ctx);
      logService.create({
        user_id: userInfo?.id || -1,
        api_user_agent: ctx.request.headers['user-agent'],
        api_from: isAdmin(ctx) ? 2 : 1,
        api_body: JSON.stringify(ctx.request.body || {}),
        api_query: JSON.stringify(ctx.query),
        api_ip: (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1',
        api_method: ctx.request.method,
        api_hostname: ctx.request.hostname,
        api_path: ctx.request.path,
        api_status_code: info.statusCode,
        api_error: info.error,
        api_err_msg: info.message,
        api_duration: Date.now() - start,
        api_err_code: info.errorCode,
      });
    }
  };
  try {
    console.log('catchErrorMiddle中间件开始...');
    await next();
    console.log(
      chalkINFO(`catchErrorMiddle中间件通过！http状态码：${ctx.status}`)
    );
    const statusCode = ctx.status;
    /**
     * 如果通过了catchErrorMiddle中间件，但是返回的状态不是200，
     * 代表了在next前面没有设置ctx状态码，因此默认就是返回404！
     * 因此业务层必须在next前设置ctx的状态码200，让接口通过catchErrorMiddle中间件，让它返回数据，
     * 或者业务层直接throw new Error或者CustomError，不让这个接口通过catchErrorMiddle中间件，
     * 让catchErrorMiddle中间件判断错误，并且返回错误数据！
     */
    if (
      statusCode !== ALLOW_HTTP_CODE.ok &&
      statusCode !== ALLOW_HTTP_CODE.apiCache
    ) {
      if (statusCode === ALLOW_HTTP_CODE.notFound) {
        const defaultSuccess = {
          statusCode,
          errorCode: ERROR_HTTP_CODE.notFound,
          error: '这个返回了404的http状态码，请排查问题！',
          message: '这个返回了404的http状态码，请排查问题！',
        };
        // 404接口写入日志表
        insertLog(defaultSuccess);
      } else {
        const defaultSuccess = {
          statusCode,
          errorCode: ERROR_HTTP_CODE.errStatusCode,
          error: '返回了即不是200也不是404的http状态码，请排查问题！',
          message: '返回了即不是200也不是404的http状态码，请排查问题！',
        };
        // 既不是200也不是404，写入日志表
        insertLog(defaultSuccess);
      }
      throw new CustomError(
        '返回了即不是200也不是404的http状态码，请排查问题！',
        ALLOW_HTTP_CODE.notFound,
        ALLOW_HTTP_CODE.notFound
      );
    } else {
      const defaultSuccess = {
        statusCode,
        errorCode: statusCode,
        error: '请求成功！',
        message: '请求成功！',
      };
      // 请求成功写入日志表
      insertLog(defaultSuccess);
    }
  } catch (error: any) {
    console.log('catchErrorMiddle中间件捕获到错误！');
    ctx.app.emit('error', error, ctx);
    if (!(error instanceof CustomError)) {
      const defaultError = {
        statusCode: ALLOW_HTTP_CODE.serverError,
        errorCode: ERROR_HTTP_CODE.serverError,
        error: error?.message,
        message: '服务器错误！',
      };
      // 不是CustomError，也写入日志表
      insertLog(defaultError);
      return;
    }
    // 是CustomError，判断errorCode，非法的错误（频繁请求和被禁用）不写入日志
    if (
      ![ERROR_HTTP_CODE.banIp, ERROR_HTTP_CODE.adminDisableUser].includes(
        error.errorCode
      )
    ) {
      insertLog({
        statusCode: error.statusCode,
        error: error.message,
        errorCode: error.errorCode,
        message: error.message,
      });
    }
  }
};

// 跨域中间件
export const corsMiddle = async (ctx, next) => {
  console.log('corsMiddle跨域中间件');
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild'
  );
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method === 'OPTIONS') {
    ctx.body = ALLOW_HTTP_CODE.ok;
  } else {
    await next();
  }
};
