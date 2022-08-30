import Joi from 'joi';
import { ParameterizedContext } from 'koa';

const schema = Joi.object({
  id: Joi.number(),
  name: Joi.string().min(3).max(50),
  desc: Joi.string().min(3).max(50),
  url: Joi.string().min(5).max(80),
  bg_url: Joi.string().min(5).max(80),
  priority: Joi.number(),
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
