import { Context } from 'koa';
import logService from '@/service/log.service';
import { authJwt } from '../authJwt';

const successHandler = ({
  ctx,
  data,
  message,
}: {
  ctx: Context;
  data: any;
  message?: string;
}) => {
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
  const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
  authJwt(ctx.request).then((res) => {
    logService.create({
      user_id: res.userInfo?.id || -1,
      api_user_agent: ctx.request.headers['user-agent'],
      api_from: isAdmin ? 2 : 1,
      api_body: JSON.stringify(ctx.request.body || {}),
      api_query: JSON.stringify(ctx.query),
      api_ip: (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1',
      api_method: ctx.request.method,
      api_hostname: ctx.request.hostname,
      api_path: ctx.request.path,
    });
  });
  ctx.status = status;
  ctx.body = { code: status, data, message: message || defaultMessage };
};

export default successHandler;
