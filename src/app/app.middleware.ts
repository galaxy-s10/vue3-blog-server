import { ParameterizedContext } from 'koa';

import { authJwt } from './auth/authJwt';

import { ERROR_CODE, PROJECT_ENV } from '@/constant';
import { CustomError } from '@/model/customError.model';
import logService from '@/service/log.service';
import { isAdmin } from '@/utils';

// 全局错误处理中间件
export const catchErrorMiddle = async (ctx: ParameterizedContext, next) => {
  // 这个中间件是第一个中间件，得是异步的，否则直接就next到下一个中间件了
  console.log('catchErrorMiddle中间件');
  const start = Date.now();
  const insertLog = async (info: {
    code: number;
    errorCode: number;
    error: string;
    message: string;
  }) => {
    if (PROJECT_ENV === 'prod') {
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
        api_code: info.code,
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
    console.log('catchErrorMiddle中间件通过！');
    const defaultSuccess = {
      code: 200,
      errorCode: 200,
      error: '请求成功！',
      message: '请求成功！',
    };
    // 请求成功写入日志表
    insertLog(defaultSuccess);
  } catch (error: any) {
    console.log('catchErrorMiddle中间件捕获到错误！');
    ctx.app.emit('error', error, ctx);
    if (!(error instanceof CustomError)) {
      const defaultError = {
        code: 500,
        errorCode: 1000,
        error: error.message,
        message: '服务器错误！',
      };
      // 不是CustomError，也写入日志表
      insertLog(defaultError);
      return;
    }
    // 是CustomError，判断errorCode
    if (
      ![ERROR_CODE.banIp, ERROR_CODE.adminDisableUser].includes(error.errorCode)
    ) {
      insertLog({
        code: error.code,
        error: error.message,
        errorCode: error.errorCode,
        message: error.message,
      });
    }
  }
};

// 跨域中间件
export const corsMiddle = async (ctx, next) => {
  console.log('跨域中间件');
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild'
  );
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method === 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
};
