import { ParameterizedContext } from 'koa';

import { PROJECT_ENV } from '../../constant';
import { authJwt } from '../auth/authJwt';
import { chalkSUCCESS } from '../chalkTip';

import logService from '@/service/log.service';
import { isAdmin } from '@/utils';

const successHandler = ({
  ctx,
  data,
  message,
}: {
  ctx: ParameterizedContext;
  data?: any;
  message?: string;
}) => {
  console.log(chalkSUCCESS(`↓↓↓↓↓↓↓↓↓↓ success-handle ↓↓↓↓↓↓↓↓↓↓`));
  const status = 200;
  const methods = ctx.request.method;
  let defaultMessage;
  switch (methods) {
    case 'GET':
      defaultMessage = '获取成功!';
      break;
    case 'POST':
      defaultMessage = '新增成功!';
      break;
    case 'PUT':
      defaultMessage = '更新成功!';
      break;
    case 'DELETE':
      defaultMessage = '删除成功!';
      break;
    default:
      defaultMessage = '操作成功!';
  }
  ctx.status = status; // 不手动设置状态的话，默认是404，delete方法返回400
  // eslint-disable-next-line no-param-reassign
  if (data && data.sql_duration !== undefined) delete data.sql_duration; // 删除sql执行时间，利于http缓存
  ctx.body = { code: status, data, message: message || defaultMessage };
  console.log(chalkSUCCESS(`↑↑↑↑↑↑↑↑↑↑ success-handle ↑↑↑↑↑↑↑↑↑↑`));

  if (PROJECT_ENV !== 'development') {
    authJwt(ctx.request).then((res) => {
      logService.create({
        user_id: res.userInfo?.id || -1,
        api_user_agent: ctx.request.headers['user-agent'],
        api_sql_duration: data?.sql_duration,
        api_from: isAdmin(ctx) ? 2 : 1,
        api_body: JSON.stringify(ctx.request.body || {}),
        api_query: JSON.stringify(ctx.query),
        api_ip: ctx.request.headers['x-real-ip'] as string,
        api_method: ctx.request.method,
        api_hostname: ctx.request.hostname,
        api_path: ctx.request.path,
      });
    });
  }
};

export default successHandler;
