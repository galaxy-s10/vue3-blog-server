import Joi from 'joi';
import { Context } from 'koa';

import emitError from '@/app/handler/emit-error';

const schema = Joi.object({
  p_id: Joi.number(),
  auth_name: Joi.string().min(3).max(30),
  auth_description: Joi.string().min(3).max(30),
});

const verifyProp = async (ctx: Context, next) => {
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
