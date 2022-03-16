import Joi from 'joi';
import { Context } from 'koa';

import emitError from '@/app/handler/emit-error';

const schema = Joi.object({
  article_id: Joi.number(),
  comment_id: Joi.number(),
  from_user_id: Joi.number(),
  to_user_id: Joi.number(),
});

export const verifyProp = async (ctx: Context, next) => {
  const props = ctx.request.body;
  try {
    await schema.validateAsync(props, {
      abortEarly: false,
      allowUnknown: false,
      convert: false, // 如果为true，则尝试将值强制转换为所需类型（例如，将字符串转换为数字）
    });
    await next();
  } catch (error) {
    emitError({ ctx, code: 400, error });
  }
};
