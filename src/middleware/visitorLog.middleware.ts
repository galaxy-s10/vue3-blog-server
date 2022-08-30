import Joi from 'joi';
import { ParameterizedContext } from 'koa';

const schema = Joi.object({
  user_id: Joi.number(),
  ip: Joi.string().min(3).max(100),
  ip_data: Joi.string().min(3).max(150),
  status: [1, 2],
});

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  const props = ctx.request.body;
  await schema.validateAsync(props, {
    abortEarly: false,
    allowUnknown: false,
    convert: false,
  });
  await next();
};
