import Joi from 'joi';
import { ParameterizedContext } from 'koa';

const schema = Joi.object({
  id: Joi.number(),
  article_id: Joi.number(),
  comment_id: Joi.number(),
  from_user_id: Joi.number(),
  to_user_id: Joi.number(),
});

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  const props = ctx.request.body;
  await schema.validateAsync(props, {
    abortEarly: false,
    allowUnknown: false,
    convert: false, // 如果为true，则尝试将值强制转换为所需类型（例如，将字符串转换为数字）
  });
  await next();
};
