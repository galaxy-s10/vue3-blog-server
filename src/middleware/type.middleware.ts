import Joi from 'joi';
import { ParameterizedContext } from 'koa';

const schema = Joi.object({
  id: Joi.number(),
  name: Joi.string().min(3).max(30),
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
