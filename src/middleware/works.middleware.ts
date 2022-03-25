import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';

const schema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  desc: Joi.string().min(3).max(50).required(),
  url: Joi.string().min(5).max(80).required(),
  bg_url: Joi.string().min(5).max(80).required(),
  priority: Joi.number(),
  status: [1, 2],
});

const verifyProp = async (ctx: ParameterizedContext, next) => {
  const props = ctx.request.body;
  try {
    await schema.validateAsync(props, {
      abortEarly: false,
      allowUnknown: false,
      convert: false,
    });
    await next();
  } catch (error) {
    emitError({ ctx, code: 400, error });
  }
};

export { verifyProp };
