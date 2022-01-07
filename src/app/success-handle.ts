import { Context } from 'koa';

const successHandler = ({
  ctx,
  result,
  message,
}: {
  ctx: Context;
  result: any;
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
  ctx.status = status;
  ctx.body = { code: status, result, message: message || defaultMessage };
};

export default successHandler;
